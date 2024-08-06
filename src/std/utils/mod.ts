import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';

interface MinaError {
    errMsg: string;
}
/**
 * 将小游戏错误对象转换为 `Error` 类型。
 * @param err - 小游戏错误对象。
 * @returns 转换后的 `Error` 对象。
 */
export function minaErrorToError(err: MinaError | Error): Error {
    return new Error((err as MinaError).errMsg ?? (err as Error).message);
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 */
export function generalErrorToResult<T>(err: WechatMinigame.GeneralCallbackResult): IOResult<T> {
    return Err(minaErrorToError(err));
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
        return generalErrorToResult(e as WechatMinigame.GeneralCallbackResult);
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
        return generalErrorToResult(e as WechatMinigame.GeneralCallbackResult);
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