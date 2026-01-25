import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { fs } from '../src/mod.ts';
import { convertFileSystemHandleLikeToStats, createAbortError } from '../src/std/fs/fs_helpers.ts';

// Test directory for all fs operations
const TEST_DIR = '/fs-test';

describe('createAbortError', () => {
    test('creates an Error with name "AbortError"', () => {
        const error = createAbortError();

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('AbortError');
    });

    test('error message is empty by default', () => {
        const error = createAbortError();

        expect(error.message).toBe('');
    });

    test('each call creates a new Error instance', () => {
        const error1 = createAbortError();
        const error2 = createAbortError();

        expect(error1).not.toBe(error2);
        expect(error1.name).toBe(error2.name);
    });
});

describe('convertFileSystemHandleLikeToStats', () => {
    test('converts file handle like to Stats', () => {
        // Mock a file handle like object
        const fileHandleLike = {
            kind: 'file' as const,
            name: 'test.txt',
            size: 100,
            lastModified: 1234567890,
        };

        const stats = convertFileSystemHandleLikeToStats(fileHandleLike);

        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
        expect(stats.size).toBe(100);
        expect(stats.lastModifiedTime).toBe(1234567890);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });

    test('converts directory handle like to Stats', () => {
        // Mock a directory handle like object
        const dirHandleLike = {
            kind: 'directory' as const,
            name: 'test-dir',
        };

        const stats = convertFileSystemHandleLikeToStats(dirHandleLike);

        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
        expect(stats.size).toBe(0);
        expect(stats.lastModifiedTime).toBe(0);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });
});

// Only test functions with additional logic (data transformation)
// Simple wrappers around happy-opfs are covered by happy-opfs itself
describe('fs readDir', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('readDir converts AsyncIterable to string array', async () => {
        const dirPath = `${TEST_DIR}/list-dir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file1.txt`, 'content1');
        await fs.writeFile(`${dirPath}/file2.txt`, 'content2');
        await fs.mkdir(`${dirPath}/subdir`);

        const result = await fs.readDir(dirPath);
        expect(result.isOk()).toBe(true);

        const items = result.unwrap();
        // Verify it returns a plain array (not AsyncIterable)
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(3);
        // Verify items are strings (paths)
        items.forEach(item => {
            expect(typeof item).toBe('string');
        });
    });

    test('readDir returns empty array for empty directory', async () => {
        const dirPath = `${TEST_DIR}/empty-dir`;
        await fs.mkdir(dirPath);

        const result = await fs.readDir(dirPath);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
    });

    test('readDir returns error for non-existent directory', async () => {
        const result = await fs.readDir(`${TEST_DIR}/non-existent`);
        expect(result.isErr()).toBe(true);
    });
});

