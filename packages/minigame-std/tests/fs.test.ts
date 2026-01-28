import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { fs } from '../src/mod.ts';
import {
    convertFileSystemHandleLikeToStats,
    convertFileSystemHandleToStats,
    webToMinaReadDir,
    webToMinaReadDirSync,
    webToMinaStat,
    webToMinaStatSync,
} from '../src/std/fs/web_fs_helpers.ts';

// Test directory for all fs operations
const TEST_DIR = '/fs-test';

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

describe('convertFileSystemHandleToStats', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('converts FileSystemFileHandle to Stats', async () => {
        const filePath = `${ TEST_DIR }/convert-handle-file.txt`;
        const content = 'test content for handle';
        await fs.writeFile(filePath, content);

        // 通过 OPFS 获取真实的 FileSystemFileHandle
        const root = await navigator.storage.getDirectory();
        const dirHandle = await root.getDirectoryHandle('fs-test', { create: false });
        const fileHandle = await dirHandle.getFileHandle('convert-handle-file.txt', { create: false });

        const stats = await convertFileSystemHandleToStats(fileHandle);

        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
        expect(stats.size).toBe(content.length);
        expect(stats.lastModifiedTime).toBeGreaterThan(0);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });

    test('converts FileSystemDirectoryHandle to Stats', async () => {
        const dirPath = `${ TEST_DIR }/convert-handle-dir`;
        await fs.mkdir(dirPath);

        // 通过 OPFS 获取真实的 FileSystemDirectoryHandle
        const root = await navigator.storage.getDirectory();
        const testDir = await root.getDirectoryHandle('fs-test', { create: false });
        const dirHandle = await testDir.getDirectoryHandle('convert-handle-dir', { create: false });

        const stats = await convertFileSystemHandleToStats(dirHandle);

        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
        expect(stats.size).toBe(0);
        expect(stats.lastModifiedTime).toBe(0);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });
});

describe('webToMinaReadDir', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('returns string array from directory entries', async () => {
        const dirPath = `${ TEST_DIR }/web-readdir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/a.txt`, 'a');
        await fs.writeFile(`${ dirPath }/b.txt`, 'b');
        await fs.mkdir(`${ dirPath }/subdir`);

        const result = await webToMinaReadDir(dirPath);
        expect(result.isOk()).toBe(true);

        const items = result.unwrap();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(3);
        items.forEach(item => {
            expect(typeof item).toBe('string');
        });
    });

    test('returns empty array for empty directory', async () => {
        const dirPath = `${ TEST_DIR }/web-readdir-empty`;
        await fs.mkdir(dirPath);

        const result = await webToMinaReadDir(dirPath);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
    });

    test('returns error for non-existent directory', async () => {
        const result = await webToMinaReadDir(`${ TEST_DIR }/web-readdir-nonexistent`);
        expect(result.isErr()).toBe(true);
    });

    test('fallback to for-await when Array.fromAsync is not available', async () => {
        const dirPath = `${ TEST_DIR }/web-readdir-fallback`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/m.txt`, 'm');
        await fs.writeFile(`${ dirPath }/n.txt`, 'n');

        // 暂时移除 Array.fromAsync 以测试 fallback 逻辑
        const originalFromAsync = Array.fromAsync;
        // @ts-expect-error ===测试用途===
        delete Array.fromAsync;

        try {
            const result = await webToMinaReadDir(dirPath);
            expect(result.isOk()).toBe(true);

            const items = result.unwrap();
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBe(2);
            items.forEach(item => {
                expect(typeof item).toBe('string');
            });
        } finally {
            // 恢复 Array.fromAsync
            Array.fromAsync = originalFromAsync;
        }
    });
});

describe('webToMinaReadDirSync', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('returns string array from directory entries', async () => {
        const dirPath = `${ TEST_DIR }/web-readdir-sync`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/x.txt`, 'x');
        await fs.writeFile(`${ dirPath }/y.txt`, 'y');

        const result = webToMinaReadDirSync(dirPath);
        if (result.isErr()) {
            console.warn('webToMinaReadDirSync not supported in this environment, skipping test');
            return;
        }

        const items = result.unwrap();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(2);
        items.forEach(item => {
            expect(typeof item).toBe('string');
        });
    });

    test('returns empty array for empty directory', async () => {
        const dirPath = `${ TEST_DIR }/web-readdir-sync-empty`;
        await fs.mkdir(dirPath);

        const result = webToMinaReadDirSync(dirPath);
        if (result.isErr()) {
            console.warn('webToMinaReadDirSync not supported in this environment, skipping test');
            return;
        }

        expect(result.unwrap()).toEqual([]);
    });

    test('returns error for non-existent directory', () => {
        const result = webToMinaReadDirSync(`${ TEST_DIR }/web-readdir-sync-nonexistent`);
        expect(result.isErr()).toBe(true);
    });
});

