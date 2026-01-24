/**
 * @internal
 * 内部辅助函数。
 */

import type { FetchTask } from '@happy-ts/fetch-t';
import { type IOResult } from 'happy-rusty';

/**
 * 将小游戏失败回调的结果转换为 `Error` 类型。
 *
 * 如果是异步 API 的 `fail` 回调返回的结果通常是 `WechatMinigame.GeneralCallbackResult` 或者变体类型，
 * 如果是同步 API throw 的异常通常是一个类似 `Error` 的类型。
 * @param error - 小游戏错误对象。
 * @returns 转换后的 `Error` 对象。
 */
export function miniGameFailureToError(error: WechatMinigame.GeneralCallbackResult | Error): Error {
    return error instanceof Error
        ? error
        : new Error(error.errMsg);
}

/**
 * 将 BufferSource 转换为 Uint8Array。
 * @param data - 需要转换的 BufferSource。
 * @returns Uint8Array。
 */
export function bufferSourceToBytes(data: BufferSource): Uint8Array<ArrayBuffer> {
    if (data instanceof Uint8Array) {
        return data as Uint8Array<ArrayBuffer>;
    }

    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }

    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    throw new TypeError(`BufferSource is not ArrayBuffer or ArrayBufferView`);
}

/**
 * 将 BufferSource 转换为 ArrayBuffer。
 * @param data - 需要转换的 BufferSource。
 * @returns ArrayBuffer。
 */
export function bufferSourceToAb(data: BufferSource): ArrayBuffer {
    if (data instanceof ArrayBuffer) {
        return data;
    }

    if (ArrayBuffer.isView(data)) {
        // 可能存在偏移
        return data.byteOffset === 0
            ? data.buffer
            : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    }

    throw new TypeError(`BufferSource is not ArrayBuffer or ArrayBufferView`);
}

/**
 * 创建一个已失败的 FetchTask 对象。
 * @param errResult - 错误结果。
 * @returns 返回一个已完成的失败 FetchTask。
 */
export function createFailedFetchTask<T>(errResult: IOResult<unknown>): FetchTask<T> {
    return {
        abort(): void { /* noop */ },
        get aborted(): boolean { return false; },
        get result() { return Promise.resolve(errResult.asErr<T>()); },
    };
}