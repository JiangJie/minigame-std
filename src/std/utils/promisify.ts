/* eslint-disable @typescript-eslint/no-explicit-any */
import { Err, Ok, promiseToAsyncResult, type AsyncResult, type Result } from 'happy-rusty';
import { Future } from 'tiny-future';

/**
 * 类型工具：判断 API 是否符合 promisify 条件。
 */
export type ValidAPI<T> = T extends (params: infer P) => infer R
    ? R extends void | Promise<any>
    ? P extends { success?: any; } | undefined
    ? true
    : P extends { fail?: any; } | undefined
    ? true
    : false
    : false
    : false;

/**
 * 类型工具：提取成功回调参数类型。
 */
export type SuccessType<T> = T extends (params: infer P) => any
    ? P extends { success?: (res: infer S) => any }
    ? S
    : never
    : never;

/**
 * 类型工具：提取失败回调参数类型。
 */
export type FailType<T> = T extends (params: infer P) => any
    ? P extends { fail?: (err: infer E) => any }
    ? E
    : never
    : never;

/**
 * 将小游戏异步 API 转换为返回 `AsyncResult<T, E>` 的新函数，需要转换的 API 必须是接受可选 `success` 和 `fail` 回调的函数，并且其返回值必须是 `void` 或 `Promise`。
 *
 * 其中 `T` 为 `success` 回调的参数类型，`E` 为 `fail` 回调的参数类型。
 *
 * @param api - 小游戏异步 API。
 * @returns 返回一个新的函数，该函数返回 `AsyncResult<T, E>`。
 */
export function promisifyWithResult<F extends (...args: any[]) => any, T = SuccessType<F>, E = FailType<F>>(api: F) : ValidAPI<F> extends true
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

        // 也支持其他返回Promise的API
        if (res instanceof Promise) {
            return promiseToAsyncResult(res);
        } else if (res != undefined) {
            throw new Error('API must return void or Promise. Otherwise the return value will be discarded.');
        }

        return future.promise;
    };
}