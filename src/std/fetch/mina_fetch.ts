import type { FetchTask } from '@happy-ts/fetch-t';
import { Err, Ok, type AsyncIOResult, type Result } from 'happy-rusty';
import { assertSafeUrl } from '../assert/assertions.ts';
import type { MinaFetchInit } from './fetch_defines.ts';

/**
 * 发起一个可中断的文本类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为文本且请求可中断。
 * @returns 返回一个文本类型的 FetchTask。
 */
export function minaFetch(url: string, init: MinaFetchInit & {
    abortable: true;
    responseType: 'text';
}): FetchTask<string>;

/**
 * 发起一个可中断的 ArrayBuffer 类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 ArrayBuffer 且请求可中断。
 * @returns 返回一个 ArrayBuffer 类型的 FetchTask。
 */
export function minaFetch(url: string, init: MinaFetchInit & {
    abortable: true;
    responseType: 'arraybuffer';
}): FetchTask<ArrayBuffer>;

/**
 * 发起一个可中断的 JSON 类型响应的网络请求。
 * @typeParam T - 预期的 JSON 响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 JSON 且请求可中断。
 * @returns 返回一个 JSON 类型的 FetchTask。
 */
export function minaFetch<T>(url: string, init: MinaFetchInit & {
    abortable: true;
    responseType: 'json';
}): FetchTask<T>;

/**
 * 发起一个文本类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为文本。
 * @returns 返回一个文本类型的 AsyncIOResult。
 */
export function minaFetch(url: string, init: MinaFetchInit & {
    responseType: 'text';
}): AsyncIOResult<string>;

/**
 * 发起一个 ArrayBuffer 类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 ArrayBuffer。
 * @returns 返回一个 ArrayBuffer 类型的 AsyncIOResult。
 */
export function minaFetch(url: string, init: MinaFetchInit & {
    responseType: 'arraybuffer';
}): AsyncIOResult<ArrayBuffer>;

/**
 * 发起一个 JSON 类型响应的网络请求。
 * @typeParam T - 预期的 JSON 响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param {UnionFetchInit & { responseType: 'json'; }} init - 请求的初始化配置，指定响应类型为 JSON。
 * @returns 返回一个 JSON 类型的 AsyncIOResult。
 */
export function minaFetch<T>(url: string, init: MinaFetchInit & {
    responseType: 'json';
}): AsyncIOResult<T>;

/**
 * 发起一个可中断的网络请求，默认返回文本类型响应。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定请求可中断。
 * @returns {FetchTask<string>} 返回一个文本类型的 FetchTask。
 */
export function minaFetch(url: string, init: MinaFetchInit & {
    abortable: true;
}): FetchTask<string>;

/**
 * 发起一个网络请求，根据初始化配置返回对应类型的 FetchTask 或 AsyncIOResult。
 * @typeParam T - 预期的响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置。
 * @returns 根据配置返回 FetchTask 或 AsyncIOResult。
 */
export function minaFetch<T>(url: string, init?: MinaFetchInit): FetchTask<T> | AsyncIOResult<T>;
export function minaFetch<T>(url: string, init?: MinaFetchInit): FetchTask<T> | AsyncIOResult<T> {
    assertSafeUrl(url);

    // default not abort able
    const { abortable = false, responseType, ...rest } = init ?? {};

    let task: WechatMinigame.RequestTask;

    const response = new Promise<Result<T, Error>>((resolve) => {
        const options: WechatMinigame.RequestOption = {
            ...rest,
            url,
            success(res) {
                const { statusCode } = res;
                if (statusCode < 200 || statusCode >= 300) {
                    resolve(Err(new Error(`wx.request status: ${ statusCode }`)));
                } else {
                    resolve(Ok(res.data as T));
                }
            },
            fail(err) {
                const { errMsg } = err;
                const error = new Error(errMsg);

                if (errMsg.includes('abort')) {
                    error.name = 'AbortError';
                }

                resolve(Err(error));
            },
        };

        if (responseType === 'arraybuffer') {
            options.responseType = responseType;
        } else if (responseType === 'json') {
            options.dataType = responseType;
        } else {
            // default responseType is text
            options.responseType = responseType;
        }

        task = wx.request(options);
    });

    if (abortable) {
        return {
            abort(): void {
                task.abort();
            },
            get aborted(): never {
                throw new Error('Not support');
            },
            response,
        };
    } else {
        return response;
    }
}