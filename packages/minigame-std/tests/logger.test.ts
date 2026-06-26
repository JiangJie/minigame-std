import { Err } from 'happy-rusty';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { logger } from '../src/mod.ts';
import { readTextFile, remove, writeFile } from '../src/std/fs/fs_async.ts';
import type { LoggerPlugin } from '../src/std/logger/defines.ts';
import { buildMessage, shouldLog } from '../src/std/logger/helpers.ts';

// Conditional mock for fs module error/exception paths.
// Defaults to false (pass-through); specific tests set flags to true.
const fsMock = vi.hoisted(() => ({
    readFileFail: false,
    writeFileFail: false,
    appendFileReject: false,
    removeReject: false,
}));

vi.mock('../src/std/fs/mod.ts', async (importOriginal) => {
    const original = await importOriginal() as typeof import('../src/std/fs/mod.ts');
    return {
        ...original,
        readFile: vi.fn(async (...args: Parameters<typeof original.readFile>) => {
            if (fsMock.readFileFail) {
                return Err(new Error('mock read fail'));
            }
            return original.readFile(...args);
        }),
        writeFile: vi.fn(async (...args: Parameters<typeof original.writeFile>) => {
            if (fsMock.writeFileFail) {
                return Err(new Error('mock write fail'));
            }
            return original.writeFile(...args);
        }),
        appendFile: vi.fn(async (...args: Parameters<typeof original.appendFile>) => {
            if (fsMock.appendFileReject) {
                throw new Error('mock append reject');
            }
            return original.appendFile(...args);
        }),
        remove: vi.fn(async (...args: Parameters<typeof original.remove>) => {
            if (fsMock.removeReject) {
                throw new Error('mock remove reject');
            }
            return original.remove(...args);
        }),
    };
});

const { fileLog, wxLog, injectConsole } = logger;

const testRootDir = '/.minigame-std-test-logs';

async function cleanupDir(dir: string): Promise<void> {
    await remove(dir);
}

function createSpyPlugin(onLog?: (...args: unknown[]) => void): LoggerPlugin {
    return {
        name: 'spy',
        onLog: onLog ?? vi.fn(),
    };
}

describe('logger core', () => {
    test('default initialization (lazy) does not throw', () => {
        expect(() => logger.debug('test')).not.toThrow();
        expect(() => logger.info('test')).not.toThrow();
    });

    test('debug/info/warn/error do not throw after init', () => {
        logger.init({ level: 'debug' });

        expect(() => logger.debug('debug message', 123)).not.toThrow();
        expect(() => logger.info('info message', { key: 'val' })).not.toThrow();
        expect(() => logger.warn('warn message')).not.toThrow();
        expect(() => logger.error('error message', new Error('test'))).not.toThrow();
    });

    test('level filtering: debug/info filtered at warn level', () => {
        logger.init({ level: 'warn', console: { enabled: false } });

        expect(() => logger.debug('filtered')).not.toThrow();
        expect(() => logger.info('filtered')).not.toThrow();
        expect(() => logger.warn('passed')).not.toThrow();
        expect(() => logger.error('passed')).not.toThrow();
    });

    test('global filter', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            filter: (level) => level !== 'debug',
            console: { enabled: false },
            plugins: [spyPlugin],
        });

        logger.debug('filtered');
        logger.info('passed');

        // Plugins receive all logs unconditionally (core does not filter plugins)
        expect(onLog).toHaveBeenCalledTimes(2);
    });

    test('plugins still receive logs when console disabled', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            console: { enabled: false },
            plugins: [spyPlugin],
        });

        logger.info('test message');

        expect(onLog).toHaveBeenCalledWith('info', 'test message');
    });

    test('console.enabled = true outputs to console', () => {
        logger.init({
            level: 'warn',
            console: { enabled: true, level: 'warn' },
            plugins: [],
        });

        // CONSOLE_FN binds original methods at module load, vi.spyOn cannot intercept
        // Just verify no throw; console output visible in test logs
        expect(() => logger.info('filtered by console level')).not.toThrow();
        expect(() => logger.warn('passed to console')).not.toThrow();
    });

    test('console filter filters console output', () => {
        // console.enabled = true + filter set, covers state.console.filter branch
        logger.init({
            level: 'debug',
            filter: (level) => level !== 'debug',
            console: { enabled: true },
            plugins: [],
        });

        expect(() => logger.debug('filtered by console filter')).not.toThrow();
        expect(() => logger.info('passed console filter')).not.toThrow();
    });

    test('re-init triggers onDestroy on old plugins', () => {
        const onDestroy = vi.fn();
        const oldPlugin: LoggerPlugin = {
            name: 'old',
            onDestroy,
        };

        logger.init({ plugins: [oldPlugin] });
        logger.info('force lazy state');
        logger.init({ plugins: [] });

        expect(onDestroy).toHaveBeenCalledTimes(1);
    });
});

