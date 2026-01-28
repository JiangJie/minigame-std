/**
 * @file web_fs_helpers.ts 的单元测试
 * 通过 mock happy-opfs 的底层函数来测试
 */
import type { FileSystemFileHandleLike, FileSystemHandleLike } from 'happy-opfs';
import { Err, Ok, type IOResult } from 'happy-rusty';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
    convertFileSystemHandleLikeToStats,
    convertFileSystemHandleToStats,
    webToMinaReadDir,
    webToMinaReadDirSync,
    webToMinaStat,
    webToMinaStatSync,
} from '../src/std/fs/web_fs_helpers.ts';

// Mock happy-opfs 模块
vi.mock('happy-opfs', async (importOriginal) => {
    const original = await importOriginal<typeof import('happy-opfs')>();
    return {
        ...original,
        readDir: vi.fn(),
        readDirSync: vi.fn(),
        stat: vi.fn(),
        statSync: vi.fn(),
    };
});

// 在测试中动态获取 mock 函数
import { readDir, readDirSync, stat, statSync } from 'happy-opfs';

const mockedReadDir = vi.mocked(readDir);
const mockedReadDirSync = vi.mocked(readDirSync);
const mockedStat = vi.mocked(stat);
const mockedStatSync = vi.mocked(statSync);

// 创建 mock 的 FileSystemFileHandle
function createMockFileHandle(name: string, size: number, lastModified: number): FileSystemFileHandle {
    return {
        kind: 'file',
        name,
        getFile: vi.fn().mockResolvedValue({
            size,
            lastModified,
        }),
        isSameEntry: vi.fn(),
        queryPermission: vi.fn(),
        requestPermission: vi.fn(),
        createWritable: vi.fn(),
        createSyncAccessHandle: vi.fn(),
    } as unknown as FileSystemFileHandle;
}

// 创建 mock 的 FileSystemDirectoryHandle
function createMockDirectoryHandle(name: string): FileSystemDirectoryHandle {
    return {
        kind: 'directory',
        name,
        getFile: undefined,
        isSameEntry: vi.fn(),
        queryPermission: vi.fn(),
        requestPermission: vi.fn(),
    } as unknown as FileSystemDirectoryHandle;
}

// 创建 mock 的 FileSystemHandleLike (文件)
function createMockFileHandleLike(name: string, size: number, lastModified: number): FileSystemFileHandleLike {
    return {
        kind: 'file',
        name,
        size,
        lastModified,
        type: '',
    };
}

// 创建 mock 的 FileSystemHandleLike (目录)
function createMockDirectoryHandleLike(name: string): FileSystemHandleLike {
    return {
        kind: 'directory',
        name,
    };
}

// 创建异步可迭代对象
async function* createAsyncIterable<T>(items: T[]): AsyncIterableIterator<T> {
    for (const item of items) {
        yield item;
    }
}

describe('convertFileSystemHandleLikeToStats', () => {
    test('converts file handle like to Stats', () => {
        const handleLike = createMockFileHandleLike('test.txt', 1024, 1234567890);

        const stats = convertFileSystemHandleLikeToStats(handleLike);

        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
        expect(stats.size).toBe(1024);
        expect(stats.lastModifiedTime).toBe(1234567890);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });

    test('converts directory handle like to Stats', () => {
        const handleLike = createMockDirectoryHandleLike('my-dir');

        const stats = convertFileSystemHandleLikeToStats(handleLike);

        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
        expect(stats.size).toBe(0);
        expect(stats.lastModifiedTime).toBe(0);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });
});

describe('convertFileSystemHandleToStats', () => {
    test('converts file handle to Stats', async () => {
        const handle = createMockFileHandle('test.txt', 2048, 9876543210);

        const stats = await convertFileSystemHandleToStats(handle);

        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
        expect(stats.size).toBe(2048);
        expect(stats.lastModifiedTime).toBe(9876543210);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });

    test('converts directory handle to Stats', async () => {
        const handle = createMockDirectoryHandle('my-dir');

        const stats = await convertFileSystemHandleToStats(handle);

        expect(stats.isFile()).toBe(false);
        expect(stats.isDirectory()).toBe(true);
        expect(stats.size).toBe(0);
        expect(stats.lastModifiedTime).toBe(0);
        expect(stats.lastAccessedTime).toBe(0);
        expect(stats.mode).toBe(0);
    });
});

