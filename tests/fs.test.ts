import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { fs } from 'minigame-std';

// Test directory for all fs operations
const TEST_DIR = '/fs-test';

describe('fs async operations', () => {
    beforeAll(async () => {
        // Clean up and create test directory
        await fs.remove(TEST_DIR);
        await fs.mkdir(TEST_DIR);
    });

    afterAll(async () => {
        // Clean up test directory
        await fs.remove(TEST_DIR);
    });

    test('mkdir creates directory', async () => {
        const dirPath = `${TEST_DIR}/new-dir`;
        const result = await fs.mkdir(dirPath);
        expect(result.isOk()).toBe(true);

        const existsResult = await fs.exists(dirPath);
        expect(existsResult.unwrap()).toBe(true);
    });

    test('writeFile and readFile work correctly', async () => {
        const filePath = `${TEST_DIR}/test.txt`;
        const content = 'Hello, World!';

        const writeResult = await fs.writeFile(filePath, content);
        expect(writeResult.isOk()).toBe(true);

        const readResult = await fs.readFile(filePath);
        expect(readResult.isOk()).toBe(true);

        const decoder = new TextDecoder();
        expect(decoder.decode(readResult.unwrap())).toBe(content);
    });

    test('writeFile with ArrayBuffer', async () => {
        const filePath = `${TEST_DIR}/binary.bin`;
        const content = new Uint8Array([1, 2, 3, 4, 5]).buffer;

        const writeResult = await fs.writeFile(filePath, content);
        expect(writeResult.isOk()).toBe(true);

        const readResult = await fs.readFile(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(new Uint8Array(readResult.unwrap())).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    test('readTextFile reads text content', async () => {
        const filePath = `${TEST_DIR}/text.txt`;
        const content = '中文内容 UTF-8';

        await fs.writeFile(filePath, content);

        const readResult = await fs.readTextFile(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toBe(content);
    });

    test('readJsonFile reads and parses JSON', async () => {
        const filePath = `${TEST_DIR}/data.json`;
        const data = { name: 'test', value: 123, nested: { arr: [1, 2, 3] } };

        await fs.writeFile(filePath, JSON.stringify(data));

        const readResult = await fs.readJsonFile<typeof data>(filePath);
        expect(readResult.isOk()).toBe(true);
        expect(readResult.unwrap()).toEqual(data);
    });

    test('appendFile appends content', async () => {
        const filePath = `${TEST_DIR}/append.txt`;

        await fs.writeFile(filePath, 'Hello');
        await fs.appendFile(filePath, ', World!');

        const readResult = await fs.readTextFile(filePath);
        expect(readResult.unwrap()).toBe('Hello, World!');
    });

    test('exists returns true for existing file', async () => {
        const filePath = `${TEST_DIR}/exists.txt`;
        await fs.writeFile(filePath, 'test');

        const result = await fs.exists(filePath);
        expect(result.unwrap()).toBe(true);
    });

    test('exists returns false for non-existing file', async () => {
        const result = await fs.exists(`${TEST_DIR}/non-existing.txt`);
        expect(result.unwrap()).toBe(false);
    });

    test('remove deletes file', async () => {
        const filePath = `${TEST_DIR}/to-delete.txt`;
        await fs.writeFile(filePath, 'delete me');

        const removeResult = await fs.remove(filePath);
        expect(removeResult.isOk()).toBe(true);

        const existsResult = await fs.exists(filePath);
        expect(existsResult.unwrap()).toBe(false);
    });

    test('remove deletes directory', async () => {
        const dirPath = `${TEST_DIR}/to-delete-dir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file.txt`, 'test');

        const removeResult = await fs.remove(dirPath);
        expect(removeResult.isOk()).toBe(true);

        const existsResult = await fs.exists(dirPath);
        expect(existsResult.unwrap()).toBe(false);
    });

    test('copy copies file', async () => {
        const srcPath = `${TEST_DIR}/copy-src.txt`;
        const destPath = `${TEST_DIR}/copy-dest.txt`;

        await fs.writeFile(srcPath, 'copy content');

        const copyResult = await fs.copy(srcPath, destPath);
        expect(copyResult.isOk()).toBe(true);

        const readResult = await fs.readTextFile(destPath);
        expect(readResult.unwrap()).toBe('copy content');
    });

    test('move renames file', async () => {
        const srcPath = `${TEST_DIR}/move-src.txt`;
        const destPath = `${TEST_DIR}/move-dest.txt`;

        await fs.writeFile(srcPath, 'move content');

        const moveResult = await fs.move(srcPath, destPath);
        expect(moveResult.isOk()).toBe(true);

        const srcExists = await fs.exists(srcPath);
        expect(srcExists.unwrap()).toBe(false);

        const readResult = await fs.readTextFile(destPath);
        expect(readResult.unwrap()).toBe('move content');
    });

    test('readDir lists directory contents', async () => {
        const dirPath = `${TEST_DIR}/list-dir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file1.txt`, 'content1');
        await fs.writeFile(`${dirPath}/file2.txt`, 'content2');
        await fs.mkdir(`${dirPath}/subdir`);

        const result = await fs.readDir(dirPath);
        expect(result.isOk()).toBe(true);

        const items = result.unwrap();
        expect(items.length).toBe(3);
    });

    test('stat returns file stats', async () => {
        const filePath = `${TEST_DIR}/stat-file.txt`;
        await fs.writeFile(filePath, 'stat content');

        const result = await fs.stat(filePath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
    });

    test('stat returns directory stats', async () => {
        const dirPath = `${TEST_DIR}/stat-dir`;
        await fs.mkdir(dirPath);

        const result = await fs.stat(dirPath);
        expect(result.isOk()).toBe(true);

        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
    });

    test('stat with recursive option', async () => {
        const dirPath = `${TEST_DIR}/stat-recursive`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file1.txt`, 'content');
        await fs.writeFile(`${dirPath}/file2.txt`, 'content');

        const result = await fs.stat(dirPath, { recursive: true });
        expect(result.isOk()).toBe(true);

        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBeGreaterThanOrEqual(3); // dir + 2 files
    });

    test('emptyDir clears directory contents', async () => {
        const dirPath = `${TEST_DIR}/empty-dir`;
        await fs.mkdir(dirPath);
        await fs.writeFile(`${dirPath}/file1.txt`, 'content');
        await fs.writeFile(`${dirPath}/file2.txt`, 'content');

        const emptyResult = await fs.emptyDir(dirPath);
        expect(emptyResult.isOk()).toBe(true);

        const readResult = await fs.readDir(dirPath);
        expect(readResult.unwrap().length).toBe(0);
    });

    test('readFile returns error for non-existent file', async () => {
        const result = await fs.readFile(`${TEST_DIR}/non-existent-file.txt`);
        expect(result.isErr()).toBe(true);
    });

    test('writeFile creates parent directories', async () => {
        const filePath = `${TEST_DIR}/nested/deep/file.txt`;
        const content = 'nested content';

        const writeResult = await fs.writeFile(filePath, content);
        expect(writeResult.isOk()).toBe(true);

        const readResult = await fs.readTextFile(filePath);
        expect(readResult.unwrap()).toBe(content);
    });
});

// Note: Sync operations (mkdirSync, writeFileSync, etc.) are not tested here
// because they require Web Workers with OPFS synchronous access handles,
// which is not available in the main thread of a browser environment.
// These sync APIs work correctly in WeChat MiniGame environment.