describe('fs stat', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('stat converts FileSystemHandle to WechatMinigame.Stats for file', async () => {
        const filePath = `${TEST_DIR}/stat-file.txt`;
        await fs.writeFile(filePath, 'stat content');

        const result = await fs.stat(filePath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap();
        // Verify Stats interface methods
        expect(typeof stats.isFile).toBe('function');
        expect(typeof stats.isDirectory).toBe('function');
        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
    });

    test('stat converts FileSystemHandle to WechatMinigame.Stats for directory', async () => {
        const dirPath = `${TEST_DIR}/stat-dir`;
        await fs.mkdir(dirPath);

        const result = await fs.stat(dirPath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap();
        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
    });

    test('stat with recursive option returns FileStats array', async () => {
        const dirPath = `${TEST_DIR}/stat-recursive`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file1.txt`, 'content');
        await fs.writeFile(`${dirPath}/file2.txt`, 'content');

        const result = await fs.stat(dirPath, { recursive: true });
        expect(result.isOk()).toBe(true);

        const statsArr = result.unwrap();
        // Verify it returns an array
        expect(Array.isArray(statsArr)).toBe(true);
        // Should include dir itself + 2 files
        expect(statsArr.length).toBeGreaterThanOrEqual(3);

        // Verify FileStats structure (path + stats)
        statsArr.forEach(item => {
            expect(item).toHaveProperty('path');
            expect(item).toHaveProperty('stats');
            expect(typeof item.stats.isFile).toBe('function');
            expect(typeof item.stats.isDirectory).toBe('function');
        });

        // First item should be the directory itself (relative path is empty)
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('stat with recursive on file returns FileStats array', async () => {
        const filePath = `${ TEST_DIR }/stat-recursive-file`;
        await fs.writeFile(filePath, 'content');

        const result = await fs.stat(filePath, { recursive: true });
        expect(result.isOk()).toBe(true);

        const statsArr = result.unwrap();
        // Verify it returns an array with 1 element
        expect(statsArr.length).toBe(1);
        // First item should be the file itself (relative path is empty)
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isFile()).toBe(true);
    });

    test('stat without recursive on directory returns single Stats', async () => {
        const dirPath = `${TEST_DIR}/stat-no-recursive`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file.txt`, 'content');

        const result = await fs.stat(dirPath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap();
        // Should return single Stats, not array
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isDirectory()).toBe(true);
    });

    test('stat returns error for non-existent path', async () => {
        const result = await fs.stat(`${TEST_DIR}/non-existent`);
        expect(result.isErr()).toBe(true);
    });

    test('statSync converts FileSystemHandleLike to Stats for file', async () => {
        const filePath = `${TEST_DIR}/stat-sync-file.txt`;
        await fs.writeFile(filePath, 'sync stat content');

        const result = fs.statSync(filePath);
        // Sync operations may not be supported in all environments
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const stats = result.unwrap();
        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
        expect(stats.size).toBeGreaterThan(0);
    });

    test('statSync converts FileSystemHandleLike to Stats for directory', async () => {
        const dirPath = `${TEST_DIR}/stat-sync-dir`;
        await fs.mkdir(dirPath);

        const result = fs.statSync(dirPath);
        // Sync operations may not be supported in all environments
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const stats = result.unwrap();
        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
        expect(stats.size).toBe(0);
        expect(stats.lastModifiedTime).toBe(0);
    });

    test('statSync with recursive returns FileStats array with directory entries', async () => {
        const dirPath = `${TEST_DIR}/stat-sync-recursive`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file1.txt`, 'content1');
        await fs.mkdir(`${dirPath}/subdir`);

        const result = fs.statSync(dirPath, { recursive: true });
        // Sync operations may not be supported in all environments
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap();
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBeGreaterThanOrEqual(3);

        // First entry is the directory itself
        expect(statsArr[0].path).toBe(dirPath);
        expect(statsArr[0].stats.isDirectory()).toBe(true);

        // Find the subdir entry
        const subdirEntry = statsArr.find(e => e.path.endsWith('/subdir'));
        expect(subdirEntry).toBeDefined();
        expect(subdirEntry!.stats.isDirectory()).toBe(true);
        expect(subdirEntry!.stats.isFile()).toBe(false);
    });
});

describe('fs writeJsonFile', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('writeJsonFile writes object and readJsonFile reads it back', async () => {
        const filePath = `${TEST_DIR}/config.json`;
        const data = { name: 'test', value: 123, nested: { key: 'value' } };

        const writeResult = await fs.writeJsonFile(filePath, data);
        expect(writeResult.isOk()).toBe(true);

        const readResult = await fs.readJsonFile<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toEqual(data);
    });

    test('writeJsonFile writes array and readJsonFile reads it back', async () => {
        const filePath = `${TEST_DIR}/array.json`;
        const data = [1, 2, 3, { key: 'value' }];

        const writeResult = await fs.writeJsonFile(filePath, data);
        expect(writeResult.isOk()).toBe(true);

        const readResult = await fs.readJsonFile<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toEqual(data);
    });

    test('writeJsonFile writes null and primitive values', async () => {
        const nullPath = `${TEST_DIR}/null.json`;
        const stringPath = `${TEST_DIR}/string.json`;
        const numberPath = `${TEST_DIR}/number.json`;

        await fs.writeJsonFile(nullPath, null);
        await fs.writeJsonFile(stringPath, 'hello');
        await fs.writeJsonFile(numberPath, 42);

        expect((await fs.readJsonFile(nullPath)).unwrap()).toBe(null);
        expect((await fs.readJsonFile(stringPath)).unwrap()).toBe('hello');
        expect((await fs.readJsonFile(numberPath)).unwrap()).toBe(42);
    });

    test('writeJsonFile creates parent directories', async () => {
        const filePath = `${TEST_DIR}/nested/deep/config.json`;
        const data = { created: true };

        const writeResult = await fs.writeJsonFile(filePath, data);
        expect(writeResult.isOk()).toBe(true);

        const readResult = await fs.readJsonFile<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toEqual(data);
    });

    test('writeJsonFileSync writes object and readJsonFileSync reads it back', async () => {
        const filePath = `${TEST_DIR}/sync-config.json`;
        const data = { sync: true, count: 456 };

        // Use async version to write first to ensure directory exists
        await fs.mkdir(TEST_DIR);

        const writeResult = fs.writeJsonFileSync(filePath, data);
        // Sync operations may not be supported in all environments (e.g., main thread without OPFS access token)
        // If it fails, skip this test
        if (writeResult.isErr()) {
            console.warn('writeJsonFileSync not supported in this environment, skipping test');
            return;
        }
        expect(writeResult.isOk()).toBe(true);

        const readResult = fs.readJsonFileSync<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toEqual(data);
    });

    test('writeJsonFileSync writes array and readJsonFileSync reads it back', async () => {
        const filePath = `${TEST_DIR}/sync-array.json`;
        const data = ['a', 'b', 'c'];

        // Use async version to write first to ensure directory exists
        await fs.mkdir(TEST_DIR);

        const writeResult = fs.writeJsonFileSync(filePath, data);
        // Sync operations may not be supported in all environments
        if (writeResult.isErr()) {
            console.warn('writeJsonFileSync not supported in this environment, skipping test');
            return;
        }
        expect(writeResult.isOk()).toBe(true);

        const readResult = fs.readJsonFileSync<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toEqual(data);
    });

    test('writeJsonFile returns error for circular reference', async () => {
        const filePath = `${TEST_DIR}/circular.json`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const circular: any = { name: 'test' };
        circular.self = circular; // Create circular reference

        const result = await fs.writeJsonFile(filePath, circular);
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr().message).toContain('circular');
    });
});