describe('webToMinaReadDir', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns string array from directory entries', async () => {
        const entries = [
            { path: 'file1.txt', handle: createMockFileHandle('file1.txt', 100, 1000) },
            { path: 'file2.txt', handle: createMockFileHandle('file2.txt', 200, 2000) },
            { path: 'subdir', handle: createMockDirectoryHandle('subdir') },
        ];
        mockedReadDir.mockResolvedValue(Ok(createAsyncIterable(entries)));

        const result = await webToMinaReadDir('/test-dir');

        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual(['file1.txt', 'file2.txt', 'subdir']);
    });

    test('returns empty array for empty directory', async () => {
        mockedReadDir.mockResolvedValue(Ok(createAsyncIterable([])));

        const result = await webToMinaReadDir('/empty-dir');

        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
    });

    test('returns error when readDir fails', async () => {
        const error = new Error('Directory not found');
        mockedReadDir.mockResolvedValue(Err(error));

        const result = await webToMinaReadDir('/nonexistent');

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });

    test('fallback to for-await when Array.fromAsync is not available', async () => {
        const entries = [
            { path: 'a.txt', handle: createMockFileHandle('a.txt', 10, 100) },
            { path: 'b.txt', handle: createMockFileHandle('b.txt', 20, 200) },
        ];
        mockedReadDir.mockResolvedValue(Ok(createAsyncIterable(entries)));

        // 暂时移除 Array.fromAsync 以测试 fallback 逻辑
        const originalFromAsync = Array.fromAsync;
        // @ts-expect-error ===测试用途===
        delete Array.fromAsync;

        try {
            const result = await webToMinaReadDir('/fallback-dir');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toEqual(['a.txt', 'b.txt']);
        } finally {
            // 恢复 Array.fromAsync
            Array.fromAsync = originalFromAsync;
        }
    });
});

describe('webToMinaReadDirSync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns string array from directory entries', () => {
        const entries = [
            { path: 'file1.txt', handle: createMockFileHandleLike('file1.txt', 100, 1000) },
            { path: 'file2.txt', handle: createMockFileHandleLike('file2.txt', 200, 2000) },
        ];
        mockedReadDirSync.mockReturnValue(Ok(entries));

        const result = webToMinaReadDirSync('/test-dir');

        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual(['file1.txt', 'file2.txt']);
    });

    test('returns empty array for empty directory', () => {
        mockedReadDirSync.mockReturnValue(Ok([]));

        const result = webToMinaReadDirSync('/empty-dir');

        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
    });

    test('returns error when readDirSync fails', () => {
        const error = new Error('Directory not found');
        mockedReadDirSync.mockReturnValue(Err(error));

        const result = webToMinaReadDirSync('/nonexistent');

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });
});

describe('webToMinaStat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns Stats for file without recursive option', async () => {
        const fileHandle = createMockFileHandle('test.txt', 500, 12345);
        mockedStat.mockResolvedValue(Ok(fileHandle));

        const result = await webToMinaStat('/test.txt');

        expect(result.isOk()).toBe(true);
        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBe(500);
    });

    test('returns Stats for directory without recursive option', async () => {
        const dirHandle = createMockDirectoryHandle('my-dir');
        mockedStat.mockResolvedValue(Ok(dirHandle));

        const result = await webToMinaStat('/my-dir');

        expect(result.isOk()).toBe(true);
        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isDirectory()).toBe(true);
    });

    test('returns error when stat fails', async () => {
        const error = new Error('Path not found');
        mockedStat.mockResolvedValue(Err(error));

        const result = await webToMinaStat('/nonexistent');

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });

    test('returns error when convertFileSystemHandleToStats throws', async () => {
        // 创建一个会导致 getFile() 抛出异常的 mock handle
        const brokenFileHandle = {
            kind: 'file',
            name: 'broken.txt',
            getFile: vi.fn().mockRejectedValue(new Error('getFile failed')),
        } as unknown as FileSystemFileHandle;
        mockedStat.mockResolvedValue(Ok(brokenFileHandle) );

        const result = await webToMinaStat('/broken.txt');

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr().message).toBe('getFile failed');
    });

    test('returns FileStats array for file with recursive option', async () => {
        const fileHandle = createMockFileHandle('test.txt', 800, 54321);
        mockedStat.mockResolvedValue(Ok(fileHandle));

        const result = await webToMinaStat('/test.txt', { recursive: true });

        expect(result.isOk()).toBe(true);
        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isFile()).toBe(true);
    });

    test('returns FileStats array for directory with recursive option', async () => {
        const dirHandle = createMockDirectoryHandle('my-dir');
        mockedStat.mockResolvedValue(Ok(dirHandle));

        const entries = [
            { path: 'child1.txt', handle: createMockFileHandle('child1.txt', 100, 1000) },
            { path: 'child2.txt', handle: createMockFileHandle('child2.txt', 200, 2000) },
        ];
        mockedReadDir.mockResolvedValue(Ok(createAsyncIterable(entries)));

        const result = await webToMinaStat('/my-dir', { recursive: true });

        expect(result.isOk()).toBe(true);
        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(3); // 目录本身 + 2 个子文件
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
        expect(statsArr[1].path).toBe('child1.txt');
        expect(statsArr[1].stats.isFile()).toBe(true);
    });

    test('returns FileStats array for empty directory with recursive option', async () => {
        const dirHandle = createMockDirectoryHandle('empty-dir');
        mockedStat.mockResolvedValue(Ok(dirHandle));
        mockedReadDir.mockResolvedValue(Ok(createAsyncIterable([])));

        const result = await webToMinaStat('/empty-dir', { recursive: true });

        expect(result.isOk()).toBe(true);
        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('returns error when recursive readDir fails', async () => {
        const dirHandle = createMockDirectoryHandle('my-dir');
        mockedStat.mockResolvedValue(Ok(dirHandle));

        const error = new Error('Read dir failed');
        mockedReadDir.mockResolvedValue(Err(error));

        const result = await webToMinaStat('/my-dir', { recursive: true });

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });
});

