import type { FetchInit } from '@happy-ts/fetch-t';

/**
 * 微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。
 */
export interface MinaFetchInit extends Omit<WechatMinigame.RequestOption, 'url' | 'responseType'> {
    abortable?: FetchInit['abortable'];
    responseType?: 'arraybuffer' | 'text' | 'json';
}

/**
 * 联合网络请求初始化配置类型，结合了 FetchInit 和 MinaFetchInit。
 */
export type UnionFetchInit = FetchInit & MinaFetchInit;