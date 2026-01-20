import { Err, Ok, tryAsyncResult, type AsyncResult, type Result } from 'happy-rusty';
import { Future } from 'tiny-future';

/**
 * 将小游戏异步 API 转换为返回 `AsyncResult<T, E>` 的新函数，需要转换的 API 必须是接受可选 `success` 和 `fail` 回调的函数，并且其返回值必须是 `void` 或 `PromiseLike`。
 *
 * 其中 `T` 为 `success` 回调的参数类型，`E` 为 `fail` 回调的参数类型。
 *
 * @param api - 小游戏异步 API。
 * @returns 返回一个新的函数，该函数返回 `AsyncResult<T, E>`。
 * @since 1.10.0
 * @example
 * ```ts
 * // 将 wx.setStorage 转换为 AsyncResult 风格
 * const setStorageAsync = asyncResultify(wx.setStorage);
 * const result = await setStorageAsync({ key: 'test', data: 'value' });
 * if (result.isOk()) {
 *     console.log('存储成功');
 * } else {
 *     console.error('存储失败:', result.unwrapErr());
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 函数泛型约束需要 any 以兼容所有函数签名
export function asyncResultify<F extends (...args: any[]) => unknown, T = ResultifySuccessType<F>, E = ResultifyFailType<F>>(api: F): ResultifyValidAPI<F> extends true
    ? (...args: Parameters<F>) => AsyncResult<T, E>
    : never {
    return ((...args: Parameters<F>): AsyncResult<T, E> => {
        const future = new Future<Result<T, E>>();

        const options = args[0] ?? {};
        const { success, fail } = options;

        // 强制使用callback的方式调用，即使支持Promise
        options.success = (res: T) => {
            // success 回调依旧执行
            success?.(res);
            future.resolve(Ok(res));
        };
        options.fail = (err: E) => {
            // fail 回调依旧执行
            fail?.(err);
            future.resolve(Err(err));
        };

        const ret = api(options);

        // 也支持其他返回 PromiseLike 的 API（鸭子类型检查）
        if (ret != null && typeof (ret as PromiseLike<T>).then === 'function') {
            // Convert PromiseLike to AsyncResult
            return tryAsyncResult(ret as PromiseLike<T>);
        } else if (ret !== undefined) {
            throw new TypeError('API must return void or PromiseLike. Otherwise the return value will be discarded');
        }

        return future.promise;
    }) as ResultifyValidAPI<F> extends true ? (...args: Parameters<F>) => AsyncResult<T, E> : never;
}

// #region Internal Types

/**
 * 通用回调函数类型。
 */
type AnyCallback = (...args: never[]) => unknown;

/**
 * 类型工具：判断 API 是否符合 resultify 条件。
 *
 * 要求 API 返回 `void` 或 `PromiseLike`，且参数包含 `success` 或 `fail` 回调。
 * @typeParam T - 待检查的 API 函数类型。
 */
type ResultifyValidAPI<T> = T extends (params: infer P) => infer R
    ? R extends void | PromiseLike<unknown>
    ? P extends { success?: AnyCallback; } | undefined
    ? true
    : P extends { fail?: AnyCallback; } | undefined
    ? true
    : false
    : false
    : false;

/**
 * 类型工具：提取成功回调参数类型。
 *
 * 从 API 函数的 `success` 回调中提取返回类型。
 * @typeParam T - API 函数类型。
 */
type ResultifySuccessType<T> = T extends (params: infer P) => unknown
    ? P extends { success?: (res: infer S) => unknown; }
    ? S
    : never
    : never;

/**
 * 类型工具：提取失败回调参数类型。
 *
 * 从 API 函数的 `fail` 回调中提取错误类型。
 * @typeParam T - API 函数类型。
 */
type ResultifyFailType<T> = T extends (params: infer P) => unknown
    ? P extends { fail?: (err: infer E) => unknown; }
    ? E
    : never
    : never;

// #endregion