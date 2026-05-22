/**
 * 网络请求模块，提供可中断的 fetch 请求功能，支持 text、JSON、ArrayBuffer 等响应类型。
 * @module fetch
 */
import { fetchT as webFetch, type FetchInit, type FetchTask } from '@happy-ts/fetch-t';
import { IS_MINA } from '../../macros/env.ts';
import type { MinaFetchInit, UnionFetchInit } from './fetch_defines.ts';
import { minaFetch } from './mina_fetch.ts';

export { ABORT_ERROR, FetchError, TIMEOUT_ERROR, type FetchTask } from '@happy-ts/fetch-t';
export type { UnionFetchInit } from './fetch_defines.ts';

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

    if (IS_MINA) {
        // Map body → data, headers → header for mini-game
        const { body, headers, ...rest } = defaultInit;
        if (body != null) {
            (rest as MinaFetchInit).data = body;
        }
        if (headers !== undefined) {
            (rest as MinaFetchInit).header = headers;
        }
        return minaFetch(url, rest) as FetchTask<T>;
    }

    // Auto-serialize object body for web
    const { body, ...rest } = defaultInit;
    const webInit: FetchInit & { abortable: true; } = { ...rest, body: body as BodyInit | null | undefined, abortable: true };

    if (isPlainObject(body)) {
        webInit.body = JSON.stringify(body);
        // Object body is always serialized as JSON
        const headers = new Headers(webInit.headers);
        headers.set('Content-Type', 'application/json');
        webInit.headers = headers;
    }

    return webFetch(url, webInit) as FetchTask<T>;
}

/**
 * 判断值是否为普通对象（非 string、非 BufferSource）。
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value != null
        && typeof value === 'object'
        && !ArrayBuffer.isView(value)
        && !(value instanceof ArrayBuffer);
}
