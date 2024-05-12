/* eslint-disable @typescript-eslint/no-explicit-any */
import { Err, Ok, type Result } from '@happy-js/happy-rusty';
import type { FetchTask } from '@happy-ts/fetch-t';
import { assertSafeUrl } from '../assert/assertions.ts';
import type { MinaFetchInit, MinaFetchResponse } from './fetch_defines.ts';

export function minaFetch(url: string, init: MinaFetchInit & {
    abortable: true;
    responseType: 'text';
}): FetchTask<string>;
export function minaFetch(url: string, init: MinaFetchInit & {
    abortable: true;
    responseType: 'arraybuffer';
}): FetchTask<ArrayBuffer>;
export function minaFetch<T = any>(url: string, init: MinaFetchInit & {
    abortable: true;
    responseType: 'json';
}): FetchTask<T>;
export function minaFetch(url: string, init: MinaFetchInit & {
    responseType: 'text';
}): MinaFetchResponse<string>;
export function minaFetch(url: string, init: MinaFetchInit & {
    responseType: 'arraybuffer';
}): MinaFetchResponse<ArrayBuffer>;
export function minaFetch<T = any>(url: string, init: MinaFetchInit & {
    responseType: 'json';
}): MinaFetchResponse<T>;
export function minaFetch(url: string, init: MinaFetchInit & {
    abortable: true;
}): FetchTask<string>;
export function minaFetch<T>(url: string, init?: MinaFetchInit): FetchTask<T> | MinaFetchResponse<T>;
export function minaFetch<T>(url: string, init?: MinaFetchInit): FetchTask<T> | MinaFetchResponse<T> {
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