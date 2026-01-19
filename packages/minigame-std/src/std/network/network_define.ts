/**
 * 网络状态，混合了 web 和小游戏环境。
 * @since 1.0.9
 * @example
 * ```ts
 * import { getNetworkType, type NetworkType } from 'minigame-std';
 *
 * const networkType: NetworkType = await getNetworkType();
 * if (networkType === 'wifi') {
 *     console.log('当前使用 WiFi 网络');
 * }
 * ```
 */
export type NetworkType = 'wifi' | 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none';