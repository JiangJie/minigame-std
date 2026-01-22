/**
 * @internal
 * 同步/异步的公共代码。
 */

import { normalize } from '@std/path/posix';
import { NOT_FOUND_ERROR, ROOT_DIR, type ExistsOptions } from 'happy-opfs';
import { Err, Lazy, Ok, RESULT_FALSE, RESULT_VOID, type IOResult, type VoidIOResult } from 'happy-rusty';
import { bufferSourceToAb, miniGameFailureToError } from '../internal/mod.ts';
import type { FileEncoding, ReadOptions, WriteFileContent } from './fs_define.ts';

// #region Internal Variables

/**
 * 通过 `wx.env.USER_DATA_PATH` 获取的用户数据根目录。
 */
const USR = 'usr' as const;

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
    return path.slice(0, path.indexOf(USR));
});

// #endregion

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
    }

    // 标准化路径（处理 `.`、`..` 等）并去除末尾的 `/`
    const normalized = normalize(path);
    path = normalized.length > 1 && normalized[normalized.length - 1] === ROOT_DIR
        ? normalized.slice(0, -1)
        : normalized;

    // 完整路径：重新拼接协议前缀
    if (isFullPath) {
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
 * 判断是否文件或者文件夹不存在。
 * @param err - 错误对象。
 */
export function isNotFoundIOError(err: WechatMinigame.FileError): boolean {
    // 1300002	no such file or directory ${path}
    // 可能没有errCode
    // 同步接口抛出异常是 `Error`，但 instanceof Error 却是 false
    return err.errCode === 1300002 || (err.errMsg ?? (err as unknown as Error).message).includes('no such file or directory');
}

/**
 * 判断是否文件或者文件夹已存在。
 * @param err - 错误对象。
 */
export function isAlreadyExistsIOError(err: WechatMinigame.FileError): boolean {
    // 1301005	file already exists ${dirPath}	已有同名文件或目录
    // 可能没有errCode
    // 同步接口抛出异常是 `Error`，但 instanceof Error 却是 false
    return err.errCode === 1301005 || (err.errMsg ?? (err as unknown as Error).message).includes('already exists');
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 */
export function fileErrorToResult<T>(err: WechatMinigame.FileError): IOResult<T> {
    const error = miniGameFailureToError(err);

    if (isNotFoundIOError(err)) {
        error.name = NOT_FOUND_ERROR;
    }

    return Err(error);
}

/**
 * 判断错误是否为 `NotFoundError`。
 * @param err - 要检查的错误。
 * @returns 如果是 `NotFoundError` 返回 `true`，否则返回 `false`。
 */
export function isNotFoundError(err: Error): boolean {
    return err.name === NOT_FOUND_ERROR;
}

/**
 * 处理 `mkdir` 的错误。
 */
export function errToMkdirResult(err: WechatMinigame.FileError): VoidIOResult {
    // 已存在当做成功
    return isAlreadyExistsIOError(err) ? RESULT_VOID : fileErrorToResult(err);
}

/**
 * 获取读取文件的编码。
 */
export function getReadFileEncoding(options?: ReadOptions): FileEncoding | undefined {
    // NOTE: 想要读取 ArrayBuffer 就不能传 encoding
    // 如果传了 'binary'，读出来的是字符串
    let encoding: FileEncoding | undefined = options?.encoding;
    if (!encoding || encoding === 'binary') {
        encoding = undefined;
    }

    return encoding;
}

/**
 * 处理 `remove` 的错误。
 */
export function errToRemoveResult(err: WechatMinigame.FileError): VoidIOResult {
    // 目标 path 本就不存在，当做成功
    return isNotFoundIOError(err) ? RESULT_VOID : fileErrorToResult(err);
}

export interface GetWriteFileContents {
    data: string | ArrayBuffer;
    encoding: FileEncoding | undefined;
}
/**
 * 获取写入文件的参数。
 */
export function getWriteFileContents(contents: WriteFileContent): GetWriteFileContents {
    const isBin = typeof contents !== 'string';

    const encoding = isBin ? undefined : 'utf8';
    const data = isBin ? bufferSourceToAb(contents) : contents;

    const res: GetWriteFileContents = {
        data,
        encoding,
    };

    return res;
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
