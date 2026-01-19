import { fetchT as webFetch, type FetchTask } from '@happy-ts/fetch-t';
import { isMinaEnv } from '../../macros/env.ts';
import type { UnionFetchInit } from './fetch_defines.ts';
import { minaFetch } from './mina_fetch.ts';

export * from './fetch_defines.ts';

/**
 * 发起一个可中断的文本类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为文本且请求可中断。
 * @returns 返回一个文本类型的 FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * const task = fetchT('https://api.example.com/data', { responseType: 'text' });
 * const result = await task.result;
 * if (result.isOk()) {
 *     console.log(result.unwrap()); // 文本内容
 * }
 * // 如需中断请求
 * task.abort();
 * ```
 */
export function fetchT(url: string, init: UnionFetchInit & {
    responseType: 'text';
}): FetchTask<string>;

/**
 * 发起一个可中断的 ArrayBuffer 类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 ArrayBuffer 且请求可中断。
 * @returns 返回一个 ArrayBuffer 类型的 FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * const task = fetchT('https://api.example.com/file', { responseType: 'arraybuffer' });
 * const result = await task.result;
 * if (result.isOk()) {
 *     const buffer = result.unwrap();
 *     console.log('文件大小:', buffer.byteLength);
 * }
 * ```
 */
export function fetchT(url: string, init: UnionFetchInit & {
    responseType: 'arraybuffer';
}): FetchTask<ArrayBuffer>;

/**
 * 发起一个可中断的 JSON 类型响应的网络请求。
 * @typeParam T - 预期的 JSON 响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 JSON 且请求可中断。
 * @returns 返回一个 JSON 类型的 FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * interface User {
 *     id: number;
 *     name: string;
 * }
 * const task = fetchT<User>('https://api.example.com/user/1', { responseType: 'json' });
 * const result = await task.result;
 * if (result.isOk()) {
 *     const user = result.unwrap();
 *     console.log(user.name);
 * }
 * ```
 */
export function fetchT<T>(url: string, init: UnionFetchInit & {
    responseType: 'json';
}): FetchTask<T>;

/**
 * 发起一个可中断的网络请求，默认返回文本类型响应。
 * @typeParam T - 预期的响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定请求可中断。
 * @returns FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * const task = fetchT('https://api.example.com/data');
 * const result = await task.result;
 * if (result.isOk()) {
 *     console.log(result.unwrap());
 * }
 * ```
 */
export function fetchT(url: string, init?: UnionFetchInit): FetchTask<string | Response>;

/**
 * 发起一个网络请求，根据初始化配置返回对应类型的 FetchTask。
 * @typeParam T - 预期的响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置。
 * @returns FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * // 发起 POST 请求
 * const task = fetchT('https://api.example.com/submit', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ key: 'value' }),
 *     responseType: 'json',
 * });
 * const result = await task.result;
 * ```
 */
export function fetchT<T>(url: string, init?: UnionFetchInit): FetchTask<T> {
    const defaultInit = init ?? {};
    // 默认是 text 类型
    defaultInit.responseType ??= 'text';

    return (isMinaEnv() ? minaFetch(url, defaultInit) : webFetch(url, {
        ...defaultInit,
        abortable: true,
    })) as FetchTask<T>;
}
