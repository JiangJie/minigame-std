import { isMinaEnv } from '../../macros/env';
import { addNetworkChangeListener as minaAddNetworkChangeListener, getNetworkType as minaGetNetworkType } from './mina_network';
import type { NetworkType } from './network_define';
import { addNetworkChangeListener as webAddNetworkChangeListener, getNetworkType as webGetNetworkType } from './web_network';

export * from './network_define';

/**
 * 获取网络状态。
 * @returns 根据浏览器支持情况不同，返回值可能为 `wifi` | `none` | `unknown` | `slow-2g` | `2g` | `3g` | `4g`
 */
export function getNetworkType(): Promise<NetworkType> {
    if (isMinaEnv()) {
        return minaGetNetworkType();
    }

    return Promise.resolve(webGetNetworkType());
}

/**
 * 监听网络状态变化。
 * @param listener - 网络状态变化的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addNetworkChangeListener(listener: (type: NetworkType) => void): () => void {
    if (isMinaEnv()) {
        return minaAddNetworkChangeListener(listener);
    }

    return webAddNetworkChangeListener(listener);
}