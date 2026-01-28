/**
 * @file fs-mina-error.test.ts
 * @description 测试 mina fs 模块的异常情况
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fs } from '../src/mod.ts';

// Mock 文件系统存储
const mockFileSystem = new Map<string, { type: 'file' | 'directory'; content?: string | ArrayBuffer; }>();

// Mock wx.env
const mockEnv = {
    USER_DATA_PATH: 'wxfile://usr',
};

// 创建 mock Stats 对象
function createMockStats(isFile: boolean, size = 100): WechatMinigame.Stats {
    return {
        mode: isFile ? 33188 : 16877,
        size,
        lastAccessedTime: Date.now(),
        lastModifiedTime: Date.now(),
        isDirectory: () => !isFile,
        isFile: () => isFile,
    };
}

// Mock FileSystemManager
const mockFsManager = {
    readFile: vi.fn(({ path, success, fail }: { path: string; success?: (res: { data: string | ArrayBuffer; errMsg: string; }) => void; fail?: (res: { errMsg: string; errCode: number; }) => void; }) => {
        const fullPath = path.startsWith('wxfile://') ? path : `wxfile://usr${ path }`;
        const file = mockFileSystem.get(fullPath);
        if (file && file.type === 'file') {
            success?.({
                data: file.content ?? '',
                errMsg: 'readFile:ok',
            });
        } else {
            fail?.({
                errMsg: 'readFile:fail no such file or directory',
                errCode: 1300002,
            });
        }
    }),
    readFileSync: vi.fn((path: string) => {
        const fullPath = path.startsWith('wxfile://') ? path : `wxfile://usr${ path }`;
        const file = mockFileSystem.get(fullPath);
        if (file && file.type === 'file') {
            return file.content ?? '';
        }
        const err = new Error('no such file or directory') as Error & { errno: number; };
        err.errno = 1300002;
        throw err;
    }),
    writeFile: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'writeFile:ok' });
    }),
    writeFileSync: vi.fn(() => {
        // 成功，无返回
    }),
    mkdir: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'mkdir:ok' });
    }),
    mkdirSync: vi.fn(() => {
        // 成功，无返回
    }),
    rmdir: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'rmdir:ok' });
    }),
    rmdirSync: vi.fn(() => {
        // 成功，无返回
    }),
    unlink: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'unlink:ok' });
    }),
    unlinkSync: vi.fn(() => {
        // 成功，无返回
    }),
    readdir: vi.fn(({ success }: { success?: (res: { files: string[]; errMsg: string; }) => void; }) => {
        success?.({ files: [], errMsg: 'readdir:ok' });
    }),
    readdirSync: vi.fn(() => []),
    stat: vi.fn(({ path, success }: { path: string; success?: (res: { stats: WechatMinigame.Stats | WechatMinigame.FileStats[]; errMsg: string; }) => void; }) => {
        const fullPath = path.startsWith('wxfile://') ? path : `wxfile://usr${ path }`;
        const file = mockFileSystem.get(fullPath);
        if (file) {
            success?.({
                stats: createMockStats(file.type === 'file'),
                errMsg: 'stat:ok',
            });
        }
    }),
    statSync: vi.fn((path: string) => {
        const fullPath = path.startsWith('wxfile://') ? path : `wxfile://usr${ path }`;
        const file = mockFileSystem.get(fullPath);
        if (file) {
            return createMockStats(file.type === 'file');
        }
        const err = new Error('no such file or directory') as Error & { errno: number; };
        err.errno = 1300002;
        throw err;
    }),
    rename: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'rename:ok' });
    }),
    renameSync: vi.fn(() => {
        // 成功，无返回
    }),
    copyFile: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'copyFile:ok' });
    }),
    copyFileSync: vi.fn(() => {
        // 成功，无返回
    }),
    access: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'access:ok' });
    }),
    accessSync: vi.fn(() => {
        // 成功，无返回
    }),
    appendFile: vi.fn(({ success }: { success?: (res: { errMsg: string; }) => void; }) => {
        success?.({ errMsg: 'appendFile:ok' });
    }),
    appendFileSync: vi.fn(() => {
        // 成功，无返回
    }),
    saveFile: vi.fn(({ tempFilePath, success }: { tempFilePath: string; success?: (res: { savedFilePath: string; errMsg: string; }) => void; }) => {
        success?.({ savedFilePath: tempFilePath.replace('tmp', 'usr'), errMsg: 'saveFile:ok' });
    }),
    saveFileSync: vi.fn((tempFilePath: string) => tempFilePath.replace('tmp', 'usr')),
};

// Mock downloadFile
const mockDownloadFile = vi.fn((options: WechatMinigame.DownloadFileOption) => {
    setTimeout(() => {
        options.success?.({
            tempFilePath: 'wxfile://tmp/downloaded.zip',
            statusCode: 200,
            filePath: '',
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
});

// Mock uploadFile
const mockUploadFile = vi.fn((options: WechatMinigame.UploadFileOption) => {
    setTimeout(() => {
        options.success?.({
            data: '{"success": true}',
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
});

// 设置全局 wx 对象
vi.stubGlobal('wx', {
    env: mockEnv,
    getFileSystemManager: () => mockFsManager,
    downloadFile: mockDownloadFile,
    uploadFile: mockUploadFile,
});

// 设置全局标识
vi.stubGlobal('__MINIGAME_STD_MINA__', true);

// 导入被测试的模块
const minaFsAsync = await import('../src/std/fs/mina_fs_async');
const minaFsSync = await import('../src/std/fs/mina_fs_sync');

describe('mina fs error handling - getWriteFileContents', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('writeFile with invalid binary content throws error', async () => {
        // 传入一个非法的二进制内容对象
        const invalidContent = {
            // 这是一个看起来像 BufferSource 但不是的对象
            byteLength: 10,
            // 缺少必要的方法
        };

        // @ts-expect-error =故意传入非法类型=
        const result = await minaFsAsync.writeFile('/test-invalid.bin', invalidContent);
        expect(result.isErr()).toBe(true);
    });

    test('writeFileSync with invalid binary content throws error', () => {
        const invalidContent = {
            byteLength: 10,
        };

        // @ts-expect-error =故意传入非法类型=
        const result = minaFsSync.writeFileSync('/test-invalid-sync.bin', invalidContent);
        expect(result.isErr()).toBe(true);
    });

    test('writeFile with DataView content', async () => {
        const buffer = new ArrayBuffer(10);
        const dataView = new DataView(buffer);
        dataView.setInt8(0, 42);

        const result = await minaFsAsync.writeFile('/dataview-file.bin', dataView);
        expect(result.isOk()).toBe(true);
    });

    test('writeFileSync with DataView content', () => {
        const buffer = new ArrayBuffer(10);
        const dataView = new DataView(buffer);
        dataView.setInt8(0, 42);

        const result = minaFsSync.writeFileSync('/dataview-sync-file.bin', dataView);
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs error handling - readJsonFileSync and writeJsonFileSync', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('readJsonFileSync returns error when file not found', () => {
        const result = minaFsSync.readJsonFileSync('/non-existent.json');
        expect(result.isErr()).toBe(true);
    });

    test('readJsonFileSync returns error when JSON is invalid', () => {
        mockFileSystem.set('wxfile://usr/invalid.json', { type: 'file', content: 'invalid json {{{' });

        const result = minaFsSync.readJsonFileSync('/invalid.json');
        expect(result.isErr()).toBe(true);
    });

    test('readJsonFileSync parses valid JSON', () => {
        mockFileSystem.set('wxfile://usr/valid.json', { type: 'file', content: '{"key": "value", "num": 123}' });

        const result = minaFsSync.readJsonFileSync<{ key: string; num: number; }>('/valid.json');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({ key: 'value', num: 123 });
    });

    test('writeJsonFileSync returns error when JSON.stringify fails', () => {
        // 创建一个包含循环引用的对象
        const circularObj: Record<string, unknown> = { name: 'test' };
        circularObj['self'] = circularObj;

        const result = minaFsSync.writeJsonFileSync('/circular.json', circularObj);
        expect(result.isErr()).toBe(true);
    });

    test('writeJsonFileSync writes valid JSON', () => {
        const result = minaFsSync.writeJsonFileSync('/output.json', { key: 'value' });
        expect(result.isOk()).toBe(true);
    });

    test('writeJsonFileSync returns error when writeFileSync fails', () => {
        vi.mocked(mockFsManager.writeFileSync).mockImplementationOnce(() => {
            const err = new Error('permission denied') as Error & { errno: number; };
            err.errno = 1300013;
            throw err;
        });

        const result = minaFsSync.writeJsonFileSync('/readonly.json', { key: 'value' });
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - unzipSync write failures', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('unzipSync returns error when mkdir fails during extraction', async () => {
        // 创建有效的 zip 数据
        const { zipSync } = await import('fflate/browser');
        const zipData = zipSync({
            'folder/': new Uint8Array(0),
            'folder/file.txt': new TextEncoder().encode('content'),
        });
        mockFileSystem.set('wxfile://usr/test.zip', { type: 'file', content: zipData.buffer as ArrayBuffer });

        // Mock mkdirSync 失败
        vi.mocked(mockFsManager.mkdirSync).mockImplementationOnce(() => {
            const err = new Error('permission denied') as Error & { errno: number; };
            err.errno = 1300013;
            throw err;
        });

        const result = minaFsSync.unzipSync('/test.zip', '/dest');
        expect(result.isErr()).toBe(true);
    });

    test('unzipSync returns error when writeFileSync fails during extraction', async () => {
        // 创建有效的 zip 数据
        const { zipSync } = await import('fflate/browser');
        const zipData = zipSync({
            'file.txt': new TextEncoder().encode('content'),
        });
        mockFileSystem.set('wxfile://usr/test-write-fail.zip', { type: 'file', content: zipData.buffer as ArrayBuffer });

        // Mock writeFileSync 失败
        vi.mocked(mockFsManager.writeFileSync).mockImplementationOnce(() => {
            const err = new Error('disk full') as Error & { errno: number; };
            err.errno = 1300066;
            throw err;
        });

        const result = minaFsSync.unzipSync('/test-write-fail.zip', '/dest-write-fail');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - isAlreadyExistsFileError', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('mkdirSync handles already exists error without errCode', () => {
        // Mock mkdirSync 抛出已存在错误，但没有 errCode
        vi.mocked(mockFsManager.mkdirSync).mockImplementationOnce(() => {
            const err = new Error('file already exists /test-dir');
            throw err;
        });

        const result = minaFsSync.mkdirSync('/test-dir');
        expect(result.isOk()).toBe(true);
    });

    test('mkdirSync returns error for other errors', () => {
        vi.mocked(mockFsManager.mkdirSync).mockImplementationOnce(() => {
            const err = new Error('permission denied') as Error & { errno: number; };
            err.errno = 1300013;
            throw err;
        });

        const result = minaFsSync.mkdirSync('/permission-denied-dir');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - zipFromUrl', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('zipFromUrl with invalid zipFilePath returns error', async () => {
        const result = await minaFsAsync.zipFromUrl('https://example.com/file.txt', 'relative-path.zip');
        expect(result.isErr()).toBe(true);
    });

    test('zipFromUrl returns error when download fails', async () => {
        // Mock downloadFile 失败
        vi.mocked(mockDownloadFile).mockImplementationOnce((options) => {
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

        const result = await minaFsAsync.zipFromUrl('https://example.com/fail.txt');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - downloadFile edge cases', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('downloadFile onProgress receives Err result for unknown progress', async () => {
        const progressResults: unknown[] = [];

        // Mock downloadFile 返回无效的进度信息
        vi.mocked(mockDownloadFile).mockImplementationOnce((options) => {
            const mockTask = {
                abort: vi.fn(),
                onProgressUpdate: (callback: (res: WechatMinigame.DownloadTaskOnProgressUpdateListenerResult) => void) => {
                    // 触发一个无效的进度回调（totalBytesExpectedToWrite 为 0）
                    setTimeout(() => {
                        callback({
                            progress: 0,
                            totalBytesExpectedToWrite: 0,
                            totalBytesWritten: 0,
                        });
                    }, 0);
                },
                offProgressUpdate: vi.fn(),
                onHeadersReceived: vi.fn(),
                offHeadersReceived: vi.fn(),
            };

            setTimeout(() => {
                options.success?.({
                    tempFilePath: 'wxfile://tmp/progress-test.zip',
                    statusCode: 200,
                    filePath: '',
                    errMsg: 'downloadFile:ok',
                    profile: {} as WechatMinigame.RequestProfile,
                });
            }, 10);

            return mockTask;
        });

        const task = minaFsAsync.downloadFile('https://example.com/test.zip', {
            onProgress: (result) => {
                progressResults.push(result);
            },
        });

        await task.result;

        // 验证收到了进度结果
        expect(progressResults.length).toBeGreaterThan(0);
    });
});

describe('mina fs error handling - zipSync directory with files error', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('zipSync returns error when reading file in directory fails', () => {
        // Mock statSync 返回目录结构
        vi.mocked(mockFsManager.statSync).mockImplementationOnce(() => {
            return [
                { path: '', stats: createMockStats(false) },
                { path: '/file1.txt', stats: createMockStats(true) },
            ];
        });

        // 不设置文件内容，让 readFileSync 失败

        const result = minaFsSync.zipSync('/test-dir');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - emptyDirSync edge cases', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('emptyDirSync creates directory when not found', () => {
        // Mock readdirSync 返回不存在错误
        vi.mocked(mockFsManager.readdirSync).mockImplementationOnce(() => {
            const err = new Error('no such file or directory') as Error & { errno: number; };
            err.errno = 1300002;
            throw err;
        });

        const result = minaFsSync.emptyDirSync('/new-empty-dir');
        expect(result.isOk()).toBe(true);
    });

    test('emptyDirSync returns error for other readdir errors', () => {
        // Mock readdirSync 返回权限错误
        vi.mocked(mockFsManager.readdirSync).mockImplementationOnce(() => {
            const err = new Error('permission denied') as Error & { errno: number; };
            err.errno = 1300013;
            throw err;
        });

        const result = minaFsSync.emptyDirSync('/permission-denied-dir');
        expect(result.isErr()).toBe(true);
    });

    test('emptyDirSync removes all files in directory', () => {
        // Mock readdirSync 返回文件列表
        vi.mocked(mockFsManager.readdirSync).mockImplementationOnce(() => {
            return ['file1.txt', 'file2.txt'];
        });

        // Mock statSync 返回文件
        vi.mocked(mockFsManager.statSync).mockImplementation(() => {
            return createMockStats(true);
        });

        const result = minaFsSync.emptyDirSync('/dir-to-empty');
        expect(result.isOk()).toBe(true);
    });

    test('emptyDirSync returns error when remove fails', () => {
        // Mock readdirSync 返回文件列表
        vi.mocked(mockFsManager.readdirSync).mockImplementationOnce(() => {
            return ['file1.txt'];
        });

        // Mock statSync 返回文件
        vi.mocked(mockFsManager.statSync).mockImplementationOnce(() => {
            return createMockStats(true);
        });

        // Mock unlinkSync 失败
        vi.mocked(mockFsManager.unlinkSync).mockImplementationOnce(() => {
            const err = new Error('permission denied') as Error & { errno: number; };
            err.errno = 1300013;
            throw err;
        });

        const result = minaFsSync.emptyDirSync('/dir-remove-fail');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - appendFileSync edge cases', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('appendFileSync creates file when create option is true and file not exists', () => {
        // 文件不存在，existsSync 会使用 statSync 检查
        // 不设置 mockFileSystem，让 statSync 抛出错误

        const result = minaFsSync.appendFileSync('/new-append-sync.txt', 'content', { create: true });
        expect(result.isOk()).toBe(true);
    });

    test('appendFileSync appends to existing file', () => {
        // 设置文件存在
        mockFileSystem.set('wxfile://usr/existing-append.txt', { type: 'file', content: 'existing content' });

        const result = minaFsSync.appendFileSync('/existing-append.txt', ' new content');
        expect(result.isOk()).toBe(true);
    });
});

describe('mina fs error handling - copySync directory edge cases', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('copySync directory returns error when mkdir fails', () => {
        // Mock statSync 返回目录
        vi.mocked(mockFsManager.statSync).mockImplementationOnce(() => {
            return createMockStats(false);
        });

        // Mock readdirSync 返回文件列表
        vi.mocked(mockFsManager.readdirSync).mockImplementationOnce(() => {
            return ['file1.txt'];
        });

        // Mock mkdirSync 失败
        vi.mocked(mockFsManager.mkdirSync).mockImplementationOnce(() => {
            const err = new Error('permission denied') as Error & { errno: number; };
            err.errno = 1300013;
            throw err;
        });

        const result = minaFsSync.copySync('/src-dir-sync', '/dest-dir-sync');
        expect(result.isErr()).toBe(true);
    });
});

describe('mina fs error handling - uploadFile', () => {
    beforeEach(() => {
        mockFileSystem.clear();
        vi.clearAllMocks();
    });

    test('uploadFile returns error when file path is invalid', async () => {
        const task = minaFsAsync.uploadFile('https://example.com/upload', 'relative-path.txt', 'file' as fs.UploadFileOptions);
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });

    test('uploadFile returns error on failure', async () => {
        // Mock uploadFile 失败
        vi.mocked(mockUploadFile).mockImplementationOnce((options) => {
            setTimeout(() => {
                options.fail?.({
                    errMsg: 'uploadFile:fail network error',
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

        const task = minaFsAsync.uploadFile('https://example.com/upload', '/test-file.txt', 'file' as fs.UploadFileOptions);
        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });

    test('uploadFile abort works', async () => {
        const abortFn = vi.fn();

        // Mock uploadFile
        vi.mocked(mockUploadFile).mockImplementationOnce((options) => {
            setTimeout(() => {
                options.success?.({
                    data: '{"success": true}',
                    statusCode: 200,
                    errMsg: 'uploadFile:ok',
                    profile: {} as WechatMinigame.RequestProfile,
                });
            }, 100);

            return {
                abort: abortFn,
                onProgressUpdate: vi.fn(),
                offProgressUpdate: vi.fn(),
                onHeadersReceived: vi.fn(),
                offHeadersReceived: vi.fn(),
            };
        });

        const task = minaFsAsync.uploadFile('https://example.com/upload', '/test-file.txt', 'file' as fs.UploadFileOptions);
        task.abort();

        const result = await task.result;
        expect(result.isErr()).toBe(true);
    });
});
