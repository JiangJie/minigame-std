/**
 * @internal
 * 小游戏平台的 HTTP 请求实现。
 */

import type { FetchResult } from '@happy-ts/fetch-t';
import { Err, Ok, type IOResult } from 'happy-rusty';
import { Future } from 'tiny-future';
import { assertSafeUrl } from '../assert/assertions.ts';
import { miniGameFailureToError } from '../utils/mod.ts';
import { ABORT_ERROR, FetchError, TIMEOUT_ERROR, type FetchTask, type MinaFetchInit } from './fetch_defines.ts';

/**
 * 发起一个可中断的 ArrayBuffer 类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 ArrayBuffer 且请求可中断。
 * @returns 返回一个 ArrayBuffer 类型的 FetchTask。
 */
export function minaFetch(url: string, init: MinaFetchInit & {
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
    responseType: 'json';
}): FetchTask<T>;

/**
 * 发起一个可中断的文本类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为文本且请求可中断。
 * @returns 返回一个文本类型的 FetchTask。
 */
export function minaFetch(url: string, init?: MinaFetchInit & {
    responseType: 'text';
}): FetchTask<string>;

/**
 * 发起一个可中断的网络请求，默认返回文本类型响应。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定请求可中断。
 * @returns {FetchTask<string>} 返回一个文本类型的 FetchTask。
 */
export function minaFetch(url: string, init: MinaFetchInit): FetchTask<string>;

/**
 * 发起一个网络请求，根据初始化配置返回对应类型的 FetchTask。
 * @typeParam T - 预期的响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置。
 * @returns 根据配置返回 FetchTask。
 */
export function minaFetch<T>(url: string, init?: MinaFetchInit): FetchTask<T> {
    assertSafeUrl(url);

    const {
        responseType,
        onChunk,
        ...rest
    } = init ?? {};

    let aborted = false;

    const future = new Future<IOResult<T>>();

    const options: WechatMinigame.RequestOption = {
        ...rest,
        url,
        success(res) {
            const { statusCode } = res;

            if (statusCode >= 200 && statusCode < 300) {
                future.resolve(Ok(res.data as T));
            } else {
                future.resolve(Err(new FetchError(res.errMsg, statusCode)));
            }
        },
        fail(err) {
            const error = miniGameFailureToError(err);
            const { errMsg } = err;

            if (errMsg.includes('abort')) {
                error.name = ABORT_ERROR;
            } else if (errMsg.includes('timeout')) {
                error.name = TIMEOUT_ERROR;
            }

            future.resolve(Err(error));
        },
    };

    if (responseType === 'arraybuffer') {
        options.responseType = responseType;
    } else if (responseType === 'json') {
        options.dataType = responseType;
    } else {
        // 默认 responseType 是 text
        options.responseType = responseType;
        // responseType设置为text还不够，否则返回类型还是json
        options.dataType = '其他';
    }

    const task = wx.request(options);

    if (typeof onChunk === 'function') {
        task.onChunkReceived(res => {
            onChunk(new Uint8Array(res.data));
        });
    }

    return {
        abort(): void {
            aborted = true;
            task.abort();
        },

        get aborted(): boolean {
            return aborted;
        },

        get result(): FetchResult<T> {
            return future.promise;
        },
    };
}