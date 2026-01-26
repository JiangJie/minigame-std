/**
 * @internal
 * 同步/异步的公共代码。
 */

import { normalize } from '@std/path/posix';
import { NOT_FOUND_ERROR, NOTHING_TO_ZIP_ERROR, ROOT_DIR, type ExistsOptions } from 'happy-opfs';
import { Err, Lazy, Ok, RESULT_FALSE, RESULT_VOID, tryResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { bufferSourceToAb, miniGameFailureToError } from '../internal/mod.ts';
import type { ReadOptions, WriteFileContent } from './fs_define.ts';

// #region Internal Variables

/**
 * 小游戏文件系统管理器实例。
 *
 */
const fs = Lazy(() => wx.getFileSystemManager());

/**
 * 用户数据根目录，`wxfile://usr` 或 `http://usr`。
 *
 */
const usrPath = Lazy(() => wx.env.USER_DATA_PATH);

/**
 * 根路径，`wxfile://` 或 `http://`。
 *
 */
const rootPath = Lazy(() => {
    const path = usrPath.force();
    // 剥离 `usr`
    return `${ path.split('://')[0] }://`;
});

// #endregion

/**
 * zip 操作的结果。
 */
export type ZipIOResult = IOResult<Uint8Array<ArrayBuffer> | void>;

export const EMPTY_BYTES: Uint8Array<ArrayBuffer> = new Uint8Array(0);

/**
 * 获取小游戏文件系统管理器实例。
 * @returns 文件系统管理器实例。
 */
export function getFs(): WechatMinigame.FileSystemManager {
    return fs.force();
}

/**
 * 获取文件系统的根路径。
 * @returns 文件系统的根路径。
 */
export function getUsrPath(): string {
    return usrPath.force();
}

/**
 * 验证并标准化路径，返回绝对路径。
 *
 * 支持两种输入格式：
 * 1. 完整路径：以 `wxfile://` 或 `http://` 开头（如 `wxfile://usr/test`）
 * 2. 相对路径：以 `/` 开头（如 `/test`），会自动拼接 `wx.env.USER_DATA_PATH`
 *
 * @param path - 待验证的路径。
 * @returns 验证成功返回标准化后的绝对路径，失败返回错误信息。
 *
 * @example
 * ```ts
 * validateAbsolutePath('/test/../foo'); // Ok('wxfile://usr/foo')
 * validateAbsolutePath('wxfile://usr/test/'); // Ok('wxfile://usr/test')
 * validateAbsolutePath('wxfile:///usr/a/b'); // Ok('wxfile://usr/a/b')
 * validateAbsolutePath('relative'); // Err(...)
 * ```
 */
export function validateAbsolutePath(path: string): IOResult<string> {
    if (typeof path !== 'string') {
        return Err(new TypeError(`Path must be a string but received ${ typeof path }`));
    }

    // 是否已经是完整路径
    let isFullPath = false;
    // 检查是否为完整路径（以 `wxfile://` 或 `http://` 开头）
    if (path.startsWith(rootPath.force())) {
        isFullPath = true;
        // 先剥离协议前缀，避免 normalize 将 `://` 转换为 `:/`
        path = path.slice(rootPath.force().length);
        // 传根路径没意义
        if (!path) {
            return Err(new Error('Path must not be root directory'));
        }
    }

    // 标准化路径（处理 `.`、`..` 等）并去除末尾的 `/`
    const normalized = normalize(path);
    path = normalized.length > 1 && normalized[normalized.length - 1] === ROOT_DIR
        ? normalized.slice(0, -1)
        : normalized;

    // 完整路径：重新拼接协议前缀
    if (isFullPath) {
        // 还是根路径
        if (path === ROOT_DIR) {
            return Err(new Error('Path must not be root directory'));
        }
        // 确保路径不是以 `/` 开头，避免 `wxfile:///usr` 这样的多斜杠情况
        if (path[0] === ROOT_DIR) {
            path = path.slice(1);
        }
        return Ok(rootPath.force() + path);
    }

    // 相对路径：必须以 `/` 开头
    if (path[0] !== ROOT_DIR) {
        return Err(new Error(`Path must be absolute (start with '/'): '${ path }'`));
    }

    // 拼接用户数据根目录
    return Ok(usrPath.force() + path);
}

/**
 * 验证提供的 ExistsOptions 是否有效。
 * `isDirectory` 和 `isFile` 不能同时为 `true`。
 *
 * @param options - 要验证的 ExistsOptions。
 * @returns 表示成功或错误的 VoidIOResult。
 */
export function validateExistsOptions(options?: ExistsOptions): VoidIOResult {
    const { isDirectory = false, isFile = false } = options ?? {};

    return isDirectory && isFile
        ? Err(new Error('isDirectory and isFile cannot both be true'))
        : RESULT_VOID;
}

/**
 * 判断错误是否为 `NotFoundError`。
 * @param error - 要检查的错误。
 * @returns 如果是 `NotFoundError` 返回 `true`，否则返回 `false`。
 */
export function isNotFoundError(error: Error): boolean {
    return error.name === NOT_FOUND_ERROR;
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param error - IO 操作的错误对象, 可以是同步(Error)或者异步(WechatMinigame.FileError)的。
 * @returns 转换后的 IOResult 对象。
 */
export function fileErrorToResult<T>(error: FileError): IOResult<T> {
    const err = miniGameFailureToError(error);

    if (isNotFoundFileError(err)) {
        err.name = NOT_FOUND_ERROR;
    }

    return Err(err);
}

/**
 * 处理 `mkdir` 的错误。
 */
export function fileErrorToMkdirResult(error: FileError): VoidIOResult {
    // 已存在当做成功
    return isAlreadyExistsFileError(error) ? RESULT_VOID : fileErrorToResult(error);
}

/**
 * 处理 `remove` 的错误。
 */
export function fileErrorToRemoveResult(error: FileError): VoidIOResult {
    // 目标 path 本就不存在，当做成功
    return isNotFoundFileError(error) ? RESULT_VOID : fileErrorToResult(error);
}

/*
 * 创建 `NothingToZipError` 错误。
 */
export function createNothingToZipError(): Error {
    const error = new Error('Nothing to zip');
    error.name = NOTHING_TO_ZIP_ERROR;

    return error;
}

/*
 * 创建"文件不存在且 create 为 false"的错误。
 * @param filePath - 文件路径。
 * @returns 错误对象。
 */
export function createFileNotExistsError(filePath: string): Error {
    return new Error(`Cannot append to non-existent file: ${ filePath }`);
}

/**
 * 获取读取文件的编码。
 * @returns 返回 `'utf8'` 或 `undefined`（读取二进制时不传 encoding）。
 */
export function getReadFileEncoding(options?: ReadOptions): 'utf8' | undefined {
    // NOTE: 想要读取 ArrayBuffer 就不能传 encoding
    // 如果传了 'bytes' 或不传，返回 undefined
    return options?.encoding === 'utf8' ? 'utf8' : undefined;
}

/**
 * 获取写入文件的参数。
 */
export function getWriteFileContents(contents: WriteFileContent): IOResult<GetWriteFileContents> {
    const isBin = typeof contents !== 'string';

    let data: string | ArrayBuffer;

    if (isBin) {
        const result = tryResult(() => bufferSourceToAb(contents));
        if (result.isErr()) return result.asErr();

        data = result.unwrap();
    } else {
        data = contents;
    }

    const encoding = isBin ? undefined : 'utf8';

    return Ok({
        data,
        encoding,
    });
}

/**
 * 获取 `exists` 的结果。
 */
export function getExistsResult(statResult: IOResult<WechatMinigame.Stats>, options?: ExistsOptions): IOResult<boolean> {
    return statResult.map(stats => {
        const { isDirectory = false, isFile = false } = options ?? {};

        const notExist =
            (isDirectory && stats.isFile())
            || (isFile && stats.isDirectory());

        return !notExist;
    }).orElse(err => {
        return isNotFoundError(err) ? RESULT_FALSE : statResult.asErr();
    });
}

/**
 * 根据 `recursive` 不同标准化 `stat` 的结果。
 * - `recursive=false`: 返回单个 `Stats` 或 `FileStats[]`
 * - `recursive=true`: 始终返回 `FileStats[]`，即使是单个文件或空目录
 *   - 如果是单个 `Stats`，包装成数组，path 设为 '' 表示当前项目
 */
export function normalizeStats(statsOrFileStats: WechatMinigame.Stats | WechatMinigame.FileStats[], recursive: boolean): WechatMinigame.Stats | WechatMinigame.FileStats[] {
    if (Array.isArray(statsOrFileStats)) {
        return statsOrFileStats.map(({ path, stats }) => ({
            path: path.slice(1), // 返回相对路径, 去掉开头的 `/`
            stats,
        }));
    }

    // 只要是 recursive 就返回数组(即使是文件或者空目录))
    return recursive
        ? [{
            path: '', // 当前文件夹本身的相对路径
            stats: statsOrFileStats,
        }]
        : statsOrFileStats;
}

// #region Internal Types

type FileError = WechatMinigame.FileError | (Error & {
    errno?: number;
});

interface GetWriteFileContents {
    data: string | ArrayBuffer;
    encoding?: 'utf8';
}

// #endregion

// #region Internal Functions

/**
 * 标准化同步或异步的文件错误对象。
 * @param error - IO 操作的错误对象, 可以是同步(Error)或者异步(WechatMinigame.FileError)的。
 */
function normalizeFileError(error: FileError): WechatMinigame.FileError {
    return error instanceof Error
        ? {
            errCode: error.errno ?? 0,
            errMsg: error.message,
        }
        : error;
}

/**
 * 判断是否文件或者文件夹不存在。
 * @param error - IO 操作的错误对象, 可以是同步(Error)或者异步(WechatMinigame.FileError)的。
 */
function isNotFoundFileError(error: FileError): boolean {
    // 1300002	no such file or directory ${path}
    const { errCode, errMsg } = normalizeFileError(error);
    // 可能没有errCode
    return errCode === 1300002
        || errMsg.includes('no such file or directory');
}

/**
 * 判断是否文件或者文件夹已存在。
 * @param error - IO 操作的错误对象, 可以是同步(Error)或者异步(WechatMinigame.FileError)的。
 */
function isAlreadyExistsFileError(error: FileError): boolean {
    // 1301005	file already exists ${dirPath}	已有同名文件或目录
    const { errCode, errMsg } = normalizeFileError(error);
    // 可能没有errCode
    return errCode === 1301005
        || errMsg.includes('already exists');
}

// #endregion
