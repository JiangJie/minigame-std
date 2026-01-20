import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
export * from './resultify.ts';

/**
 * 将小游戏失败回调的结果转换为 `Error` 类型。
 *
 * 如果是异步 API 的 `fail` 回调返回的结果通常是 `WechatMinigame.GeneralCallbackResult` 或者变体类型，
 * 如果是同步 API throw 的异常通常是一个类似 `Error` 的类型。
 * @param err - 小游戏错误对象。
 * @returns 转换后的 `Error` 对象。
 * @since 1.0.0
 * @example
 * ```ts
 * const err = { errMsg: 'request:fail timeout' };
 * const error = miniGameFailureToError(err);
 * console.log(error.message); // 'request:fail timeout'
 * ```
 */
export function miniGameFailureToError(err: WechatMinigame.GeneralCallbackResult | Error): Error {
    return new Error((err as WechatMinigame.GeneralCallbackResult).errMsg ?? (err as Error).message);
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 * @since 1.0.0
 * @example
 * ```ts
 * const err = { errMsg: 'operation failed' };
 * const result = miniGameFailureToResult<string>(err);
 * console.log(result.isErr()); // true
 * ```
 */
export function miniGameFailureToResult<T>(err: WechatMinigame.GeneralCallbackResult): IOResult<T> {
    return Err(miniGameFailureToError(err));
}

/**
 * 执行同步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。
 * @param op - 需要执行的同步函数。
 * @returns IOResult。
 * @since 1.2.0
 * @example
 * ```ts
 * const result = tryGeneralSyncOp(() => {
 *     return wx.getStorageSync('key');
 * });
 * if (result.isOk()) {
 *     console.log('读取成功:', result.unwrap());
 * }
 * ```
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
 * @since 1.2.0
 * @example
 * ```ts
 * const result = await tryGeneralAsyncOp(async () => {
 *     return await someAsyncOperation();
 * });
 * if (result.isOk()) {
 *     console.log('操作成功:', result.unwrap());
 * }
 * ```
 */
export async function tryGeneralAsyncOp<T>(op: () => Promise<T>): AsyncIOResult<T> {
    try {
        return Ok(await op());
    } catch (e) {
        return miniGameFailureToResult(e as WechatMinigame.GeneralCallbackResult);
    }
}

/**
 * 将 BufferSource 转换为 Uint8Array。
 * @param data - 需要转换的 BufferSource。
 * @returns Uint8Array。
 * @since 1.6.0
 * @example
 * ```ts
 * const buffer = new ArrayBuffer(8);
 * const u8a = bufferSource2U8a(buffer);
 * console.log(u8a.byteLength); // 8
 *
 * const view = new DataView(buffer);
 * const u8a2 = bufferSource2U8a(view);
 * console.log(u8a2.byteLength); // 8
 * ```
 */
export function bufferSource2U8a(data: BufferSource): Uint8Array<ArrayBuffer> {
    if (data instanceof Uint8Array) {
        return data as Uint8Array<ArrayBuffer>;
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
 * @since 1.6.0
 * @example
 * ```ts
 * const u8a = new Uint8Array([1, 2, 3]);
 * const ab = bufferSource2Ab(u8a);
 * console.log(ab.byteLength); // 3
 * ```
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
