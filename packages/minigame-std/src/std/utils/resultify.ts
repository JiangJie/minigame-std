/* eslint-disable @typescript-eslint/no-explicit-any */
import { Err, Ok, tryAsyncResult, type AsyncResult, type Result } from 'happy-rusty';
import { Future } from 'tiny-future';

/**
 * 类型工具：判断 API 是否符合 promisify 条件。
 *
 * 要求 API 返回 `void` 或 `PromiseLike`，且参数包含 `success` 或 `fail` 回调。
 * @typeParam T - 待检查的 API 函数类型。
 * @since 1.10.0
 */
export type ValidAPI<T> = T extends (params: infer P) => infer R
    ? R extends void | PromiseLike<any>
    ? P extends { success?: any; } | undefined
    ? true
    : P extends { fail?: any; } | undefined
    ? true
    : false
    : false
    : false;

/**
 * 类型工具：提取成功回调参数类型。
 *
 * 从 API 函数的 `success` 回调中提取返回类型。
 * @typeParam T - API 函数类型。
 * @since 1.10.0
 */
export type SuccessType<T> = T extends (params: infer P) => any
    ? P extends { success?: (res: infer S) => any; }
    ? S
    : never
    : never;

/**
 * 类型工具：提取失败回调参数类型。
 *
 * 从 API 函数的 `fail` 回调中提取错误类型。
 * @typeParam T - API 函数类型。
 * @since 1.10.0
 */
export type FailType<T> = T extends (params: infer P) => any
    ? P extends { fail?: (err: infer E) => any; }
    ? E
    : never
    : never;

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
export function asyncResultify<F extends (...args: any[]) => any, T = SuccessType<F>, E = FailType<F>>(api: F): ValidAPI<F> extends true
    ? (...args: Parameters<F>) => AsyncResult<T, E>
    : never {
    // @ts-expect-error 跳过运行时是否满足转换条件的检查
    return (...args: Parameters<F>): AsyncResult<T, E> => {
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

        const res = api(options);

        // 也支持其他返回 PromiseLike 的 API（鸭子类型检查）
        if (res != null && typeof res.then === 'function') {
        // Convert PromiseLike to AsyncResult
            return tryAsyncResult(res);
        } else if (res !== undefined) {
            throw new TypeError('API must return void or PromiseLike. Otherwise the return value will be discarded');
        }

        return future.promise;
    };
}