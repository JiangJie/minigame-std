import { promisifyWithResult } from '../utils/promisify.ts';
import type { NetworkType } from './network_define.ts';

/**
 * 获取网络状态。
 * @returns 返回值可能为 `wifi` | `none` | `unknown` | `2g` | `3g` | `4g`
 */
export async function getNetworkType(): Promise<NetworkType> {
    return (await promisifyWithResult(wx.getNetworkType)())
        .mapOr('unknown', x => x.networkType);
}

/**
 * 监听网络状态变化。
 * @param listener - 网络状态变化的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addNetworkChangeListener(listener: (type: NetworkType) => void): () => void {
    const networkListener = (res: WechatMinigame.OnNetworkStatusChangeListenerResult): void => {
        const { isConnected, networkType } = res;
        const type = isConnected ? networkType : 'none';

        listener(type);
    };

    wx.onNetworkStatusChange(networkListener);

    return () => {
        wx.offNetworkStatusChange(networkListener as unknown as WechatMinigame.OffNetworkStatusChangeCallback);
    };
}