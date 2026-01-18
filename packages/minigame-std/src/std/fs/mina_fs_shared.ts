/**
 * @internal
 * 同步/异步的公共代码。
 */

import { NOT_FOUND_ERROR, ROOT_DIR, type ExistsOptions } from 'happy-opfs';
import { Err, Lazy, RESULT_FALSE, RESULT_VOID, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString, invariant } from '../assert/assertions.ts';
import { bufferSource2Ab, miniGameFailureToError } from '../utils/mod.ts';
import type { FileEncoding, ReadOptions, WriteFileContent } from './fs_define.ts';

/**
 * Mini-game write content type, excludes ReadableStream as mini-game doesn't support it.
 */
export type MinaWriteFileContent = Exclude<WriteFileContent, ReadableStream<Uint8Array<ArrayBuffer>>>;

/**
 * 小游戏文件系统管理器实例。
 *
 * for tree shake
 */
const fs = Lazy(() => wx.getFileSystemManager());

/**
 * 获取小游戏文件系统管理器实例。
 * @returns 文件系统管理器实例。
 */
export function getFs(): WechatMinigame.FileSystemManager {
    return fs.force();
}

/**
 * 用户可写的根路径， `wxfile://usr` 或 `http://usr`。
 *
 * for tree shake
 */
const rootUsrPath = Lazy(() => wx.env.USER_DATA_PATH);

/**
 * 根路径，`wxfile://` 或 `http://`。
 *
 * for tree shake
 */
const rootPath = Lazy(() => {
    const usrPath = rootUsrPath.force();
    // trim `usr`
    return usrPath.slice(0, usrPath.indexOf('usr'));
});

/**
 * 获取文件系统的根路径。
 * @returns 文件系统的根路径。
 */
export function getRootUsrPath(): string {
    return rootUsrPath.force();
}

/**
 * 获取给定路径的绝对路径。
 * @param path - 相对USER_DATA_PATH的相对路径，也必须以`/`开头。
 * @returns 转换后的绝对路径。
 */
export function getAbsolutePath(path: string): string {
    assertString(path);

    const usrPath = getRootUsrPath();

    // usr or tmp
    if (path.startsWith(rootPath.force())) {
        return path;
    }

    invariant(path[0] === ROOT_DIR, () => `Path must start with / but received ${ path }`);
    return usrPath + path;
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
 * Whether the error is a `NotFoundError`.
 * @param err - The error to check.
 * @returns `true` if the error is a `NotFoundError`, otherwise `false`.
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

interface GetWriteFileContents {
    data: string | ArrayBuffer;
    encoding: FileEncoding | undefined;
}
/**
 * 获取写入文件的参数。
 */
export function getWriteFileContents(contents: MinaWriteFileContent): GetWriteFileContents {
    const isBin = typeof contents !== 'string';

    const encoding = isBin ? undefined : 'utf8';
    const data = isBin ? bufferSource2Ab(contents) : contents;

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
