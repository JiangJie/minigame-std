/**
 * @file fs-mina-shared.test.ts
 * @description 测试 mina_fs_shared.ts 中的公共函数
 */
import { Err } from 'happy-rusty';
import { describe, expect, test, vi } from 'vitest';

import {
    fileErrorToMkdirResult,
    fileErrorToRemoveResult,
    fileErrorToResult,
    getExistsResult,
    normalizeStats,
    validateAbsolutePath,
    validateReadablePath,
} from '../src/std/fs/mina_fs_shared.ts';

// Mock wx 对象（validateReadablePath 需要访问 wx.env.USER_DATA_PATH）
vi.stubGlobal('wx', {
    env: {
        USER_DATA_PATH: 'wxfile://usr',
    },
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
        test('normalizes FileStats array by removing leading slash from path', () => {
            // 覆盖 path.slice(1) 分支
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
            // 验证路径去掉了开头的 `/`
            expect(result[0].path).toBe('subdir');
            expect(result[1].path).toBe('file.txt');
        });

        test('normalizes FileStats array with recursive=false', () => {
            // 测试数组输入时 recursive 参数不影响结果（数组始终返回处理后的数组）
            const fileStats: WechatMinigame.FileStats[] = [
                {
                    path: '/test',
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

            const result = normalizeStats(fileStats, false) as WechatMinigame.FileStats[];

            expect(Array.isArray(result)).toBe(true);
            expect(result[0].path).toBe('test');
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
        test('returns error when stat fails with non-NotFoundError', () => {
            // 覆盖 getExistsResult 中 orElse 返回错误的分支
            const error = new Error('permission denied');
            error.name = 'PermissionError';

            const statResult = Err<WechatMinigame.Stats, Error>(error);
            const result = getExistsResult(statResult);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().name).toBe('PermissionError');
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
