/**
 * 同步/异步的公共代码。
 */

import type { ExistsOptions } from 'happy-opfs';
import { Ok, RESULT_FALSE, RESULT_TRUE, type IOResult } from 'happy-rusty';
import type { FileEncoding, ReadOptions, WriteFileContent } from './fs_define.ts';
import { isAlreadyExistsIOError, isNotFoundError, isNotFoundIOError, toErr } from './fs_helpers.ts';

/**
 * 处理 `mkdir` 的错误。
 */
export function errToMkdirResult(err: WechatMinigame.FileError): IOResult<boolean> {
    // 已存在当做成功
    return isAlreadyExistsIOError(err) ? RESULT_TRUE : toErr(err);
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
export function errToRemoveResult(err: WechatMinigame.FileError): IOResult<boolean> {
    // 目标 path 本就不存在，当做成功
    return isNotFoundIOError(err) ? RESULT_TRUE : toErr(err);
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