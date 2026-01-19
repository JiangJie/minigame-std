import type { FetchInit } from '@happy-ts/fetch-t';

export { ABORT_ERROR, FetchError, TIMEOUT_ERROR, type FetchTask } from '@happy-ts/fetch-t';

/**
 * 微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fetchT, type MinaFetchInit } from 'minigame-std';
 *
 * const init: MinaFetchInit = {
 *     method: 'POST',
 *     header: { 'Content-Type': 'application/json' },
 *     responseType: 'json',
 * };
 * const task = fetchT('https://api.example.com/data', init);
 * ```
 */
export interface MinaFetchInit extends Omit<WechatMinigame.RequestOption, 'url' | 'dataType' | 'responseType' | 'success' | 'fail'> {
    responseType?: 'arraybuffer' | 'text' | 'json';
    onChunk?: FetchInit['onChunk'];
}

/**
 * 联合网络请求初始化配置类型，结合了 FetchInit 和 MinaFetchInit。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fetchT, type UnionFetchInit } from 'minigame-std';
 *
 * const init: UnionFetchInit = {
 *     method: 'GET',
 *     responseType: 'json',
 *     timeout: 30000,
 * };
 * const task = fetchT('https://api.example.com/data', init);
 * ```
 */
export type UnionFetchInit = FetchInit & MinaFetchInit;