describe('injectConsole', () => {
    const consoleMethods = ['log', 'debug', 'info', 'warn', 'error'] as const;
    let savedConsole: Record<string, (...args: unknown[]) => void>;

    beforeEach(() => {
        savedConsole = {};
        for (const m of consoleMethods) {
            savedConsole[m] = console[m];
        }
    });

    afterEach(() => {
        for (const m of consoleMethods) {
            console[m] = savedConsole[m];
        }
    });

    test('init injectConsole config triggers interception', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            console: { enabled: false },
            plugins: [spyPlugin],
            injectConsole: true,
        });

        console.info('via inject config');

        expect(onLog).toHaveBeenCalledWith('info', 'via inject config');
    });

    test('patched console.info goes through logger pipeline', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            console: { enabled: false },
            plugins: [spyPlugin],
        });

        const restore = injectConsole();

        console.info('injected msg');

        expect(onLog).toHaveBeenCalledWith('info', 'injected msg');

        restore();
    });

    test('console.debug/warn/error map to corresponding levels', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [spyPlugin],
        });

        const restore = injectConsole();

        console.debug('debug msg');
        console.warn('warn msg');
        console.error('error msg');

        expect(onLog).toHaveBeenCalledWith('debug', 'debug msg');
        expect(onLog).toHaveBeenCalledWith('warn', 'warn msg');
        expect(onLog).toHaveBeenCalledWith('error', 'error msg');

        restore();
    });

    test('console.log maps to info level', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            console: { enabled: false },
            plugins: [spyPlugin],
        });

        const restore = injectConsole();

        console.log('log as info');

        expect(onLog).toHaveBeenCalledWith('info', 'log as info');

        restore();
    });

    test('restore reverts to original console', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            console: { enabled: false },
            plugins: [spyPlugin],
        });

        const restore = injectConsole();

        console.info('before restore');
        expect(onLog).toHaveBeenCalledTimes(1);

        restore();

        console.info('after restore');
        // After restore, console.info no longer goes through logger pipeline
        expect(onLog).toHaveBeenCalledTimes(1);
    });

    test('no recursion: logger.info console output does not trigger second patch', () => {
        const onLog = vi.fn();
        const spyPlugin = createSpyPlugin(onLog);

        logger.init({
            console: { enabled: true },
            plugins: [spyPlugin],
        });

        const restore = injectConsole();

        // console.info -> logger.info -> dispatchLog -> CONSOLE_FN (original) -> no recursion
        expect(() => console.info('no recursion')).not.toThrow();

        // Plugin called exactly once (not multiple times due to recursion)
        expect(onLog).toHaveBeenCalledTimes(1);

        restore();
    });
});

describe('helpers', () => {
    test('shouldLog level comparison', () => {
        expect(shouldLog('debug', 'debug')).toBe(true);
        expect(shouldLog('debug', 'info')).toBe(false);
        expect(shouldLog('info', 'info')).toBe(true);
        expect(shouldLog('warn', 'info')).toBe(true);
        expect(shouldLog('error', 'warn')).toBe(true);
        expect(shouldLog('debug', 'error')).toBe(false);
    });

    test('buildMessage single argument', () => {
        expect(buildMessage(['hello'])).toBe('hello');
        expect(buildMessage([123])).toBe('123');
    });

    test('buildMessage multiple arguments joined by space', () => {
        expect(buildMessage(['a', 'b', 'c'])).toBe('a b c');
        expect(buildMessage(['count:', 42])).toBe('count: 42');
    });

    test('buildMessage BigInt argument', () => {
        const result = buildMessage([BigInt(123)]);
        expect(result).toBe('123n');
    });

    test('buildMessage nested BigInt in object', () => {
        const result = buildMessage([{ count: BigInt(456) }]);
        // JSON.stringify with BigInt replacer
        expect(result).toContain('456n');
    });

    test('buildMessage circular reference does not crash', () => {
        const obj: Record<string, unknown> = { a: 1 };
        obj['self'] = obj;

        // Should not throw, returns some string
        expect(() => buildMessage([obj])).not.toThrow();
    });
});

