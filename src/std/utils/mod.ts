import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
export * from './promisify.ts';

/**
 * 将小游戏失败回调的结果转换为 `Error` 类型。
 *
 * 如果是异步 API 的 `fail` 回调返回的结果通常是 `WechatMinigame.GeneralCallbackResult` 或者变体类型，
 * 如果是同步 API throw 的异常通常是一个类似 `Error` 的类型。
 * @param err - 小游戏错误对象。
 * @returns 转换后的 `Error` 对象。
 */
export function miniGameFailureToError(err: WechatMinigame.GeneralCallbackResult | Error): Error {
    return new Error((err as WechatMinigame.GeneralCallbackResult).errMsg ?? (err as Error).message);
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 */
export function miniGameFailureToResult<T>(err: WechatMinigame.GeneralCallbackResult): IOResult<T> {
    return Err(miniGameFailureToError(err));
}

/**
 * 执行同步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。
 * @param op - 需要执行的同步函数。
 * @returns IOResult。
 */
export function tryGeneralSyncOp<T>(op: () => T): IOResult<T> {
    try {
        return Ok(op());
    } catch (e) {
        return miniGameFailureToResult(e as WechatMinigame.GeneralCallbackResult);
    }
}

/**
 * 执行异步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。
 * @param op - 需要执行的异步函数。
 * @returns AsyncIOResult。
 */
export async function tryGeneralAsyncOp<T>(op: () => Promise<T>): AsyncIOResult<T> {
    try {
        return Ok(await op());
    } catch (e) {
        return miniGameFailureToResult(e as WechatMinigame.GeneralCallbackResult);
    }
}

/**
 * 执行同步函数，预期异常都是 `DOMException`。
 * @param op - 需要执行的同步函数。
 * @returns IOResult。
 */
export function tryDOMSyncOp<T>(op: () => T): IOResult<T> {
    try {
        return Ok(op());
    } catch (e) {
        return Err(e as DOMException);
    }
}

/**
 * 执行异步函数，预期异常都是 `DOMException`。
 * @param op - 需要执行的异步函数。
 * @returns AsyncIOResult。
 */
export async function tryDOMAsyncOp<T>(op: () => Promise<T>): AsyncIOResult<T> {
    try {
        return Ok(await op());
    } catch (e) {
        return Err(e as DOMException);
    }
}

/**
 * 将 BufferSource 转换为 Uint8Array。
 * @param data - 需要转换的 BufferSource。
 * @returns Uint8Array。
 */
export function bufferSource2U8a(data: BufferSource): Uint8Array {
    if (data instanceof Uint8Array) {
        return data;
    }

    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }

    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.byteOffset === 0 ? data.buffer : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    }

    throw new TypeError(`BufferSource is not ArrayBuffer or ArrayBufferView`);
}

/**
 * 将 BufferSource 转换为 ArrayBuffer。
 * @param data - 需要转换的 BufferSource。
 * @returns ArrayBuffer。
 */
export function bufferSource2Ab(data: BufferSource): ArrayBuffer {
    if (data instanceof ArrayBuffer) {
        return data;
    }

    if (ArrayBuffer.isView(data)) {
        return (data.byteOffset === 0 ? data.buffer : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)) as ArrayBuffer;
    }

    throw new TypeError(`BufferSource is not ArrayBuffer or ArrayBufferView`);
}