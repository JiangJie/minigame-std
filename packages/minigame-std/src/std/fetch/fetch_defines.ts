import type { FetchInit } from '@happy-ts/fetch-t';

export { ABORT_ERROR, FetchError, TIMEOUT_ERROR, type FetchTask } from '@happy-ts/fetch-t';

/**
 * 微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。
 * @since 1.0.0
 */
export interface MinaFetchInit extends Omit<WechatMinigame.RequestOption, 'url' | 'dataType' | 'responseType' | 'success' | 'fail'> {
    responseType?: 'arraybuffer' | 'text' | 'json';
    onChunk?: FetchInit['onChunk'];
}

/**
 * 联合网络请求初始化配置类型，结合了 FetchInit 和 MinaFetchInit。
 * @since 1.0.0
 */
export type UnionFetchInit = FetchInit & MinaFetchInit;
