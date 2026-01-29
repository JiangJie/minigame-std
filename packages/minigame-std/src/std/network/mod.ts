/**
 * 网络状态模块，提供获取网络类型和监听网络状态变化的功能。
 * @module network
 */
import { isMinaEnv } from '../../macros/env.ts';
import { addNetworkChangeListener as minaAddNetworkChangeListener, getNetworkType as minaGetNetworkType } from './mina_network.ts';
import type { NetworkType } from './network_define.ts';
import { addNetworkChangeListener as webAddNetworkChangeListener, getNetworkType as webGetNetworkType } from './web_network.ts';

export * from './network_define.ts';

/**
 * 获取网络状态。
 * @returns 根据浏览器支持情况不同，返回值可能为 `wifi` | `none` | `unknown` | `slow-2g` | `2g` | `3g` | `4g`
 * @since 1.0.9
 * @example
 * ```ts
 * const networkType = await getNetworkType();
 * console.log('当前网络类型:', networkType);
 * if (networkType === 'none') {
 *     console.log('当前无网络连接');
 * }
 * ```
 */
export function getNetworkType(): Promise<NetworkType> {
    return isMinaEnv()
        ? minaGetNetworkType()
        : Promise.resolve(webGetNetworkType());
}

/**
 * 监听网络状态变化。
 * @param listener - 网络状态变化的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 * @since 1.0.9
 * @example
 * ```ts
 * const removeListener = addNetworkChangeListener((type) => {
 *     console.log('网络状态变化:', type);
 *     if (type === 'none') {
 *         console.log('网络已断开');
 *     }
 * });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addNetworkChangeListener(listener: (type: NetworkType) => void): () => void {
    return (isMinaEnv() ? minaAddNetworkChangeListener : webAddNetworkChangeListener)(listener);
}