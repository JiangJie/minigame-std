import type { FetchInit } from '@happy-ts/fetch-t';

/**
 * 联合网络请求初始化配置类型，结合了 FetchInit 和 MinaFetchInit，并统一了 body 和 headers。
 *
 * - 使用 `body` 传递请求体数据，支持字符串、对象和 BufferSource。
 * - 使用 `headers` 传递请求头，小游戏平台自动映射为 `header`。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fetchT, type UnionFetchInit } from 'minigame-std';
 *
 * const init: UnionFetchInit = {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: { key: 'value' },
 *     responseType: 'json',
 * };
 * const task = fetchT('https://api.example.com/data', init);
 * ```
 */
export interface UnionFetchInit extends Omit<FetchInit & MinaFetchInit, 'body' | 'header' | 'headers' | 'data'> {
    body?: string | WechatMinigame.IAnyObject | BufferSource;
    headers?: Record<string, string>;
}

/**
 * 微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。
 * @internal
 */
export interface MinaFetchInit extends Omit<WechatMinigame.RequestOption, 'url' | 'dataType' | 'responseType' | 'success' | 'fail'> {
    responseType?: 'arraybuffer' | 'text' | 'json';
    onChunk?: FetchInit['onChunk'];
}