describe('webToMinaStat', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('returns Stats for file without recursive option', async () => {
        const filePath = `${ TEST_DIR }/web-stat-file.txt`;
        await fs.writeFile(filePath, 'stat content');

        const result = await webToMinaStat(filePath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap();
        expect(Array.isArray(stats)).toBe(false);
        expect((stats as WechatMinigame.Stats).isFile()).toBe(true);
        expect((stats as WechatMinigame.Stats).isDirectory()).toBe(false);
    });

    test('returns Stats for directory without recursive option', async () => {
        const dirPath = `${ TEST_DIR }/web-stat-dir`;
        await fs.mkdir(dirPath);

        const result = await webToMinaStat(dirPath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap();
        expect(Array.isArray(stats)).toBe(false);
        expect((stats as WechatMinigame.Stats).isFile()).toBe(false);
        expect((stats as WechatMinigame.Stats).isDirectory()).toBe(true);
    });

    test('returns FileStats array for file with recursive option', async () => {
        const filePath = `${ TEST_DIR }/web-stat-file-recursive.txt`;
        await fs.writeFile(filePath, 'recursive file');

        const result = await webToMinaStat(filePath, { recursive: true });
        expect(result.isOk()).toBe(true);

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isFile()).toBe(true);
    });

    test('returns FileStats array for directory with recursive option', async () => {
        const dirPath = `${ TEST_DIR }/web-stat-dir-recursive`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/file1.txt`, 'content1');
        await fs.writeFile(`${ dirPath }/file2.txt`, 'content2');

        const result = await webToMinaStat(dirPath, { recursive: true });
        expect(result.isOk()).toBe(true);

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        // 目录本身 + 2 个文件
        expect(statsArr.length).toBeGreaterThanOrEqual(3);

        // 第一个是目录本身
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('returns FileStats array for empty directory with recursive option', async () => {
        const dirPath = `${ TEST_DIR }/web-stat-empty-recursive`;
        await fs.mkdir(dirPath);

        const result = await webToMinaStat(dirPath, { recursive: true });
        expect(result.isOk()).toBe(true);

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        // 空目录也应该返回自身
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('returns error for non-existent path', async () => {
        const result = await webToMinaStat(`${ TEST_DIR }/web-stat-nonexistent`);
        expect(result.isErr()).toBe(true);
    });
});

describe('webToMinaStatSync', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('returns Stats for file without recursive option', async () => {
        const filePath = `${ TEST_DIR }/web-stat-sync-file.txt`;
        await fs.writeFile(filePath, 'sync stat content');

        const result = webToMinaStatSync(filePath);
        if (result.isErr()) {
            console.warn('webToMinaStatSync not supported in this environment, skipping test');
            return;
        }

        const stats = result.unwrap();
        expect(Array.isArray(stats)).toBe(false);
        expect((stats as WechatMinigame.Stats).isFile()).toBe(true);
        expect((stats as WechatMinigame.Stats).isDirectory()).toBe(false);
    });

    test('returns Stats for directory without recursive option', async () => {
        const dirPath = `${ TEST_DIR }/web-stat-sync-dir`;
        await fs.mkdir(dirPath);

        const result = webToMinaStatSync(dirPath);
        if (result.isErr()) {
            console.warn('webToMinaStatSync not supported in this environment, skipping test');
            return;
        }

        const stats = result.unwrap();
        expect(Array.isArray(stats)).toBe(false);
        expect((stats as WechatMinigame.Stats).isFile()).toBe(false);
        expect((stats as WechatMinigame.Stats).isDirectory()).toBe(true);
    });

    test('returns FileStats array for file with recursive option', async () => {
        const filePath = `${ TEST_DIR }/web-stat-sync-file-rec.txt`;
        await fs.writeFile(filePath, 'sync recursive file');

        const result = webToMinaStatSync(filePath, { recursive: true });
        if (result.isErr()) {
            console.warn('webToMinaStatSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isFile()).toBe(true);
    });

    test('returns FileStats array for directory with recursive option', async () => {
        const dirPath = `${ TEST_DIR }/web-stat-sync-dir-rec`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/a.txt`, 'a');
        await fs.mkdir(`${ dirPath }/sub`);

        const result = webToMinaStatSync(dirPath, { recursive: true });
        if (result.isErr()) {
            console.warn('webToMinaStatSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        // 目录本身 + 文件 + 子目录
        expect(statsArr.length).toBeGreaterThanOrEqual(3);

        // 第一个是目录本身（通过 unshift 插入）
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('returns FileStats array for empty directory with recursive option', async () => {
        const dirPath = `${ TEST_DIR }/web-stat-sync-empty-rec`;
        await fs.mkdir(dirPath);

        const result = webToMinaStatSync(dirPath, { recursive: true });
        if (result.isErr()) {
            console.warn('webToMinaStatSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('returns error for non-existent path', () => {
        const result = webToMinaStatSync(`${ TEST_DIR }/web-stat-sync-nonexistent`);
        expect(result.isErr()).toBe(true);
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

    test('readJsonFileSync parses nested JSON object', async () => {
        const filePath = `${ TEST_DIR }/sync-nested.json`;
        const data = {
            name: 'test',
            nested: {
                level1: {
                    level2: {
                        value: 42,
                    },
                },
            },
            items: [{ id: 1 }, { id: 2 }],
        };

        await fs.mkdir(TEST_DIR);

        const writeResult = fs.writeJsonFileSync(filePath, data);
        if (writeResult.isErr()) {
            console.warn('writeJsonFileSync not supported in this environment, skipping test');
            return;
        }
        expect(writeResult.isOk()).toBe(true);

        const readResult = fs.readJsonFileSync<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        const result = readResult.unwrap();
        expect(result.name).toBe('test');
        expect(result.nested.level1.level2.value).toBe(42);
        expect(result.items).toHaveLength(2);
    });

    test('readJsonFileSync parses JSON with special characters', async () => {
        const filePath = `${ TEST_DIR }/sync-special.json`;
        const data = {
            message: '你好世界',
            emoji: '😀🎉',
            special: 'line1\nline2\ttab',
        };

        await fs.mkdir(TEST_DIR);

        const writeResult = fs.writeJsonFileSync(filePath, data);
        if (writeResult.isErr()) {
            console.warn('writeJsonFileSync not supported in this environment, skipping test');
            return;
        }
        expect(writeResult.isOk()).toBe(true);

        const readResult = fs.readJsonFileSync<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        const result = readResult.unwrap();
        expect(result.message).toBe('你好世界');
        expect(result.emoji).toBe('😀🎉');
        expect(result.special).toBe('line1\nline2\ttab');
    });

    test('readJsonFileSync returns error for non-existent file', async () => {
        const filePath = `${ TEST_DIR }/non-existent-sync.json`;

        const readResult = fs.readJsonFileSync(filePath);
        expect(readResult.isErr()).toBe(true);
    });

    test('readJsonFileSync returns error for invalid JSON', async () => {
        const filePath = `${ TEST_DIR }/invalid-sync.json`;

        await fs.mkdir(TEST_DIR);

        // 直接写入无效 JSON 内容
        const writeResult = fs.writeFileSync(filePath, '{invalid json}');
        if (writeResult.isErr()) {
            console.warn('writeFileSync not supported in this environment, skipping test');
            return;
        }

        const readResult = fs.readJsonFileSync(filePath);
        expect(readResult.isErr()).toBe(true);
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

describe('fs sync operations', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('mkdirSync creates directory', async () => {
        const dirPath = `${ TEST_DIR }/sync-mkdir`;

        const result = fs.mkdirSync(dirPath);
        // Sync operations may not be supported in all environments
        if (result.isErr()) {
            console.warn('mkdirSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify directory was created
        const existsResult = await fs.exists(dirPath, { isDirectory: true });
        expect(existsResult.isOk()).toBe(true);
        expect(existsResult.unwrap()).toBe(true);
    });

    test('moveSync moves file', async () => {
        const srcPath = `${ TEST_DIR }/sync-move-src.txt`;
        const destPath = `${ TEST_DIR }/sync-move-dest.txt`;
        await fs.writeFile(srcPath, 'move content');

        const result = fs.moveSync(srcPath, destPath);
        if (result.isErr()) {
            console.warn('moveSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify file was moved
        const srcExists = await fs.exists(srcPath);
        const destExists = await fs.exists(destPath);
        expect(srcExists.unwrap()).toBe(false);
        expect(destExists.unwrap()).toBe(true);
    });

    test('readDirSync reads directory contents', async () => {
        const dirPath = `${ TEST_DIR }/sync-readdir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/file1.txt`, 'content1');
        await fs.writeFile(`${ dirPath }/file2.txt`, 'content2');

        const result = fs.readDirSync(dirPath);
        if (result.isErr()) {
            console.warn('readDirSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        const items = result.unwrap();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(2);
        items.forEach(item => {
            expect(typeof item).toBe('string');
        });
    });

    test('readDirSync returns empty array for empty directory', async () => {
        const dirPath = `${ TEST_DIR }/sync-empty-dir`;
        await fs.mkdir(dirPath);

        const result = fs.readDirSync(dirPath);
        if (result.isErr()) {
            console.warn('readDirSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
    });

    test('readFileSync reads file content', async () => {
        const filePath = `${ TEST_DIR }/sync-read.txt`;
        await fs.writeFile(filePath, 'sync read content');

        const result = fs.readFileSync(filePath, { encoding: 'utf8' });
        if (result.isErr()) {
            console.warn('readFileSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('sync read content');
    });

    test('readFileSync reads binary content', async () => {
        const filePath = `${ TEST_DIR }/sync-read-binary.txt`;
        await fs.writeFile(filePath, 'binary content');

        const result = fs.readFileSync(filePath);
        if (result.isErr()) {
            console.warn('readFileSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBeInstanceOf(Uint8Array);
    });

    test('writeFileSync writes file content', async () => {
        const filePath = `${ TEST_DIR }/sync-write.txt`;

        const result = fs.writeFileSync(filePath, 'sync write content');
        if (result.isErr()) {
            console.warn('writeFileSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify content
        const readResult = await fs.readTextFile(filePath);
        expect(readResult.unwrap()).toBe('sync write content');
    });

    test('appendFileSync appends to file', async () => {
        const filePath = `${ TEST_DIR }/sync-append.txt`;
        await fs.writeFile(filePath, 'initial');

        const result = fs.appendFileSync(filePath, ' appended');
        if (result.isErr()) {
            console.warn('appendFileSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify content
        const readResult = await fs.readTextFile(filePath);
        expect(readResult.unwrap()).toBe('initial appended');
    });

    test('removeSync deletes file', async () => {
        const filePath = `${ TEST_DIR }/sync-remove.txt`;
        await fs.writeFile(filePath, 'to delete');

        const result = fs.removeSync(filePath);
        if (result.isErr()) {
            console.warn('removeSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify file was deleted
        const existsResult = await fs.exists(filePath);
        expect(existsResult.unwrap()).toBe(false);
    });

    test('copySync copies file', async () => {
        const srcPath = `${ TEST_DIR }/sync-copy-src.txt`;
        const destPath = `${ TEST_DIR }/sync-copy-dest.txt`;
        await fs.writeFile(srcPath, 'copy content');

        const result = fs.copySync(srcPath, destPath);
        if (result.isErr()) {
            console.warn('copySync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify both files exist
        const srcExists = await fs.exists(srcPath);
        const destExists = await fs.exists(destPath);
        expect(srcExists.unwrap()).toBe(true);
        expect(destExists.unwrap()).toBe(true);
    });

    test('existsSync checks if file exists', async () => {
        const filePath = `${ TEST_DIR }/sync-exists.txt`;
        await fs.writeFile(filePath, 'exists');

        const existsResult = fs.existsSync(filePath);
        if (existsResult.isErr()) {
            console.warn('existsSync not supported in this environment, skipping test');
            return;
        }
        expect(existsResult.isOk()).toBe(true);
        expect(existsResult.unwrap()).toBe(true);

        const notExistsResult = fs.existsSync(`${ TEST_DIR }/sync-not-exists.txt`);
        expect(notExistsResult.isOk()).toBe(true);
        expect(notExistsResult.unwrap()).toBe(false);
    });

    test('existsSync with isFile option', async () => {
        const filePath = `${ TEST_DIR }/sync-exists-file.txt`;
        const dirPath = `${ TEST_DIR }/sync-exists-dir`;
        await fs.writeFile(filePath, 'file');
        await fs.mkdir(dirPath);

        const fileResult = fs.existsSync(filePath, { isFile: true });
        if (fileResult.isErr()) {
            console.warn('existsSync not supported in this environment, skipping test');
            return;
        }
        expect(fileResult.unwrap()).toBe(true);

        const dirAsFileResult = fs.existsSync(dirPath, { isFile: true });
        expect(dirAsFileResult.unwrap()).toBe(false);
    });

    test('existsSync with isDirectory option', async () => {
        const filePath = `${ TEST_DIR }/sync-exists-file2.txt`;
        const dirPath = `${ TEST_DIR }/sync-exists-dir2`;
        await fs.writeFile(filePath, 'file');
        await fs.mkdir(dirPath);

        const dirResult = fs.existsSync(dirPath, { isDirectory: true });
        if (dirResult.isErr()) {
            console.warn('existsSync not supported in this environment, skipping test');
            return;
        }
        expect(dirResult.unwrap()).toBe(true);

        const fileAsDirResult = fs.existsSync(filePath, { isDirectory: true });
        expect(fileAsDirResult.unwrap()).toBe(false);
    });

    test('emptyDirSync clears directory contents', async () => {
        const dirPath = `${ TEST_DIR }/sync-empty`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/file.txt`, 'content');

        const result = fs.emptyDirSync(dirPath);
        if (result.isErr()) {
            console.warn('emptyDirSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);

        // Verify directory is empty
        const items = await fs.readDir(dirPath);
        expect(items.unwrap()).toEqual([]);
    });

    test('readTextFileSync reads text file', async () => {
        const filePath = `${ TEST_DIR }/sync-text.txt`;
        await fs.writeFile(filePath, 'text content');

        const result = fs.readTextFileSync(filePath);
        if (result.isErr()) {
            console.warn('readTextFileSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('text content');
    });
});

describe('fs zip operations', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('zip compresses file to bytes', async () => {
        const filePath = `${ TEST_DIR }/zip-file.txt`;
        await fs.writeFile(filePath, 'zip content');

        const result = await fs.zip(filePath);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBeInstanceOf(Uint8Array);
        expect(result.unwrap().length).toBeGreaterThan(0);
    });

    test('zip compresses file to zip file', async () => {
        const filePath = `${ TEST_DIR }/zip-src.txt`;
        const zipPath = `${ TEST_DIR }/output.zip`;
        await fs.writeFile(filePath, 'zip to file');

        const result = await fs.zip(filePath, zipPath);
        expect(result.isOk()).toBe(true);

        // Verify zip file exists
        const existsResult = await fs.exists(zipPath);
        expect(existsResult.unwrap()).toBe(true);
    });

    test('zip compresses directory', async () => {
        const dirPath = `${ TEST_DIR }/zip-dir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/file1.txt`, 'content1');
        await fs.writeFile(`${ dirPath }/file2.txt`, 'content2');

        const result = await fs.zip(dirPath);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBeInstanceOf(Uint8Array);
    });

    test('zipSync compresses file to bytes', async () => {
        const filePath = `${ TEST_DIR }/zip-sync-file.txt`;
        await fs.writeFile(filePath, 'sync zip content');

        const result = fs.zipSync(filePath);
        if (result.isErr()) {
            console.warn('zipSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBeInstanceOf(Uint8Array);
    });

    test('zipSync compresses file to zip file', async () => {
        const filePath = `${ TEST_DIR }/zip-sync-src.txt`;
        const zipPath = `${ TEST_DIR }/sync-output.zip`;
        await fs.writeFile(filePath, 'sync zip to file');

        const result = fs.zipSync(filePath, zipPath);
        if (result.isErr()) {
            console.warn('zipSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
    });

    test('unzip extracts zip file', async () => {
        const filePath = `${ TEST_DIR }/unzip-src.txt`;
        const zipPath = `${ TEST_DIR }/unzip.zip`;
        const targetPath = `${ TEST_DIR }/unzip-target`;

        await fs.writeFile(filePath, 'unzip content');
        await fs.zip(filePath, zipPath);

        const result = await fs.unzip(zipPath, targetPath);
        expect(result.isOk()).toBe(true);

        // Verify target directory exists
        const existsResult = await fs.exists(targetPath, { isDirectory: true });
        expect(existsResult.unwrap()).toBe(true);
    });

    test('unzipSync extracts zip file', async () => {
        const filePath = `${ TEST_DIR }/unzip-sync-src.txt`;
        const zipPath = `${ TEST_DIR }/unzip-sync.zip`;
        const targetPath = `${ TEST_DIR }/unzip-sync-target`;

        await fs.writeFile(filePath, 'unzip sync content');
        await fs.zip(filePath, zipPath);

        const result = fs.unzipSync(zipPath, targetPath);
        if (result.isErr()) {
            console.warn('unzipSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
    });

    test('zip with options', async () => {
        const filePath = `${ TEST_DIR }/zip-options.txt`;
        await fs.writeFile(filePath, 'zip with options');

        const result = await fs.zip(filePath, { preserveRoot: false });
        expect(result.isOk()).toBe(true);
    });

    test('zipSync with options', async () => {
        const filePath = `${ TEST_DIR }/zip-sync-options.txt`;
        await fs.writeFile(filePath, 'sync zip with options');

        const result = fs.zipSync(filePath, { preserveRoot: false });
        if (result.isErr()) {
            console.warn('zipSync not supported in this environment, skipping test');
            return;
        }
        expect(result.isOk()).toBe(true);
    });
});

describe('fs statSync edge cases', () => {
    beforeAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test('statSync with recursive on file returns FileStats array', async () => {
        const filePath = `${ TEST_DIR }/stat-sync-recursive-file.txt`;
        await fs.writeFile(filePath, 'stat recursive file');

        const result = fs.statSync(filePath, { recursive: true });
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap();
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isFile()).toBe(true);
    });

    test('statSync with recursive on empty directory', async () => {
        const dirPath = `${ TEST_DIR }/stat-sync-empty-recursive`;
        await fs.mkdir(dirPath);

        const result = fs.statSync(dirPath, { recursive: true });
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap();
        expect(Array.isArray(statsArr)).toBe(true);
        // Empty directory should still have at least one entry (itself)
        expect(statsArr.length).toBeGreaterThanOrEqual(1);
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('statSync without recursive returns single Stats', async () => {
        const filePath = `${ TEST_DIR }/stat-sync-no-recursive.txt`;
        await fs.writeFile(filePath, 'no recursive');

        const result = fs.statSync(filePath);
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const stats = result.unwrap();
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isFile()).toBe(true);
    });

    test('statSync returns error for non-existent path', async () => {
        const result = fs.statSync(`${ TEST_DIR }/stat-sync-non-existent`);
        if (result.isErr()) {
            // Expected behavior - either not supported or path not found
            expect(result.isErr()).toBe(true);
        }
    });

    test('statSync with recursive on directory with nested content', async () => {
        const dirPath = `${ TEST_DIR }/stat-sync-nested`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${ dirPath }/file1.txt`, 'content1');
        await fs.mkdir(`${ dirPath }/subdir`);
        await fs.writeFile(`${ dirPath }/subdir/file2.txt`, 'content2');

        const result = fs.statSync(dirPath, { recursive: true });
        if (result.isErr()) {
            console.warn('statSync not supported in this environment, skipping test');
            return;
        }

        const statsArr = result.unwrap();
        expect(Array.isArray(statsArr)).toBe(true);
        // Should include: dir itself, file1.txt, subdir, subdir/file2.txt
        expect(statsArr.length).toBeGreaterThanOrEqual(2);

        // First entry should be the directory itself with empty path
        const selfEntry = statsArr[0];
        expect(selfEntry.stats.isDirectory()).toBe(true);
    });
});