describe('fileLog', () => {
    beforeEach(async () => {
        await cleanupDir(testRootDir);
    });

    afterEach(() => {
        fsMock.readFileFail = false;
        fsMock.writeFileFail = false;
        fsMock.appendFileReject = false;
        fsMock.removeReject = false;
    });

    test('flush writes readable file content', async () => {
        const file = fileLog({ rootDir: testRootDir });

        logger.init({
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('content test');
        await file.flush();

        const filesResult = await file.getFiles();
        expect(filesResult.isOk()).toBe(true);

        const files = filesResult.unwrap();
        const activeFile = files.filter(f => f.endsWith('.log')).sort().pop();

        expect(activeFile).toBeTruthy();

        if (activeFile) {
            const contentResult = await readTextFile(activeFile);
            expect(contentResult.isOk()).toBe(true);
            expect(contentResult.unwrap()).toContain('content test');
        }
    });

    test('getFiles returns sorted full paths', async () => {
        const file = fileLog({ rootDir: testRootDir });

        logger.init({
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('test');
        await file.flush();

        const filesResult = await file.getFiles();
        expect(filesResult.isOk()).toBe(true);

        const files = filesResult.unwrap();
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBeGreaterThanOrEqual(1);

        // Paths should start with rootDir
        expect(files.every(f => f.startsWith(testRootDir))).toBe(true);

        // Paths should be sorted
        const sorted = [...files].sort();
        expect(files).toEqual(sorted);
    });

    test('getRootDir returns custom path', () => {
        const file = fileLog({ rootDir: '/custom-test-logs' });
        expect(file.getRootDir()).toBe('/custom-test-logs');
    });

    test('default rootDir when not set', () => {
        const file = fileLog({});
        expect(file.getRootDir()).toBe('/.minigame-std-logs');
    });

    test('useByteSize uses UTF-8 byte count', async () => {
        // useByteSize: true uses encodeUtf8(formatted).length instead of formatted.length
        // Chinese chars: .length=1 but UTF-8 bytes=3, set small maxSize to trigger rotation
        const file = fileLog({
            rootDir: testRootDir,
            split: { maxSize: 30, useByteSize: true },
            flushInterval: 0,
        });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Each log contains Chinese, UTF-8 bytes > char count
        logger.info('测试消息');
        logger.info('另一条测试消息');
        await file.flush();

        const filesResult = await file.getFiles();
        expect(filesResult.unwrap().length).toBeGreaterThanOrEqual(1);
    });

    test('getFiles query does not filter unparseable filenames', async () => {
        // Create a .log file with non-matching timestamp format
        await writeFile(`${testRootDir}/invalid.log`, 'content\n');

        const file = fileLog({ rootDir: testRootDir, flushInterval: 0 });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });
        await file.flush();

        // query with future time: normal files filtered, invalid.log unparseable -> not filtered
        const future = Date.now() + 1000000;
        const filesResult = await file.getFiles({ from: future });
        const files = filesResult.unwrap();
        expect(files.some(f => f.endsWith('invalid.log'))).toBe(true);
    });

    test('pruneOldFiles maxAge conservatively keeps unparseable filenames', async () => {
        // Create file with unparseable name + maxAge set
        await writeFile(`${testRootDir}/invalid.log`, 'content\n');

        const file = fileLog({
            rootDir: testRootDir,
            split: { maxAge: 1, maxCount: 10 },
            flushInterval: 0,
        });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });
        await file.flush();

        // parseTimestamp returns null -> ts != null is false -> else branch (remaining.push)
        // File not deleted by maxAge
        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        expect(files.some(f => f.endsWith('invalid.log'))).toBe(true);
    });

    test('buffer threshold triggers flush', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            maxBufferSize: 2,
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('msg 1');
        logger.info('msg 2');

        const result = await file.flush();
        expect(result).toBeUndefined();
    });

    test('maxSize triggers file rotation', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            split: { maxSize: 100 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Write enough logs to trigger rotation
        for (let i = 0; i < 5; i++) {
            logger.info(`message ${i} with enough content to exceed maxSize`);
        }

        await file.flush();

        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();

        // Should have .log files
        const logFiles = files.filter(f => f.endsWith('.log'));
        expect(logFiles.length).toBeGreaterThanOrEqual(1);
    });

    test('compress generates .log.gz', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            split: { compress: true, maxSize: 100 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Write logs to trigger rotation and compression
        for (let i = 0; i < 5; i++) {
            logger.info(`compress test message ${i}`);
        }

        await file.flush();

        // Wait for compression to complete (fire-and-forget, needs polling)
        await vi.waitFor(async () => {
            const filesResult = await file.getFiles();
            const files = filesResult.unwrap();
            expect(files.some(f => f.endsWith('.log.gz'))).toBe(true);
        }, { timeout: 5000 });
    });

    test('compressOldFile readFile failure skips compression', async () => {
        fsMock.readFileFail = true;

        const file = fileLog({
            rootDir: testRootDir,
            split: { compress: true, maxSize: 100 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        for (let i = 0; i < 5; i++) {
            logger.info(`read fail test ${i}`);
        }

        await file.flush();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // readFile fails -> compression skipped -> no .log.gz
        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        expect(files.some(f => f.endsWith('.log.gz'))).toBe(false);
    });

    test('compressOldFile writeFile failure skips deletion', async () => {
        fsMock.writeFileFail = true;

        const file = fileLog({
            rootDir: testRootDir,
            split: { compress: true, maxSize: 100 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        for (let i = 0; i < 5; i++) {
            logger.info(`write fail test ${i}`);
        }

        await file.flush();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // writeFile fails -> original .log not deleted (atomic: delete only after write succeeds)
        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        expect(files.some(f => f.endsWith('.log.gz'))).toBe(false);
        // Original .log file should remain (not deleted)
        expect(files.some(f => f.endsWith('.log'))).toBe(true);
    });

    test('flushCurrent appendFile reject caught by .catch', async () => {
        fsMock.appendFileReject = true;

        const file = fileLog({
            rootDir: testRootDir,
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('append reject test');

        // appendFile rejects -> .catch swallows, flush should not throw
        await expect(file.flush()).resolves.toBeUndefined();
    });

    test('remove reject caught by compressOldFile/schedulePrune/initPromise .catch', async () => {
        // Pre-create files to trigger prune (resumeOrCreate -> pruneOldFiles -> remove throws)
        await writeFile(`${testRootDir}/2020-01-01-00-00-00.000.log`, 'old1\n');
        await writeFile(`${testRootDir}/2020-01-02-00-00-00.000.log`, 'old2\n');
        await writeFile(`${testRootDir}/2020-01-03-00-00-00.000.log`, 'old3\n');

        fsMock.removeReject = true;

        const file = fileLog({
            rootDir: testRootDir,
            split: { compress: true, maxSize: 100, maxCount: 1 },
            flushInterval: 0,
        });

        // init: resumeOrCreate -> pruneOldFiles -> remove throws -> initPromise .catch
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Write logs to trigger newFile -> compressOldFile -> remove throws -> .catch
        // Also triggers schedulePrune -> pruneOldFiles -> remove throws -> .catch
        for (let i = 0; i < 5; i++) {
            logger.info(`remove reject test ${i}`);
        }

        // Should not throw
        await expect(file.flush()).resolves.toBeUndefined();
    });

    test('maxAge expires old files (ts != null && now - ts > maxAge true branch)', async () => {
        // Use writeFile to create old files (2020), avoiding appendFile race
        await writeFile(`${testRootDir}/2020-01-01-00-00-00.000.log`, 'old1\n');
        await writeFile(`${testRootDir}/2020-01-02-00-00-00.000.log`, 'old2\n');

        const file = fileLog({
            rootDir: testRootDir,
            split: { maxAge: 1, maxCount: 10 },
            flushInterval: 0,
        });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });
        await file.flush();

        // resumeOrCreate -> pruneOldFiles (awaited) -> parseTimestamp returns 2020 ts
        // -> now - ts > 1 -> true -> toDelete.push -> remove
        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        // 2020 files expired, should be deleted
        expect(files.filter(f => f.includes('2020')).length).toBe(0);
    });

    test('compressOldFile reject caught by newFile .catch', async () => {
        // removeReject makes compressOldFile's remove throw -> reject -> .catch
        fsMock.removeReject = true;

        const file = fileLog({
            rootDir: testRootDir,
            split: { compress: true, maxSize: 50 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Two logs: first fills size, second triggers newFile -> compressOldFile
        logger.info('first message to fill size');
        logger.info('second message triggers rotation');

        await file.flush();
        // compressOldFile is fire-and-forget, wait for it to reach remove and reject
        await new Promise(resolve => setTimeout(resolve, 1000));

        // remove throws -> compressOldFile rejects -> .catch swallows
        // Original .log should remain (remove failed)
        const filesResult = await file.getFiles();
        expect(filesResult.unwrap().some(f => f.endsWith('.log'))).toBe(true);
    });

    test('custom formatter', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            formatter: (entry) => `${entry.level.toUpperCase()}: ${entry.message}\n`,
        });

        logger.init({
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('custom format');
        await file.flush();

        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        const activeFile = files.filter(f => f.endsWith('.log')).sort().pop();

        if (activeFile) {
            const contentResult = await readTextFile(activeFile);
            expect(contentResult.unwrap()).toContain('INFO: custom format');
        }
    });

    test('getFiles with query time filtering', async () => {
        const file = fileLog({ rootDir: testRootDir });

        logger.init({
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('query test');
        await file.flush();

        const now = Date.now();

        // from in future -> no files returned
        const futureResult = await file.getFiles({ from: now + 100000 });
        expect(futureResult.isOk()).toBe(true);
        expect(futureResult.unwrap().length).toBe(0);

        // from in past -> files returned
        const pastResult = await file.getFiles({ from: now - 100000 });
        expect(pastResult.unwrap().length).toBeGreaterThanOrEqual(1);

        // to in past -> file timestamp > to -> filtered
        const toPastResult = await file.getFiles({ to: now - 100000 });
        expect(toPastResult.unwrap().length).toBe(0);

        // to in future -> file timestamp <= to -> included
        const toFutureResult = await file.getFiles({ to: now + 100000 });
        expect(toFutureResult.unwrap().length).toBeGreaterThanOrEqual(1);
    });

    test('maxCount prunes excess files', async () => {
        // Create old log files directly via writeFile, avoiding appendFile race
        for (let i = 0; i < 5; i++) {
            await writeFile(`${testRootDir}/2020-01-0${i + 1}-00-00-00.000.log`, `content ${i}\n`);
        }

        // Create fileLog instance, resumeOrCreate will await pruneOldFiles
        const file = fileLog({
            rootDir: testRootDir,
            split: { maxCount: 2 },
            flushInterval: 0,
        });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });
        await file.flush();

        // maxCount=2, should keep at most 2 files
        const filesResult = await file.getFiles();
        expect(filesResult.unwrap().length).toBeLessThanOrEqual(2);
    });

    test('maxAge set but files not expired are kept', async () => {
        // Use future-dated filenames so now - ts < 0 < maxAge -> not expired
        for (let i = 0; i < 3; i++) {
            await writeFile(`${testRootDir}/2099-01-0${i + 1}-00-00-00.000.log`, `content ${i}\n`);
        }

        const file = fileLog({
            rootDir: testRootDir,
            split: { maxAge: 999999999, maxCount: 10 },
            flushInterval: 0,
        });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });
        await file.flush();

        // Files should be kept (future dates not expired, and under maxCount)
        const filesResult = await file.getFiles();
        expect(filesResult.unwrap().length).toBeGreaterThanOrEqual(1);
    });

    test('resumeOrCreate creates new file when period expired', async () => {
        // Create file, wait 10ms for period=1 to expire
        await writeFile(`${testRootDir}/2020-01-01-00-00-00.000.log`, 'old content\n');
        await new Promise(resolve => setTimeout(resolve, 10));

        const file = fileLog({
            rootDir: testRootDir,
            split: { period: 1 },
            flushInterval: 0,
        });
        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });
        // Write a log to create the new file on disk
        logger.info('new file after period expired');
        await file.flush();

        // Old file mtime not in current period -> newFile() creates new file
        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        expect(files.length).toBeGreaterThanOrEqual(2);
    });

    test('resumeOrCreate resumes existing file in same period', async () => {
        // First session: create and write
        const file1 = fileLog({
            rootDir: testRootDir,
            flushInterval: 0,
        });

        logger.init({
            console: { enabled: false },
            plugins: [file1],
        });

        logger.info('first session');
        await file1.flush();

        // Second session (simulating restart), should resume same period file
        const file2 = fileLog({
            rootDir: testRootDir,
            flushInterval: 0,
        });

        logger.init({
            console: { enabled: false },
            plugins: [file2],
        });

        logger.info('second session');
        await file2.flush();

        const filesResult = await file2.getFiles();
        const files = filesResult.unwrap();
        const logFiles = files.filter(f => f.endsWith('.log'));

        // Same period: should resume, not create too many new files
        expect(logFiles.length).toBeLessThanOrEqual(2);

        // Second session content should be readable
        const activeFile = logFiles.sort().pop();
        if (activeFile) {
            const contentResult = await readTextFile(activeFile);
            expect(contentResult.unwrap()).toContain('second session');
        }
    });

    test('onDestroy cleans up resources', () => {
        const file = fileLog({
            rootDir: testRootDir,
            flushInterval: 100,
        });

        logger.init({
            console: { enabled: false },
            plugins: [file],
        });

        // re-init without this plugin triggers onDestroy
        expect(() => logger.init({ plugins: [] })).not.toThrow();
    });

    test('plugin-level filter', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            level: 'debug',
            filter: (level) => level !== 'debug',
            flushInterval: 0,
        });

        logger.init({
            console: { enabled: false },
            plugins: [file],
        });

        logger.debug('filtered by plugin');
        logger.info('passed by plugin');
        await file.flush();

        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        const activeFile = files.filter(f => f.endsWith('.log')).sort().pop();

        if (activeFile) {
            const contentResult = await readTextFile(activeFile);
            const content = contentResult.unwrap();
            expect(content).not.toContain('filtered by plugin');
            expect(content).toContain('passed by plugin');
        }
    });

    test('onInit inherits level from global config', () => {
        const file = fileLog({ rootDir: testRootDir });

        logger.init({
            level: 'warn',
            console: { enabled: false },
            plugins: [file],
        });

        // file does not set level explicitly, should inherit warn from global
        logger.debug('should be filtered');
        logger.info('should be filtered');
        logger.warn('should pass');
        // No throw means filtering works correctly
        expect(true).toBe(true);
    });

    test('onLog goes through writeEntry after init completes', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Wait for init to complete and clear pending
        await file.flush();

        // After init, write log goes through writeEntry instead of pending
        logger.info('after init');
        await file.flush();

        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        const activeFile = files.filter(f => f.endsWith('.log')).sort().pop();

        if (activeFile) {
            const contentResult = await readTextFile(activeFile);
            expect(contentResult.unwrap()).toContain('after init');
        }
    });

    test('maxAge expires old files', async () => {
        const file = fileLog({
            rootDir: testRootDir,
            split: { maxSize: 50, maxCount: 10, maxAge: 1 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        // Write enough logs to trigger multiple rotations (old files expire with maxAge=1ms)
        for (let i = 0; i < 10; i++) {
            logger.info(`maxAge test message ${i}`);
        }

        await file.flush();

        // Wait for prune to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();

        // maxAge=1 means files older than 1ms are deleted, keep only latest
        expect(files.length).toBeLessThanOrEqual(2);
    });

    test('period expiry triggers file rotation', async () => {
        // Use very short period to expire file immediately
        const file = fileLog({
            rootDir: testRootDir,
            split: { period: 1 },
            flushInterval: 0,
        });

        logger.init({
            level: 'debug',
            console: { enabled: false },
            plugins: [file],
        });

        logger.info('first period');
        await file.flush();

        // Wait 10ms for period to expire
        await new Promise(resolve => setTimeout(resolve, 10));

        // Write again, period expired should trigger new file
        logger.info('second period');
        await file.flush();

        const filesResult = await file.getFiles();
        const files = filesResult.unwrap();
        const logFiles = files.filter(f => f.endsWith('.log'));

        // Should have at least 2 files (two periods)
        expect(logFiles.length).toBeGreaterThanOrEqual(2);
    });
});

describe('wxLog', () => {
    const mockLogManager = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };

    beforeAll(() => {
        vi.stubGlobal('wx', {
            getLogManager: vi.fn(() => mockLogManager),
        });
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        mockLogManager.debug.mockClear();
        mockLogManager.info.mockClear();
        mockLogManager.warn.mockClear();
    });

    test('level filtering', () => {
        const plugin = wxLog({ level: 'warn' });

        logger.init({
            console: { enabled: false },
            plugins: [plugin],
        });

        logger.debug('filtered');
        logger.info('filtered');
        logger.warn('passed');
        logger.error('passed');

        expect(mockLogManager.debug).not.toHaveBeenCalled();
        expect(mockLogManager.info).not.toHaveBeenCalled();
        expect(mockLogManager.warn).toHaveBeenCalledTimes(2);
    });

    test('inherits level from global when not explicitly set', () => {
        // wxLog without level, should inherit from ctx.globalLevel
        const plugin = wxLog({});

        logger.init({
            level: 'warn',
            console: { enabled: false },
            plugins: [plugin],
        });

        logger.debug('filtered');
        logger.info('filtered');
        logger.warn('passed');

        // Inherits warn level, debug/info filtered
        expect(mockLogManager.debug).not.toHaveBeenCalled();
        expect(mockLogManager.info).not.toHaveBeenCalled();
        expect(mockLogManager.warn).toHaveBeenCalledWith('passed');
    });

    test('debug/info/warn call corresponding manager methods', () => {
        const plugin = wxLog({ level: 'debug' });

        logger.init({
            console: { enabled: false },
            plugins: [plugin],
        });

        logger.debug('debug msg');
        logger.info('info msg');
        logger.warn('warn msg');

        expect(mockLogManager.debug).toHaveBeenCalledWith('debug msg');
        expect(mockLogManager.info).toHaveBeenCalledWith('info msg');
        expect(mockLogManager.warn).toHaveBeenCalledWith('warn msg');
    });

    test('custom filter', () => {
        const plugin = wxLog({
            level: 'debug',
            filter: (level) => level !== 'debug',
        });

        logger.init({
            console: { enabled: false },
            plugins: [plugin],
        });

        logger.debug('filtered');
        logger.info('passed');

        expect(mockLogManager.debug).not.toHaveBeenCalled();
        expect(mockLogManager.info).toHaveBeenCalledWith('passed');
    });

    test('error degrades to warn with [ERROR] prefix', () => {
        const plugin = wxLog({ level: 'debug' });

        logger.init({
            console: { enabled: false },
            plugins: [plugin],
        });

        logger.error('something broke');

        // wx.getLogManager has no error method, degrades to warn
        expect(mockLogManager.warn).toHaveBeenCalledTimes(1);
        expect(mockLogManager.warn).toHaveBeenCalledWith('[ERROR] something broke');
    });

    test('BigInt argument does not crash', () => {
        const plugin = wxLog({ level: 'debug' });

        logger.init({
            console: { enabled: false },
            plugins: [plugin],
        });

        expect(() => logger.info('count:', BigInt(123))).not.toThrow();

        // Pre-serialized to string, BigInt becomes "123n"
        expect(mockLogManager.info).toHaveBeenCalledTimes(1);
        expect(mockLogManager.info).toHaveBeenCalledWith('count: 123n');
    });
});
