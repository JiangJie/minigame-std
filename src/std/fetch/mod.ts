import { fetchT as webFetch, type FetchTask } from '@happy-ts/fetch-t';
import type { AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { UnionFetchInit } from './fetch_defines.ts';
import { minaFetch } from './mina_fetch.ts';

export type { MinaFetchInit, UnionFetchInit } from './fetch_defines.ts';

/**
 * 发起一个可中断的文本类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为文本且请求可中断。
 * @returns 返回一个文本类型的 FetchTask。
 */
export function fetchT(url: string, init: UnionFetchInit & {
    abortable: true;
    responseType: 'text';
}): FetchTask<string>;

/**
 * 发起一个可中断的 ArrayBuffer 类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 ArrayBuffer 且请求可中断。
 * @returns 返回一个 ArrayBuffer 类型的 FetchTask。
 */
export function fetchT(url: string, init: UnionFetchInit & {
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
export function fetchT<T>(url: string, init: UnionFetchInit & {
    abortable: true;
    responseType: 'json';
}): FetchTask<T>;

/**
 * 发起一个文本类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为文本。
 * @returns 返回一个文本类型的 AsyncIOResult。
 */
export function fetchT(url: string, init: UnionFetchInit & {
    responseType: 'text';
}): AsyncIOResult<string>;

/**
 * 发起一个 ArrayBuffer 类型响应的网络请求。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定响应类型为 ArrayBuffer。
 * @returns 返回一个 ArrayBuffer 类型的 AsyncIOResult。
 */
export function fetchT(url: string, init: UnionFetchInit & {
    responseType: 'arraybuffer';
}): AsyncIOResult<ArrayBuffer>;

/**
 * 发起一个 JSON 类型响应的网络请求。
 * @typeParam T - 预期的 JSON 响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param {UnionFetchInit & { responseType: 'json'; }} init - 请求的初始化配置，指定响应类型为 JSON。
 * @returns 返回一个 JSON 类型的 AsyncIOResult。
 */
export function fetchT<T>(url: string, init: UnionFetchInit & {
    responseType: 'json';
}): AsyncIOResult<T>;

/**
 * 发起一个可中断的网络请求，默认返回文本类型响应。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定请求可中断。
 * @returns 返回一个文本类型的 FetchTask。
 */
export function fetchT(url: string, init: UnionFetchInit & {
    abortable: true;
}): FetchTask<string>;

/**
 * 发起一个不可中断的网络请求，默认返回文本类型响应。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置，指定请求不可中断。
 * @returns 返回一个文本类型的 AsyncIOResult。
 */
export function fetchT(url: string, init: UnionFetchInit & {
    abortable: false;
}): AsyncIOResult<string>;

/**
 * 发起一个网络请求，根据初始化配置返回对应类型的 FetchTask 或 AsyncIOResult。
 * @typeParam T - 预期的响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置。
 * @returns 根据配置返回 FetchTask 或 AsyncIOResult。
 */
export function fetchT<T>(url: string, init?: UnionFetchInit): AsyncIOResult<T>;

/**
 * 发起一个网络请求，根据初始化配置返回对应类型的 FetchTask 或 AsyncIOResult。
 * @typeParam T - 预期的响应数据类型。
 * @param url - 请求的 URL 地址。
 * @param init - 请求的初始化配置。
 * @returns 根据配置返回 FetchTask 或 AsyncIOResult。
 */
export function fetchT<T>(url: string, init?: UnionFetchInit): FetchTask<T> | AsyncIOResult<T> {
    const defaultInit = init ?? {};
    // default is text type
    defaultInit.responseType ??= 'text';

    return isMinaEnv() ? minaFetch(url, defaultInit) : webFetch(url, defaultInit);
}