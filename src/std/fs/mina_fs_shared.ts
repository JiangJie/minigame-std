/**
 * 同步/异步的公共代码。
 */

import { assertAbsolutePath, NOT_FOUND_ERROR, type ExistsOptions } from 'happy-opfs';
import { Err, Ok, RESULT_FALSE, RESULT_VOID, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { miniGameFailureToError } from '../utils/mod.ts';
import type { FileEncoding, ReadOptions, WriteFileContent } from './fs_define.ts';

/**
 * 小游戏文件系统管理器实例。
 *
 * for tree shake
 */
let fs: WechatMinigame.FileSystemManager;

/**
 * 获取小游戏文件系统管理器实例。
 * @returns 文件系统管理器实例。
 */
export function getFs(): WechatMinigame.FileSystemManager {
    fs ??= wx.getFileSystemManager();
    return fs;
}

/**
 * 根路径。
 *
 * for tree shake
 */
let rootPath: string;

/**
 * 获取文件系统的根路径。
 * @returns 文件系统的根路径。
 */
function getRootPath(): string {
    rootPath ??= wx.env.USER_DATA_PATH;
    return rootPath;
}

/**
 * 获取给定路径的绝对路径。
 * @param path - 相对USER_DATA_PATH的相对路径，也必须以`/`开头。
 * @returns 转换后的绝对路径。
 */
export function getAbsolutePath(path: string): string {
    assertString(path);

    const rootPath = getRootPath();

    if (path.startsWith(rootPath)) {
        return path;
    }

    assertAbsolutePath(path);
    return rootPath + path;
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
    encoding: FileEncoding;
}
/**
 * 获取写入文件的参数。
 */
export function getWriteFileContents(contents: WriteFileContent): GetWriteFileContents {
    const isBuffer = contents instanceof ArrayBuffer;
    const isBufferView = ArrayBuffer.isView(contents);
    const isBin = isBuffer || isBufferView;

    // ArrayBuffer 可能是带有 offset 的
    const data = isBufferView ? contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength) : contents;
    const encoding: FileEncoding = isBin ? 'binary' : 'utf8'

    const res: GetWriteFileContents = {
        data,
        encoding,
    };

    return res;
}

/**
 * 获取 `exists` 的结果。
 */
export function getExistsResult(statsResult: IOResult<WechatMinigame.Stats>, options?: ExistsOptions): IOResult<boolean> {
    if (statsResult.isErr()) {
        return isNotFoundError(statsResult.unwrapErr()) ? RESULT_FALSE : statsResult.asErr();
    }

    const { isDirectory = false, isFile = false } = options ?? {};

    if (isDirectory && isFile) {
        throw new TypeError('ExistsOptions.isDirectory and ExistsOptions.isFile must not be true together.');
    }

    const stats = statsResult.unwrap();
    const notExist =
        (isDirectory && stats.isFile())
        || (isFile && stats.isDirectory());

    return Ok(!notExist);
}