import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { fs } from '../src/mod.ts';

// Test directory for all fs operations
const TEST_DIR = '/fs-test';

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

        const stats = result.unwrap() as WechatMinigame.Stats;
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

        const stats = result.unwrap() as WechatMinigame.Stats;
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

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
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

        // First item should be the directory itself
        expect(statsArr[0].path).toBe(dirPath);
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('stat without recursive on directory returns single Stats', async () => {
        const dirPath = `${TEST_DIR}/stat-no-recursive`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file.txt`, 'content');

        const result = await fs.stat(dirPath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap() as WechatMinigame.Stats;
        // Should return single Stats, not array
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isDirectory()).toBe(true);
    });

    test('stat returns error for non-existent path', async () => {
        const result = await fs.stat(`${TEST_DIR}/non-existent`);
        expect(result.isErr()).toBe(true);
    });
});
