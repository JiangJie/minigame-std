import { Err, type IOResult } from 'happy-rusty';

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 */
export function generalErrorToResult<T>(err: WechatMinigame.GeneralCallbackResult): IOResult<T> {
    return Err(new Error(err.errMsg));
}