/**
 * 测试小游戏环境下的 fs 模块（mina_fs_async.ts 和 mina_fs_sync.ts）
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';

// 模拟文件系统数据
const mockFileSystem = new Map<string, { type: 'file' | 'directory'; content?: string | ArrayBuffer; lastModified?: number; }>();

// 初始化根目录
mockFileSystem.set('wxfile://usr', { type: 'directory' });

// 创建 mock 的 FileSystemManager
function createMockFileSystemManager(): WechatMinigame.FileSystemManager {
    return {
        mkdir: vi.fn(({ dirPath, recursive: _recursive, success, fail }) => {
            // 模拟创建目录
            if (mockFileSystem.has(dirPath)) {
                const existing = mockFileSystem.get(dirPath)!;
                if (existing.type === 'file') {
                    fail?.({ errMsg: 'file already exists', errCode: 1301005 });
                    return;
                }
                success?.({});
                return;
            }
            mockFileSystem.set(dirPath, { type: 'directory' });
            success?.({});
        }),
        mkdirSync: vi.fn((dirPath: string, _recursive?: boolean) => {
            if (mockFileSystem.has(dirPath)) {
                const existing = mockFileSystem.get(dirPath)!;
                if (existing.type === 'file') {
                    const err = new Error('file already exists') as Error & { errno: number; };
                    err.errno = 1301005;
                    throw err;
                }
                return;
            }
            mockFileSystem.set(dirPath, { type: 'directory' });
        }),
        rename: vi.fn(({ oldPath, newPath, success, fail }) => {
            if (!mockFileSystem.has(oldPath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            const data = mockFileSystem.get(oldPath)!;
            mockFileSystem.delete(oldPath);
            mockFileSystem.set(newPath, data);
            success?.({});
        }),
        renameSync: vi.fn((oldPath: string, newPath: string) => {
            if (!mockFileSystem.has(oldPath)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            const data = mockFileSystem.get(oldPath)!;
            mockFileSystem.delete(oldPath);
            mockFileSystem.set(newPath, data);
        }),
        readdir: vi.fn(({ dirPath, success, fail }) => {
            if (!mockFileSystem.has(dirPath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            const files: string[] = [];
            for (const [path] of mockFileSystem) {
                if (path.startsWith(`${dirPath  }/`) && !path.slice(dirPath.length + 1).includes('/')) {
                    files.push(path.split('/').pop()!);
                }
            }
            success?.({ files });
        }),
        readdirSync: vi.fn((dirPath: string) => {
            if (!mockFileSystem.has(dirPath)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            const files: string[] = [];
            for (const [path] of mockFileSystem) {
                if (path.startsWith(`${dirPath  }/`) && !path.slice(dirPath.length + 1).includes('/')) {
                    files.push(path.split('/').pop()!);
                }
            }
            return files;
        }),
        readFile: vi.fn(({ filePath, encoding, success, fail }) => {
            if (!mockFileSystem.has(filePath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            const file = mockFileSystem.get(filePath)!;
            if (file.type === 'directory') {
                fail?.({ errMsg: 'is a directory', errCode: 1300013 });
                return;
            }
            const data = encoding === 'utf8' ? file.content as string : file.content as ArrayBuffer;
            success?.({ data });
        }),
        readFileSync: vi.fn((filePath: string, encoding?: 'utf8') => {
            if (!mockFileSystem.has(filePath)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            const file = mockFileSystem.get(filePath)!;
            if (file.type === 'directory') {
                const err = new Error('is a directory') as Error & { errno: number; };
                err.errno = 1300013;
                throw err;
            }
            return encoding === 'utf8' ? file.content as string : file.content as ArrayBuffer;
        }),
        writeFile: vi.fn(({ filePath, data, success }) => {
            mockFileSystem.set(filePath, {
                type: 'file',
                content: data,
                lastModified: Date.now(),
            });
            success?.({});
        }),
        writeFileSync: vi.fn((filePath: string, data: string | ArrayBuffer) => {
            mockFileSystem.set(filePath, {
                type: 'file',
                content: data,
                lastModified: Date.now(),
            });
        }),
        appendFile: vi.fn(({ filePath, data, success }) => {
            const file = mockFileSystem.get(filePath);
            if (file && file.type === 'file') {
                if (typeof file.content === 'string' && typeof data === 'string') {
                    file.content = file.content + data;
                }
            }
            success?.({});
        }),
        appendFileSync: vi.fn((filePath: string, data: string | ArrayBuffer) => {
            const file = mockFileSystem.get(filePath);
            if (file && file.type === 'file') {
                if (typeof file.content === 'string' && typeof data === 'string') {
                    file.content = file.content + data;
                }
            }
        }),
        unlink: vi.fn(({ filePath, success, fail }) => {
            if (!mockFileSystem.has(filePath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            mockFileSystem.delete(filePath);
            success?.({});
        }),
        unlinkSync: vi.fn((filePath: string) => {
            if (!mockFileSystem.has(filePath)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            mockFileSystem.delete(filePath);
        }),
        rmdir: vi.fn(({ dirPath, recursive: _recursive, success, fail }) => {
            if (!mockFileSystem.has(dirPath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            // 删除目录及其内容
            for (const path of mockFileSystem.keys()) {
                if (path === dirPath || path.startsWith(`${dirPath  }/`)) {
                    mockFileSystem.delete(path);
                }
            }
            success?.({});
        }),
        rmdirSync: vi.fn((dirPath: string, _recursive?: boolean) => {
            if (!mockFileSystem.has(dirPath)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            // 删除目录及其内容
            for (const path of mockFileSystem.keys()) {
                if (path === dirPath || path.startsWith(`${dirPath  }/`)) {
                    mockFileSystem.delete(path);
                }
            }
        }),
        stat: vi.fn(({ path, recursive, success, fail }) => {
            if (!mockFileSystem.has(path)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            const item = mockFileSystem.get(path)!;
            const stats = createMockStats(item.type, item.content);

            if (recursive) {
                const fileStats: WechatMinigame.FileStats[] = [{ path: '', stats }];
                for (const [filePath, fileItem] of mockFileSystem) {
                    if (filePath.startsWith(`${path  }/`)) {
                        const relativePath = filePath.slice(path.length);
                        fileStats.push({
                            path: relativePath,
                            stats: createMockStats(fileItem.type, fileItem.content),
                        });
                    }
                }
                success?.({ stats: fileStats });
            } else {
                success?.({ stats });
            }
        }),
        statSync: vi.fn((path: string, recursive?: boolean) => {
            if (!mockFileSystem.has(path)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            const item = mockFileSystem.get(path)!;
            const stats = createMockStats(item.type, item.content);

            if (recursive) {
                const fileStats: WechatMinigame.FileStats[] = [{ path: '', stats }];
                for (const [filePath, fileItem] of mockFileSystem) {
                    if (filePath.startsWith(`${path  }/`)) {
                        const relativePath = filePath.slice(path.length);
                        fileStats.push({
                            path: relativePath,
                            stats: createMockStats(fileItem.type, fileItem.content),
                        });
                    }
                }
                return fileStats;
            }
            return stats;
        }),
        copyFile: vi.fn(({ srcPath, destPath, success, fail }) => {
            if (!mockFileSystem.has(srcPath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            const src = mockFileSystem.get(srcPath)!;
            mockFileSystem.set(destPath, { ...src });
            success?.({});
        }),
        copyFileSync: vi.fn((srcPath: string, destPath: string) => {
            if (!mockFileSystem.has(srcPath)) {
                const err = new Error('no such file or directory') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            }
            const src = mockFileSystem.get(srcPath)!;
            mockFileSystem.set(destPath, { ...src });
        }),
        unzip: vi.fn(({ zipFilePath, targetPath, success, fail }) => {
            if (!mockFileSystem.has(zipFilePath)) {
                fail?.({ errMsg: 'no such file or directory', errCode: 1300002 });
                return;
            }
            // 模拟解压
            mockFileSystem.set(targetPath, { type: 'directory' });
            success?.({});
        }),
    } as unknown as WechatMinigame.FileSystemManager;
}

function createMockStats(type: 'file' | 'directory', content?: string | ArrayBuffer): WechatMinigame.Stats {
    const size = type === 'file' && content
        ? (typeof content === 'string' ? content.length : (content as ArrayBuffer).byteLength)
        : 0;

    return {
        mode: 0,
        size,
        lastAccessedTime: 0,
        lastModifiedTime: Date.now(),
        isDirectory: () => type === 'directory',
        isFile: () => type === 'file',
    };
}

let mockFsManager: WechatMinigame.FileSystemManager;

// Mock wx 对象
vi.stubGlobal('wx', {
    getFileSystemManager: vi.fn(() => mockFsManager),
    env: {
        USER_DATA_PATH: 'wxfile://usr',
    },
    downloadFile: vi.fn((options: WechatMinigame.DownloadFileOption) => {
        // 模拟下载
        setTimeout(() => {
            options.success?.({
                tempFilePath: 'wxfile://tmp/downloaded.zip',
                statusCode: 200,
                filePath: options.filePath || '',
                errMsg: 'downloadFile:ok',
                profile: {} as WechatMinigame.RequestProfile,
            });
        }, 0);
        return {
            abort: vi.fn(),
            onProgressUpdate: vi.fn(),
            offProgressUpdate: vi.fn(),
            onHeadersReceived: vi.fn(),
            offHeadersReceived: vi.fn(),
        };
    }),
    uploadFile: vi.fn((options: WechatMinigame.UploadFileOption) => {
        // 模拟上传
        setTimeout(() => {
            options.success?.({
                data: 'ok',
                statusCode: 200,
                errMsg: 'uploadFile:ok',
                profile: {} as WechatMinigame.RequestProfile,
            });
        }, 0);
        return {
            abort: vi.fn(),
            onProgressUpdate: vi.fn(),
            offProgressUpdate: vi.fn(),
            onHeadersReceived: vi.fn(),
            offHeadersReceived: vi.fn(),
        };
    }),
});

// 动态导入 mina_fs 模块
const minaFsAsync = await import('../src/std/fs/mina_fs_async.ts');
const minaFsSync = await import('../src/std/fs/mina_fs_sync.ts');

beforeEach(() => {
    mockFileSystem.clear();
    mockFileSystem.set('wxfile://usr', { type: 'directory' });
    mockFsManager = createMockFileSystemManager();
    vi.clearAllMocks();
});

describe('mina fs async', () => {
    test('mkdir creates directory', async () => {
        const result = await minaFsAsync.mkdir('/test-dir');
        expect(result.isOk()).toBe(true);
        expect(mockFileSystem.has('wxfile://usr/test-dir')).toBe(true);
    });

    test('mkdir on root directory succeeds without creating', async () => {
        const result = await minaFsAsync.mkdir('/');
        // 根目录 '/' 对应 'wxfile://usr'，应该直接返回成功
        expect(result.isOk()).toBe(true);
    });

    test('mkdir returns error when path is a file', async () => {
        mockFileSystem.set('wxfile://usr/existing-file', { type: 'file', content: 'data' });
        const result = await minaFsAsync.mkdir('/existing-file');
        expect(result.isErr()).toBe(true);
    });

    test('move renames file', async () => {
        mockFileSystem.set('wxfile://usr/old-file', { type: 'file', content: 'data' });
        const result = await minaFsAsync.move('/old-file', '/new-file');
        expect(result.isOk()).toBe(true);
        expect(mockFileSystem.has('wxfile://usr/new-file')).toBe(true);
        expect(mockFileSystem.has('wxfile://usr/old-file')).toBe(false);
    });

    test('readDir returns directory contents', async () => {
        mockFileSystem.set('wxfile://usr/test-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/test-dir/file1.txt', { type: 'file', content: 'data1' });
        mockFileSystem.set('wxfile://usr/test-dir/file2.txt', { type: 'file', content: 'data2' });

        const result = await minaFsAsync.readDir('/test-dir');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toContain('file1.txt');
        expect(result.unwrap()).toContain('file2.txt');
    });

    test('readFile reads file content as bytes', async () => {
        const content = new ArrayBuffer(8);
        mockFileSystem.set('wxfile://usr/test-file', { type: 'file', content });

        const result = await minaFsAsync.readFile('/test-file');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBeInstanceOf(Uint8Array);
    });

    test('readFile reads file content as utf8', async () => {
        mockFileSystem.set('wxfile://usr/test-file.txt', { type: 'file', content: 'Hello World' });

        const result = await minaFsAsync.readFile('/test-file.txt', { encoding: 'utf8' });
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('Hello World');
    });

    test('writeFile writes content to file', async () => {
        const result = await minaFsAsync.writeFile('/new-file.txt', 'Hello World');
        expect(result.isOk()).toBe(true);
        expect(mockFileSystem.has('wxfile://usr/new-file.txt')).toBe(true);
    });

    test('writeFile with append option appends content', async () => {
        mockFileSystem.set('wxfile://usr/append-file.txt', { type: 'file', content: 'Hello ' });

        const result = await minaFsAsync.writeFile('/append-file.txt', 'World', { append: true });
        expect(result.isOk()).toBe(true);
    });

    test('appendFile appends content to file', async () => {
        mockFileSystem.set('wxfile://usr/append-file.txt', { type: 'file', content: 'Hello ' });

        const result = await minaFsAsync.appendFile('/append-file.txt', 'World');
        expect(result.isOk()).toBe(true);
    });

    test('remove deletes file', async () => {
        mockFileSystem.set('wxfile://usr/to-delete', { type: 'file', content: 'data' });

        const result = await minaFsAsync.remove('/to-delete');
        expect(result.isOk()).toBe(true);
        expect(mockFileSystem.has('wxfile://usr/to-delete')).toBe(false);
    });

    test('remove deletes directory', async () => {
        mockFileSystem.set('wxfile://usr/to-delete-dir', { type: 'directory' });

        const result = await minaFsAsync.remove('/to-delete-dir');
        expect(result.isOk()).toBe(true);
    });

    test('remove on non-existent path succeeds', async () => {
        const result = await minaFsAsync.remove('/non-existent');
        expect(result.isOk()).toBe(true);
    });

    test('stat returns file stats', async () => {
        mockFileSystem.set('wxfile://usr/stat-file', { type: 'file', content: 'data' });

        const result = await minaFsAsync.stat('/stat-file');
        expect(result.isOk()).toBe(true);
        const stats = result.unwrap() as WechatMinigame.Stats;
        expect(stats.isFile()).toBe(true);
        expect(stats.isDirectory()).toBe(false);
    });

    test('stat with recursive returns FileStats array', async () => {
        mockFileSystem.set('wxfile://usr/stat-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/stat-dir/file.txt', { type: 'file', content: 'data' });

        const result = await minaFsAsync.stat('/stat-dir', { recursive: true });
        expect(result.isOk()).toBe(true);
        const statsArray = result.unwrap() as WechatMinigame.FileStats[];
        expect(Array.isArray(statsArray)).toBe(true);
    });

    test('exists returns true for existing file', async () => {
        mockFileSystem.set('wxfile://usr/exists-file', { type: 'file', content: 'data' });

        const result = await minaFsAsync.exists('/exists-file');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(true);
    });

    test('exists returns false for non-existing file', async () => {
        const result = await minaFsAsync.exists('/non-existent');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(false);
    });

    test('exists with isFile option', async () => {
        mockFileSystem.set('wxfile://usr/check-file', { type: 'file', content: 'data' });
        mockFileSystem.set('wxfile://usr/check-dir', { type: 'directory' });

        const fileResult = await minaFsAsync.exists('/check-file', { isFile: true });
        expect(fileResult.unwrap()).toBe(true);

        const dirResult = await minaFsAsync.exists('/check-dir', { isFile: true });
        expect(dirResult.unwrap()).toBe(false);
    });

    test('copy copies file', async () => {
        mockFileSystem.set('wxfile://usr/src-file', { type: 'file', content: 'data' });

        const result = await minaFsAsync.copy('/src-file', '/dest-file');
        expect(result.isOk()).toBe(true);
        expect(mockFileSystem.has('wxfile://usr/dest-file')).toBe(true);
    });

    test('emptyDir clears directory contents', async () => {
        mockFileSystem.set('wxfile://usr/empty-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/empty-dir/file.txt', { type: 'file', content: 'data' });

        const result = await minaFsAsync.emptyDir('/empty-dir');
        expect(result.isOk()).toBe(true);
    });

    test('emptyDir creates directory if not exists', async () => {
        const result = await minaFsAsync.emptyDir('/new-empty-dir');
        expect(result.isOk()).toBe(true);
    });

    test('readTextFile reads file as string', async () => {
        mockFileSystem.set('wxfile://usr/text-file.txt', { type: 'file', content: 'Hello Text' });

        const result = await minaFsAsync.readTextFile('/text-file.txt');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('Hello Text');
    });

    test('readJsonFile parses JSON file', async () => {
        mockFileSystem.set('wxfile://usr/data.json', { type: 'file', content: '{"key":"value"}' });

        const result = await minaFsAsync.readJsonFile<{ key: string; }>('/data.json');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({ key: 'value' });
    });

    test('writeJsonFile writes JSON data', async () => {
        const result = await minaFsAsync.writeJsonFile('/output.json', { key: 'value' });
        expect(result.isOk()).toBe(true);
    });

    test('unzip extracts zip file', async () => {
        mockFileSystem.set('wxfile://usr/archive.zip', { type: 'file', content: new ArrayBuffer(100) });

        const result = await minaFsAsync.unzip('/archive.zip', '/extracted');
        expect(result.isOk()).toBe(true);
    });

    test('downloadFile downloads file', async () => {
        const task = minaFsAsync.downloadFile('https://example.com/file.zip');
        const result = await task.result;
        expect(result.isOk()).toBe(true);
    });

    test('downloadFile with filePath', async () => {
        mockFileSystem.set('wxfile://usr/downloads', { type: 'directory' });
        const task = minaFsAsync.downloadFile('https://example.com/file.zip', '/downloads/file.zip');
        const result = await task.result;
        expect(result.isOk()).toBe(true);
    });

    test('uploadFile uploads file', async () => {
        mockFileSystem.set('wxfile://usr/upload.txt', { type: 'file', content: 'data' });

        const task = minaFsAsync.uploadFile('/upload.txt', 'https://example.com/upload');
        const result = await task.result;
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs sync', () => {
    test('mkdirSync creates directory', () => {
        const result = minaFsSync.mkdirSync('/sync-test-dir');
        expect(result.isOk()).toBe(true);
    });

    test('mkdirSync on root directory succeeds', () => {
        const result = minaFsSync.mkdirSync('/');
        expect(result.isOk()).toBe(true);
    });

    test('moveSync renames file', () => {
        mockFileSystem.set('wxfile://usr/old-sync-file', { type: 'file', content: 'data' });

        const result = minaFsSync.moveSync('/old-sync-file', '/new-sync-file');
        expect(result.isOk()).toBe(true);
    });

    test('readDirSync returns directory contents', () => {
        mockFileSystem.set('wxfile://usr/sync-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/sync-dir/file.txt', { type: 'file', content: 'data' });

        const result = minaFsSync.readDirSync('/sync-dir');
        expect(result.isOk()).toBe(true);
    });

    test('readFileSync reads file content', () => {
        mockFileSystem.set('wxfile://usr/sync-file.txt', { type: 'file', content: 'Sync Content' });

        const result = minaFsSync.readFileSync('/sync-file.txt', { encoding: 'utf8' });
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('Sync Content');
    });

    test('writeFileSync writes content to file', () => {
        const result = minaFsSync.writeFileSync('/sync-new-file.txt', 'Sync Data');
        expect(result.isOk()).toBe(true);
    });

    test('appendFileSync appends content', () => {
        mockFileSystem.set('wxfile://usr/sync-append.txt', { type: 'file', content: 'Hello ' });

        const result = minaFsSync.appendFileSync('/sync-append.txt', 'World');
        expect(result.isOk()).toBe(true);
    });

    test('removeSync deletes file', () => {
        mockFileSystem.set('wxfile://usr/sync-delete', { type: 'file', content: 'data' });

        const result = minaFsSync.removeSync('/sync-delete');
        expect(result.isOk()).toBe(true);
    });

    test('removeSync deletes directory', () => {
        mockFileSystem.set('wxfile://usr/sync-delete', { type: 'directory' });

        const result = minaFsSync.removeSync('/sync-delete');
        expect(result.isOk()).toBe(true);
    });

    test('statSync returns file stats', () => {
        mockFileSystem.set('wxfile://usr/sync-stat', { type: 'file', content: 'data' });

        const result = minaFsSync.statSync('/sync-stat');
        expect(result.isOk()).toBe(true);
    });

    test('statSync with recursive returns FileStats array', () => {
        mockFileSystem.set('wxfile://usr/sync-stat-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/sync-stat-dir/file.txt', { type: 'file', content: 'data' });

        const result = minaFsSync.statSync('/sync-stat-dir', { recursive: true });
        expect(result.isOk()).toBe(true);
    });

    test('existsSync returns true for existing file', () => {
        mockFileSystem.set('wxfile://usr/sync-exists', { type: 'file', content: 'data' });

        const result = minaFsSync.existsSync('/sync-exists');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(true);
    });

    test('copySync copies file', () => {
        mockFileSystem.set('wxfile://usr/sync-src', { type: 'file', content: 'data' });

        const result = minaFsSync.copySync('/sync-src', '/sync-dest');
        expect(result.isOk()).toBe(true);
    });

    test('emptyDirSync clears directory', () => {
        mockFileSystem.set('wxfile://usr/sync-empty', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/sync-empty/file.txt', { type: 'file', content: 'data' });

        const result = minaFsSync.emptyDirSync('/sync-empty');
        expect(result.isOk()).toBe(true);
    });

    test('readTextFileSync reads file as string', () => {
        mockFileSystem.set('wxfile://usr/sync-text.txt', { type: 'file', content: 'Sync Text' });

        const result = minaFsSync.readTextFileSync('/sync-text.txt');
        expect(result.isOk()).toBe(true);
    });

    test('readJsonFileSync parses JSON file', () => {
        mockFileSystem.set('wxfile://usr/sync-data.json', { type: 'file', content: '{"sync":true}' });

        const result = minaFsSync.readJsonFileSync<{ sync: boolean; }>('/sync-data.json');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({ sync: true });
    });

    test('readJsonFileSync parses JSON array', () => {
        mockFileSystem.set('wxfile://usr/array.json', { type: 'file', content: '[1, 2, 3, "four"]' });

        const result = minaFsSync.readJsonFileSync<(number | string)[]>('/array.json');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([1, 2, 3, 'four']);
    });

    test('readJsonFileSync parses nested JSON object', () => {
        const nestedJson = JSON.stringify({
            name: 'test',
            nested: {
                level1: {
                    level2: {
                        value: 42,
                    },
                },
            },
            items: [{ id: 1 }, { id: 2 }],
        });
        mockFileSystem.set('wxfile://usr/nested.json', { type: 'file', content: nestedJson });

        const result = minaFsSync.readJsonFileSync<{
            name: string;
            nested: { level1: { level2: { value: number; }; }; };
            items: { id: number; }[];
        }>('/nested.json');
        expect(result.isOk()).toBe(true);
        const data = result.unwrap();
        expect(data.name).toBe('test');
        expect(data.nested.level1.level2.value).toBe(42);
        expect(data.items).toHaveLength(2);
    });

    test('readJsonFileSync returns error for non-existent file', () => {
        const result = minaFsSync.readJsonFileSync('/non-existent.json');
        expect(result.isErr()).toBe(true);
    });

    test('readJsonFileSync returns error for invalid JSON', () => {
        mockFileSystem.set('wxfile://usr/invalid.json', { type: 'file', content: '{invalid json}' });

        const result = minaFsSync.readJsonFileSync('/invalid.json');
        expect(result.isErr()).toBe(true);
    });

    test('readJsonFileSync parses JSON with special characters', () => {
        const jsonWithSpecialChars = JSON.stringify({
            message: '你好世界',
            emoji: '😀🎉',
            special: 'line1\nline2\ttab',
        });
        mockFileSystem.set('wxfile://usr/special.json', { type: 'file', content: jsonWithSpecialChars });

        const result = minaFsSync.readJsonFileSync<{
            message: string;
            emoji: string;
            special: string;
        }>('/special.json');
        expect(result.isOk()).toBe(true);
        const data = result.unwrap();
        expect(data.message).toBe('你好世界');
        expect(data.emoji).toBe('😀🎉');
        expect(data.special).toBe('line1\nline2\ttab');
    });

    test('writeJsonFileSync writes JSON data', () => {
        const result = minaFsSync.writeJsonFileSync('/sync-output.json', { sync: true });
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs path validation', () => {
    test('rejects relative path', async () => {
        const result = await minaFsAsync.readFile('relative/path');
        expect(result.isErr()).toBe(true);
    });

    test('accepts full wxfile:// path', async () => {
        mockFileSystem.set('wxfile://usr/full-path', { type: 'file', content: 'data' });

        const result = await minaFsAsync.readFile('wxfile://usr/full-path');
        expect(result.isOk()).toBe(true);
    });

    test('normalizes path with ..', async () => {
        mockFileSystem.set('wxfile://usr/normalized', { type: 'file', content: 'data' });

        const result = await minaFsAsync.readFile('/test/../normalized');
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs error handling', () => {
    test('readFile returns error for non-existent file', async () => {
        const result = await minaFsAsync.readFile('/non-existent');
        expect(result.isErr()).toBe(true);
    });

    test('move returns error for non-existent source', async () => {
        const result = await minaFsAsync.move('/non-existent', '/dest');
        expect(result.isErr()).toBe(true);
    });

    test('stat returns error for non-existent path', async () => {
        const result = await minaFsAsync.stat('/non-existent');
        expect(result.isErr()).toBe(true);
    });

    test('exists with invalid options returns error', async () => {
        // @ts-expect-error ==测试错误处理==
        const result = await minaFsAsync.exists('/path', { isFile: true, isDirectory: true });
        expect(result.isErr()).toBe(true);
    });

    test('writeFile with append and create=false on non-existent file returns error', async () => {
        const result = await minaFsAsync.writeFile('/non-existent.txt', 'data', { append: true, create: false });
        expect(result.isErr()).toBe(true);
    });

    test('writeFileSync with append and create=false on non-existent file returns error', () => {
        const result = minaFsSync.writeFileSync('/non-existent.txt', 'data', { append: true, create: false });
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs zip operations', () => {
    test('zip compresses single file to bytes', async () => {
        // 使用 ArrayBuffer 类型的内容
        const content = new TextEncoder().encode('zip content').buffer;
        mockFileSystem.set('wxfile://usr/to-zip.txt', { type: 'file', content });

        const result = await minaFsAsync.zip('/to-zip.txt');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBeInstanceOf(Uint8Array);
    });

    test('zip compresses directory to bytes', async () => {
        const content = new TextEncoder().encode('data').buffer;
        mockFileSystem.set('wxfile://usr/zip-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/zip-dir/file.txt', { type: 'file', content });

        const result = await minaFsAsync.zip('/zip-dir');
        expect(result.isOk()).toBe(true);
    });

    test('zip compresses directory without preserveRoot', async () => {
        const content = new TextEncoder().encode('data').buffer;
        mockFileSystem.set('wxfile://usr/zip-dir-no-root', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/zip-dir-no-root/file.txt', { type: 'file', content });

        const result = await minaFsAsync.zip('/zip-dir-no-root', { preserveRoot: false });
        expect(result.isOk()).toBe(true);
    });

    test('zip writes to file when path provided', async () => {
        const content = new TextEncoder().encode('zip content').buffer;
        mockFileSystem.set('wxfile://usr/to-zip-file.txt', { type: 'file', content });

        const result = await minaFsAsync.zip('/to-zip-file.txt', '/output.zip');
        expect(result.isOk()).toBe(true);
    });

    test('zip returns error for non-existent source', async () => {
        const result = await minaFsAsync.zip('/non-existent');
        expect(result.isErr()).toBe(true);
    });

    test('zipSync compresses single file to bytes', () => {
        const content = new TextEncoder().encode('sync zip').buffer;
        mockFileSystem.set('wxfile://usr/sync-zip.txt', { type: 'file', content });

        const result = minaFsSync.zipSync('/sync-zip.txt');
        expect(result.isOk()).toBe(true);
    });

    test('zipSync compresses directory', () => {
        const content = new TextEncoder().encode('data').buffer;
        mockFileSystem.set('wxfile://usr/sync-zip-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/sync-zip-dir/file.txt', { type: 'file', content });

        const result = minaFsSync.zipSync('/sync-zip-dir');
        expect(result.isOk()).toBe(true);
    });

    test('zipSync writes to file when path provided', () => {
        const content = new TextEncoder().encode('zip').buffer;
        mockFileSystem.set('wxfile://usr/sync-zip-file.txt', { type: 'file', content });

        const result = minaFsSync.zipSync('/sync-zip-file.txt', '/sync-output.zip');
        expect(result.isOk()).toBe(true);
    });

    test('unzipFromUrl downloads and extracts', async () => {
        // 设置下载的临时文件
        mockFileSystem.set('wxfile://tmp/downloaded.zip', { type: 'file', content: new ArrayBuffer(100) });

        const result = await minaFsAsync.unzipFromUrl('https://example.com/file.zip', '/extracted');
        expect(result.isOk()).toBe(true);
    });

    test('zipFromUrl downloads and compresses', async () => {
        // 设置下载的临时文件
        const content = new TextEncoder().encode('downloaded content').buffer;
        mockFileSystem.set('wxfile://tmp/downloaded.zip', { type: 'file', content });

        const result = await minaFsAsync.zipFromUrl('https://example.com/file.txt');
        expect(result.isOk()).toBe(true);
    });

    test('zipFromUrl with output path', async () => {
        // 设置下载的临时文件
        const content = new TextEncoder().encode('downloaded content').buffer;
        mockFileSystem.set('wxfile://tmp/downloaded.zip', { type: 'file', content });

        const result = await minaFsAsync.zipFromUrl('https://example.com/file.txt', '/compressed.zip');
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs downloadFile edge cases', () => {
    test('downloadFile with invalid URL returns error', async () => {
        const task = minaFsAsync.downloadFile('invalid-url');
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });

    test('downloadFile abort works', async () => {
        const task = minaFsAsync.downloadFile('https://example.com/file.zip');
        task.abort();
        expect(task.aborted).toBe(true);
    });

    test('downloadFile with onProgress callback', async () => {
        const onProgress = vi.fn();
        const task = minaFsAsync.downloadFile('https://example.com/file.zip', { onProgress });
        await task.result;
        // onProgress 会在模拟下载过程中被调用
    });

    test('uploadFile with invalid URL returns error', async () => {
        mockFileSystem.set('wxfile://usr/upload.txt', { type: 'file', content: 'data' });
        const task = minaFsAsync.uploadFile('/upload.txt', 'invalid-url');
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });

    test('uploadFile with invalid filePath returns error', async () => {
        const task = minaFsAsync.uploadFile('relative-path', 'https://example.com/upload');
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs copy operations', () => {
    test('copy copies directory recursively', async () => {
        mockFileSystem.set('wxfile://usr/src-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/src-dir/subdir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/src-dir/file.txt', { type: 'file', content: 'data' });
        mockFileSystem.set('wxfile://usr/src-dir/subdir/nested.txt', { type: 'file', content: 'nested' });

        const result = await minaFsAsync.copy('/src-dir', '/dest-dir');
        expect(result.isOk()).toBe(true);
    });

    test('copySync copies directory recursively', () => {
        mockFileSystem.set('wxfile://usr/sync-src-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/sync-src-dir/file.txt', { type: 'file', content: 'data' });

        const result = minaFsSync.copySync('/sync-src-dir', '/sync-dest-dir');
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs shared utilities', () => {
    test('validateAbsolutePath rejects non-string path', async () => {
        // @ts-expect-error 测试非字符串路径===
        const result = await minaFsAsync.readFile(123);
        expect(result.isErr()).toBe(true);
    });

    test('validateAbsolutePath rejects root directory only', async () => {
        const result = await minaFsAsync.readFile('wxfile://');
        expect(result.isErr()).toBe(true);
    });

    test('validateAbsolutePath rejects wxfile:// root path', async () => {
        // 完整路径是根路径时返回错误
        const result = await minaFsAsync.readFile('wxfile://usr');
        expect(result.isErr()).toBe(true);
    });

    test('validateAbsolutePath rejects wxfile:/// normalized to root', async () => {
        // wxfile:/// 经过处理后变为根路径 /
        const result = await minaFsAsync.readFile('wxfile:///');
        expect(result.isErr()).toBe(true);
    });

    test('validateAbsolutePath handles wxfile:///usr format with extra slash', async () => {
        // 处理 wxfile:///usr 这样的多斜杠情况
        // wxfile:///usr/slash-test.txt 会被处理为 wxfile://usr/slash-test.txt
        mockFileSystem.set('wxfile://usr/slash-test.txt', { type: 'file', content: 'content' });

        const result = await minaFsAsync.readFile('wxfile:///usr/slash-test.txt');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('content');
    });

    test('exists with isDirectory option', async () => {
        mockFileSystem.set('wxfile://usr/check-dir', { type: 'directory' });
        mockFileSystem.set('wxfile://usr/check-file', { type: 'file', content: 'data' });

        const dirResult = await minaFsAsync.exists('/check-dir', { isDirectory: true });
        expect(dirResult.unwrap()).toBe(true);

        const fileResult = await minaFsAsync.exists('/check-file', { isDirectory: true });
        expect(fileResult.unwrap()).toBe(false);
    });

    test('existsSync with isDirectory option', () => {
        mockFileSystem.set('wxfile://usr/sync-check-dir', { type: 'directory' });

        const result = minaFsSync.existsSync('/sync-check-dir', { isDirectory: true });
        expect(result.unwrap()).toBe(true);
    });
});

describe('mina fs writeFile with binary content', () => {
    test('writeFile writes Uint8Array content', async () => {
        const content = new Uint8Array([1, 2, 3, 4, 5]);
        const result = await minaFsAsync.writeFile('/binary-file.bin', content);
        expect(result.isOk()).toBe(true);
    });

    test('writeFile writes ArrayBuffer content', async () => {
        const content = new ArrayBuffer(10);
        const result = await minaFsAsync.writeFile('/arraybuffer-file.bin', content);
        expect(result.isOk()).toBe(true);
    });

    test('writeFileSync writes Uint8Array content', () => {
        const content = new Uint8Array([1, 2, 3, 4, 5]);
        const result = minaFsSync.writeFileSync('/sync-binary-file.bin', content);
        expect(result.isOk()).toBe(true);
    });

    test('writeFileSync writes ArrayBuffer content', () => {
        const content = new ArrayBuffer(10);
        const result = minaFsSync.writeFileSync('/sync-arraybuffer-file.bin', content);
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs unzipSync operations', () => {
    test('unzipSync returns error for non-existent zip file', () => {
        const result = minaFsSync.unzipSync('/non-existent.zip', '/dest');
        expect(result.isErr()).toBe(true);
    });

    test('unzipSync returns error for invalid zip content', () => {
        mockFileSystem.set('wxfile://usr/invalid.zip', { type: 'file', content: new ArrayBuffer(10) });

        const result = minaFsSync.unzipSync('/invalid.zip', '/invalid-dest');
        expect(result.isErr()).toBe(true);
    });

    test('unzipSync with invalid destDir path returns error', () => {
        const result = minaFsSync.unzipSync('/test.zip', 'relative-path');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs downloadFile progress edge cases', () => {
    test('downloadFile onProgress callback receives unknown progress', async () => {
        // 重新 mock downloadFile 来触发 unknown progress
        const progressCallback = vi.fn();

        // 保存原始的 mock
        const originalDownloadFile = vi.mocked(wx.downloadFile);

        // 创建一个新的 mock 来触发 unknown progress
        vi.mocked(wx.downloadFile).mockImplementationOnce((options) => {
            const mockTask = {
                abort: vi.fn(),
                onProgressUpdate: (callback: (progress: WechatMinigame.DownloadTaskOnProgressUpdateListenerResult) => void) => {
                    // 触发一个没有有效进度信息的回调
                    setTimeout(() => {
                        callback({
                            progress: 0,
                            totalBytesExpectedToWrite: undefined as unknown as number,
                            totalBytesWritten: undefined as unknown as number,
                        });
                    }, 0);
                },
                offProgressUpdate: vi.fn(),
                onHeadersReceived: vi.fn(),
                offHeadersReceived: vi.fn(),
            };

            setTimeout(() => {
                options.success?.({
                    tempFilePath: 'wxfile://tmp/progress.zip',
                    statusCode: 200,
                    filePath: '',
                    errMsg: 'downloadFile:ok',
                    profile: {} as WechatMinigame.RequestProfile,
                });
            }, 10);

            return mockTask;
        });

        const task = minaFsAsync.downloadFile('https://example.com/file.zip', { onProgress: progressCallback });
        await task.result;

        // 恢复原始 mock
        vi.mocked(wx.downloadFile).mockImplementation(originalDownloadFile);
    });

    test('downloadFile handles error status code', async () => {
        vi.mocked(wx.downloadFile).mockImplementationOnce((options) => {
            setTimeout(() => {
                options.success?.({
                    tempFilePath: '',
                    statusCode: 404,
                    filePath: 'wxfile://usr/downloads/notfound.zip',
                    errMsg: 'downloadFile:fail not found',
                    profile: {} as WechatMinigame.RequestProfile,
                });
            }, 0);

            return {
                abort: vi.fn(),
                onProgressUpdate: vi.fn(),
                offProgressUpdate: vi.fn(),
                onHeadersReceived: vi.fn(),
                offHeadersReceived: vi.fn(),
            };
        });

        mockFileSystem.set('wxfile://usr/downloads', { type: 'directory' });
        const task = minaFsAsync.downloadFile('https://example.com/notfound.zip', '/downloads/notfound.zip');
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });

    test('downloadFile handles fail callback', async () => {
        vi.mocked(wx.downloadFile).mockImplementationOnce((options) => {
            setTimeout(() => {
                options.fail?.({
                    errMsg: 'downloadFile:fail network error',
                });
            }, 0);

            return {
                abort: vi.fn(),
                onProgressUpdate: vi.fn(),
                offProgressUpdate: vi.fn(),
                onHeadersReceived: vi.fn(),
                offHeadersReceived: vi.fn(),
            };
        });

        const task = minaFsAsync.downloadFile('https://example.com/fail.zip');
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });

    test('downloadFile abort before download starts', async () => {
        vi.mocked(wx.downloadFile).mockImplementationOnce((options) => {
            // 延迟执行 success，让 abort 有机会先执行
            setTimeout(() => {
                options.success?.({
                    tempFilePath: 'wxfile://tmp/aborted.zip',
                    statusCode: 200,
                    filePath: '',
                    errMsg: 'downloadFile:ok',
                    profile: {} as WechatMinigame.RequestProfile,
                });
            }, 100);

            return {
                abort: vi.fn(),
                onProgressUpdate: vi.fn(),
                offProgressUpdate: vi.fn(),
                onHeadersReceived: vi.fn(),
                offHeadersReceived: vi.fn(),
            };
        });

        mockFileSystem.set('wxfile://usr/downloads', { type: 'directory' });
        const task = minaFsAsync.downloadFile('https://example.com/file.zip', '/downloads/file.zip');

        // 立即 abort
        task.abort();

        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs mkdir error handling', () => {
    test('mkdir handles already exists error as success', async () => {
        // Mock mkdir 返回 already exists 错误
        vi.mocked(mockFsManager.mkdir).mockImplementationOnce(({ fail }) => {
            fail?.({ errMsg: 'file already exists', errCode: 1301005 });
        });

        const result = await minaFsAsync.mkdir('/already-exists-dir');
        expect(result.isOk()).toBe(true);
    });

    test('mkdirSync handles already exists error as success', () => {
        // Mock mkdirSync 抛出 already exists 错误
        vi.mocked(mockFsManager.mkdirSync).mockImplementationOnce(() => {
            const err = new Error('file already exists') as Error & { errno: number; };
            err.errno = 1301005;
            throw err;
        });

        const result = minaFsSync.mkdirSync('/sync-already-exists-dir');
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs zip empty directory', () => {
    test('zip returns error for empty directory without files', async () => {
        mockFileSystem.set('wxfile://usr/empty-zip-dir', { type: 'directory' });

        const result = await minaFsAsync.zip('/empty-zip-dir', { preserveRoot: false });
        expect(result.isErr()).toBe(true);
    });

    test('zipSync returns error for empty directory without files', () => {
        mockFileSystem.set('wxfile://usr/sync-empty-zip-dir', { type: 'directory' });

        const result = minaFsSync.zipSync('/sync-empty-zip-dir', { preserveRoot: false });
        expect(result.isErr()).toBe(true);
    });
});









test.afterAll(() => {
    vi.unstubAllGlobals();
});
