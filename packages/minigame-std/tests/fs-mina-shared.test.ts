/**
 * @file fs-mina-shared.test.ts
 * @description 测试 mina_fs_shared.ts 中的公共函数
 */
import { Err, Ok } from 'happy-rusty';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
    accessExists,
    accessExistsSync,
    fileErrorToMkdirResult,
    fileErrorToRemoveResult,
    fileErrorToResult,
    getExistsResult,
    normalizeStats,
    validateAbsolutePath,
    validateReadablePath,
} from '../src/std/fs/mina_fs_shared.ts';

// Mock access/accessSync 函数（getFileSystemManager 返回的对象中引用）
const mockAccess = vi.fn();
const mockAccessSync = vi.fn();

// Mock wx 对象（validateReadablePath 需要访问 wx.env.USER_DATA_PATH；accessExists/accessExistsSync 需要 getFileSystemManager）
vi.stubGlobal('wx', {
    env: {
        USER_DATA_PATH: 'wxfile://usr',
    },
    getFileSystemManager: () => ({
        access: mockAccess,
        accessSync: mockAccessSync,
    }),
});

describe('mina_fs_shared', () => {
    describe('fileErrorToMkdirResult', () => {
        test('returns RESULT_VOID when file already exists (errCode 1301005)', () => {
            // 覆盖 isAlreadyExistsFileError 返回 true 的分支
            const error = {
                errCode: 1301005,
                errMsg: 'file already exists /test',
            };

            const result = fileErrorToMkdirResult(error);
            expect(result.isOk()).toBe(true);
        });

        test('returns RESULT_VOID when errMsg contains "already exists"', () => {
            // 覆盖通过 errMsg 判断已存在的分支
            const error = {
                errCode: 0,
                errMsg: 'directory already exists',
            };

            const result = fileErrorToMkdirResult(error);
            expect(result.isOk()).toBe(true);
        });

        test('returns error when not already exists error', () => {
            // 非已存在错误应该返回错误
            const error = {
                errCode: 1300001,
                errMsg: 'permission denied',
            };

            const result = fileErrorToMkdirResult(error);
            expect(result.isErr()).toBe(true);
        });

        test('returns error when errCode is 0 and errMsg does not contain already exists', () => {
            // 确保 errCode 为 0 且 errMsg 不包含 "already exists" 时返回错误
            const error = {
                errCode: 0,
                errMsg: 'some other error',
            };

            const result = fileErrorToMkdirResult(error);
            expect(result.isErr()).toBe(true);
        });
    });

    describe('fileErrorToResult', () => {
        test('converts Error instance with errno to result', () => {
            // 覆盖 normalizeFileError 中处理 Error 实例的分支
            const error = new Error('no such file or directory /test') as Error & { errno?: number; };
            error.errno = 1300002;

            const result = fileErrorToResult(error);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().name).toBe('NotFoundError');
        });

        test('converts Error instance without errno to result', () => {
            // 覆盖 error.errno ?? 0 的分支（errno 为 undefined）
            const error = new Error('some error message');

            const result = fileErrorToResult(error);
            expect(result.isErr()).toBe(true);
        });

        test('converts Error with "no such file" message to NotFoundError', () => {
            // 通过 errMsg 判断 NotFoundError
            const error = new Error('no such file or directory /path/to/file');

            const result = fileErrorToResult(error);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().name).toBe('NotFoundError');
        });
    });

    describe('fileErrorToRemoveResult', () => {
        test('returns RESULT_VOID when file not found (errCode 1300002)', () => {
            // 覆盖 isNotFoundFileError 返回 true 的分支
            const error = {
                errCode: 1300002,
                errMsg: 'no such file or directory /test',
            };

            const result = fileErrorToRemoveResult(error);
            expect(result.isOk()).toBe(true);
        });

        test('returns RESULT_VOID when errMsg contains "no such file or directory"', () => {
            // 通过 errMsg 判断文件不存在
            const error = {
                errCode: 0,
                errMsg: 'no such file or directory /path',
            };

            const result = fileErrorToRemoveResult(error);
            expect(result.isOk()).toBe(true);
        });

        test('returns error when not a NotFoundError', () => {
            // 非 NotFoundError 应该返回错误
            const error = {
                errCode: 1300001,
                errMsg: 'permission denied',
            };

            const result = fileErrorToRemoveResult(error);
            expect(result.isErr()).toBe(true);
        });
    });

    describe('normalizeStats', () => {
        test('normalizes FileStats array by removing leading slash and sorting by path', () => {
            // 覆盖 path.replace(/^\/+/, '') 分支和排序逻辑
            const fileStats: WechatMinigame.FileStats[] = [
                {
                    path: '/subdir',
                    stats: {
                        mode: 0,
                        size: 0,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => true,
                        isFile: () => false,
                    },
                },
                {
                    path: '/file.txt',
                    stats: {
                        mode: 0,
                        size: 100,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => false,
                        isFile: () => true,
                    },
                },
            ];

            const result = normalizeStats(fileStats, true) as WechatMinigame.FileStats[];

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            // 验证路径去掉了开头的 `/` 并按 path 排序 ('file.txt' < 'subdir')
            expect(result[0].path).toBe('file.txt');
            expect(result[1].path).toBe('subdir');
        });

        test('sorts parent directories before children', () => {
            // 验证父目录排在子目录/文件之前
            const fileStats: WechatMinigame.FileStats[] = [
                {
                    path: '/a/b/c.txt',
                    stats: {
                        mode: 0,
                        size: 100,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => false,
                        isFile: () => true,
                    },
                },
                {
                    path: '/a',
                    stats: {
                        mode: 0,
                        size: 0,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => true,
                        isFile: () => false,
                    },
                },
                {
                    path: '/a/b',
                    stats: {
                        mode: 0,
                        size: 0,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => true,
                        isFile: () => false,
                    },
                },
            ];

            const result = normalizeStats(fileStats, true) as WechatMinigame.FileStats[];

            expect(result).toHaveLength(3);
            // 父目录总是排在子目录/文件之前
            expect(result[0].path).toBe('a');
            expect(result[1].path).toBe('a/b');
            expect(result[2].path).toBe('a/b/c.txt');
        });

        test('normalizes FileStats array with recursive=false (array input always returns sorted array)', () => {
            // 测试数组输入时 recursive 参数不影响结果（数组始终返回处理并排序后的数组）
            const fileStats: WechatMinigame.FileStats[] = [
                {
                    path: '/z.txt',
                    stats: {
                        mode: 0,
                        size: 0,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => false,
                        isFile: () => true,
                    },
                },
                {
                    path: '/a.txt',
                    stats: {
                        mode: 0,
                        size: 0,
                        lastAccessedTime: 0,
                        lastModifiedTime: 0,
                        isDirectory: () => false,
                        isFile: () => true,
                    },
                },
            ];

            const result = normalizeStats(fileStats, false) as WechatMinigame.FileStats[];

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            // 验证排序 ('a.txt' < 'z.txt')
            expect(result[0].path).toBe('a.txt');
            expect(result[1].path).toBe('z.txt');
        });

        test('normalizes empty FileStats array', () => {
            // 测试空数组
            const fileStats: WechatMinigame.FileStats[] = [];

            const result = normalizeStats(fileStats, true) as WechatMinigame.FileStats[];

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });

        test('wraps single Stats in array when recursive is true', () => {
            // 覆盖单个 Stats + recursive=true 的分支
            const stats: WechatMinigame.Stats = {
                mode: 0,
                size: 0,
                lastAccessedTime: 0,
                lastModifiedTime: 0,
                isDirectory: () => true,
                isFile: () => false,
            };

            const result = normalizeStats(stats, true) as WechatMinigame.FileStats[];

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0].path).toBe('');
            expect(result[0].stats).toBe(stats);
        });

        test('returns single Stats when recursive is false', () => {
            // 覆盖单个 Stats + recursive=false 的分支
            const stats: WechatMinigame.Stats = {
                mode: 0,
                size: 100,
                lastAccessedTime: 0,
                lastModifiedTime: 0,
                isDirectory: () => false,
                isFile: () => true,
            };

            const result = normalizeStats(stats, false);

            expect(Array.isArray(result)).toBe(false);
            expect(result).toBe(stats);
        });
    });

    describe('getExistsResult', () => {
        test('returns true when stat succeeds and no options provided', () => {
            // 覆盖 options=undefined 时的 default value 分支（isDirectory/isFile 均默认 false）
            const stats: WechatMinigame.Stats = {
                mode: 0,
                size: 100,
                lastAccessedTime: 0,
                lastModifiedTime: 0,
                isDirectory: () => false,
                isFile: () => true,
            };

            const result = getExistsResult(Ok(stats));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(true);
        });

        test('returns false when stat fails with NotFoundError', () => {
            // 覆盖 orElse 中 isNotFoundError 为 true 的分支（返回 RESULT_FALSE）
            const error = new Error('no such file or directory /test');
            error.name = 'NotFoundError';

            const result = getExistsResult(Err<WechatMinigame.Stats, Error>(error));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(false);
        });

        test('returns error when stat fails with non-NotFoundError', () => {
            // 覆盖 getExistsResult 中 orElse 返回错误的分支
            const error = new Error('permission denied');
            error.name = 'PermissionError';

            const statResult = Err<WechatMinigame.Stats, Error>(error);
            const result = getExistsResult(statResult);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().name).toBe('PermissionError');
        });

        test('returns false when stats.size < 0 (Windows/Mac code package bug)', () => {
            // 覆盖 Windows/Mac 平台 stat 代码包不存在文件时的误报分支
            // 平台返回 stats.size = -1, 应视为不存在
            const stats: WechatMinigame.Stats = {
                mode: 511,
                size: -1,
                lastAccessedTime: null as unknown as number,
                lastModifiedTime: 0,
                isDirectory: () => false,
                isFile: () => true,
            };

            const result = getExistsResult(Ok(stats));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(false);
        });

        test('returns true for existing file with size 0 when no options', () => {
            // 确保正常空文件 (size=0) 不被误判为不存在
            const stats: WechatMinigame.Stats = {
                mode: 0,
                size: 0,
                lastAccessedTime: 0,
                lastModifiedTime: 0,
                isDirectory: () => false,
                isFile: () => true,
            };

            const result = getExistsResult(Ok(stats));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(true);
        });
    });

    describe('accessExists', () => {
        beforeEach(() => {
            mockAccess.mockReset();
        });

        test('returns error when path validation fails', async () => {
            // 覆盖 pathRes.isErr() 为 true 的分支（路径以 './' 开头不合法）
            const result = await accessExists('./invalid-path');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toContain("must not start with './' or '../'");
        });

        test('returns true when access succeeds', async () => {
            // 覆盖 access 成功的分支
            mockAccess.mockImplementation(({ success }) => {
                success?.({});
            });

            const result = await accessExists('/test');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(true);
        });

        test('returns false when access fails with NotFoundError', async () => {
            // 覆盖 accessResultToExists 中 isNotFoundError 为 true 的分支
            mockAccess.mockImplementation(({ fail }) => {
                fail?.({ errMsg: 'no such file or directory /test', errCode: 1300002 });
            });

            const result = await accessExists('/test');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(false);
        });

        test('returns error when access fails with non-NotFoundError', async () => {
            // 覆盖 accessResultToExists 中 isNotFoundError 为 false 的 Err 透传分支
            mockAccess.mockImplementation(({ fail }) => {
                fail?.({ errMsg: 'permission denied', errCode: 1300001 });
            });

            const result = await accessExists('/test');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toContain('permission denied');
        });
    });

    describe('accessExistsSync', () => {
        beforeEach(() => {
            mockAccessSync.mockReset();
        });

        test('returns error when path validation fails', () => {
            // 覆盖 pathRes.isErr() 为 true 的分支（路径以 './' 开头不合法）
            const result = accessExistsSync('./invalid-path');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toContain("must not start with './' or '../'");
        });

        test('returns true when accessSync succeeds', () => {
            // 覆盖 accessSync 成功的分支
            mockAccessSync.mockImplementation(() => {
                // 不抛异常即表示成功
            });

            const result = accessExistsSync('/test');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(true);
        });

        test('returns false when accessSync fails with NotFoundError', () => {
            // 覆盖 accessResultToExists 中 isNotFoundError 为 true 的分支
            mockAccessSync.mockImplementation(() => {
                const err = new Error('no such file or directory /test') as Error & { errno: number; };
                err.errno = 1300002;
                throw err;
            });

            const result = accessExistsSync('/test');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(false);
        });

        test('returns error when accessSync fails with non-NotFoundError', () => {
            // 覆盖 accessResultToExists 中 isNotFoundError 为 false 的 Err 透传分支
            mockAccessSync.mockImplementation(() => {
                const err = new Error('permission denied') as Error & { errno: number; };
                err.errno = 1300001;
                throw err;
            });

            const result = accessExistsSync('/test');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toContain('permission denied');
        });
    });

    describe('validateReadablePath', () => {
        test('returns error for path starting with "./"', () => {
            const result = validateReadablePath('./test/file.txt');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toContain("must not start with './' or '../'");
        });

        test('returns error for path starting with "../"', () => {
            const result = validateReadablePath('../test/file.txt');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toContain("must not start with './' or '../'");
        });

        test('accepts valid code package path', () => {
            const result = validateReadablePath('images/logo.png');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('images/logo.png');
        });

        test('accepts hidden file path starting with dot', () => {
            // .test.txt 是合法的代码包路径
            const result = validateReadablePath('.test.txt');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('.test.txt');
        });

        test('accepts path with ... prefix', () => {
            // .../test 是合法的代码包路径（只是一个名为 ... 的目录）
            const result = validateReadablePath('.../test');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('.../test');
        });

        test('accepts path with ..test prefix', () => {
            // ..test 是合法的代码包路径
            const result = validateReadablePath('..test');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('..test');
        });

        test('normalizes code package path', () => {
            // 验证代码包路径会被标准化
            const result = validateReadablePath('images//logo.png');

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('images/logo.png');
        });

        test('returns error for non-string path', () => {
            const result = validateReadablePath(123 as unknown as string);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(TypeError);
        });
    });

    describe('validateAbsolutePath', () => {
        test('returns error for non-string path', () => {
            const result = validateAbsolutePath(123 as unknown as string);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(TypeError);
        });
    });
});
