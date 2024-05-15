/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchT as webFetch, type FetchTask } from '@happy-ts/fetch-t';
import { isMinaEnv } from '../../macros/env.ts';
import type { MinaFetchResponse, UnionFetchInit } from './fetch_defines.ts';
import { minaFetch } from './mina_fetch.ts';

export function fetchT(url: string, init: UnionFetchInit & {
    abortable: true;
    responseType: 'text';
}): FetchTask<string>;
export function fetchT(url: string, init: UnionFetchInit & {
    abortable: true;
    responseType: 'arraybuffer';
}): FetchTask<ArrayBuffer>;
export function fetchT<T = any>(url: string, init: UnionFetchInit & {
    abortable: true;
    responseType: 'json';
}): FetchTask<T>;
export function fetchT(url: string, init: UnionFetchInit & {
    responseType: 'text';
}): MinaFetchResponse<string>;
export function fetchT(url: string, init: UnionFetchInit & {
    responseType: 'arraybuffer';
}): MinaFetchResponse<ArrayBuffer>;
export function fetchT<T = any>(url: string, init: UnionFetchInit & {
    responseType: 'json';
}): MinaFetchResponse<T>;
export function fetchT(url: string, init: UnionFetchInit & {
    abortable: true;
}): FetchTask<string>;
export function fetchT(url: string, init: UnionFetchInit & {
    abortable: false;
}): MinaFetchResponse<string>;
export function fetchT<T>(url: string, init?: UnionFetchInit): FetchTask<T> | MinaFetchResponse<T>;
export function fetchT<T>(url: string, init?: UnionFetchInit): FetchTask<T> | MinaFetchResponse<T> {
    const defaultInit = init ?? {};
    // default is text type
    defaultInit.responseType ??= 'text';

    return isMinaEnv() ? minaFetch(url, defaultInit) : webFetch(url, defaultInit);
}