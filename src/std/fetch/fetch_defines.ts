import type { AsyncResult } from '@happy-js/happy-rusty';
import type { FetchInit } from '@happy-ts/fetch-t';

export type MinaFetchResponse<T> = AsyncResult<T, Error>;

export interface MinaFetchInit extends Omit<WechatMinigame.RequestOption, 'url' | 'responseType'> {
    abortable?: FetchInit['abortable'];
    responseType?: 'arraybuffer' | 'text' | 'json';
}

export type UnionFetchInit = FetchInit & MinaFetchInit;