describe('webToMinaStatSync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns Stats for file without recursive option', () => {
        const handleLike = createMockFileHandleLike('test.txt', 600, 11111);
        mockedStatSync.mockReturnValue(Ok(handleLike) as IOResult<FileSystemHandleLike>);

        const result = webToMinaStatSync('/test.txt');

        expect(result.isOk()).toBe(true);
        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBe(600);
    });

    test('returns Stats for directory without recursive option', () => {
        const handleLike = createMockDirectoryHandleLike('my-dir');
        mockedStatSync.mockReturnValue(Ok(handleLike) as IOResult<FileSystemHandleLike>);

        const result = webToMinaStatSync('/my-dir');

        expect(result.isOk()).toBe(true);
        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(Array.isArray(stats)).toBe(false);
        expect(stats.isDirectory()).toBe(true);
    });

    test('returns error when statSync fails', () => {
        const error = new Error('Path not found');
        mockedStatSync.mockReturnValue(Err(error) as IOResult<FileSystemHandleLike>);

        const result = webToMinaStatSync('/nonexistent');

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });

    test('returns FileStats array for file with recursive option', () => {
        const handleLike = createMockFileHandleLike('test.txt', 700, 22222);
        mockedStatSync.mockReturnValue(Ok(handleLike) as IOResult<FileSystemHandleLike>);

        const result = webToMinaStatSync('/test.txt', { recursive: true });

        expect(result.isOk()).toBe(true);
        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isFile()).toBe(true);
    });

    test('returns FileStats array for directory with recursive option', () => {
        const handleLike = createMockDirectoryHandleLike('my-dir');
        mockedStatSync.mockReturnValue(Ok(handleLike) as IOResult<FileSystemHandleLike>);

        const entries = [
            { path: 'child1.txt', handle: createMockFileHandleLike('child1.txt', 100, 1000) },
            { path: 'sub-dir', handle: createMockDirectoryHandleLike('sub-dir') },
        ];
        mockedReadDirSync.mockReturnValue(Ok(entries) as IOResult<{ path: string; handle: FileSystemHandleLike; }[]>);

        const result = webToMinaStatSync('/my-dir', { recursive: true });

        expect(result.isOk()).toBe(true);
        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(3); // 目录本身 + 1 文件 + 1 子目录
        // 目录本身在最前面（通过 unshift 插入）
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
        expect(statsArr[1].path).toBe('child1.txt');
        expect(statsArr[1].stats.isFile()).toBe(true);
        expect(statsArr[2].path).toBe('sub-dir');
        expect(statsArr[2].stats.isDirectory()).toBe(true);
    });

    test('returns FileStats array for empty directory with recursive option', () => {
        const handleLike = createMockDirectoryHandleLike('empty-dir');
        mockedStatSync.mockReturnValue(Ok(handleLike) as IOResult<FileSystemHandleLike>);
        mockedReadDirSync.mockReturnValue(Ok([]) as IOResult<{ path: string; handle: FileSystemHandleLike; }[]>);

        const result = webToMinaStatSync('/empty-dir', { recursive: true });

        expect(result.isOk()).toBe(true);
        const statsArr = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArr)).toBe(true);
        expect(statsArr.length).toBe(1);
        expect(statsArr[0].path).toBe('');
        expect(statsArr[0].stats.isDirectory()).toBe(true);
    });

    test('returns error when recursive readDirSync fails', () => {
        const handleLike = createMockDirectoryHandleLike('my-dir');
        mockedStatSync.mockReturnValue(Ok(handleLike) as IOResult<FileSystemHandleLike>);

        const error = new Error('Read dir failed');
        mockedReadDirSync.mockReturnValue(Err(error) as IOResult<{ path: string; handle: FileSystemHandleLike; }[]>);

        const result = webToMinaStatSync('/my-dir', { recursive: true });

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });
});
