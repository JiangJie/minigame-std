import type { NetworkType } from './network_define';

/**
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation)
 */
interface NetworkInformation extends EventTarget {
    type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
}

/**
 * [Global augmentation](https://jsr.io/docs/about-slow-types#global-augmentation)
 *
 * Waiting for typescript support.
 *
 * extend Navigator.
 */
interface Navigator {
    connection?: NetworkInformation;
}

/**
 * 获取网络状态。
 * @returns 根据浏览器支持情况不同，返回值可能为 `wifi` | `none` | `unknown` | `slow-2g` | `2g` | `3g` | `4g`
 */
export function getNetworkType(): NetworkType {
    if (!navigator.onLine) {
        return 'none';
    }

    const navi = (navigator as Navigator);

    // 进一步判断
    if (navi.connection) {
        return navi.connection.type === 'wifi'
            ? 'wifi'
            : navi.connection.effectiveType;
    } else {
        return 'unknown';
    }
}

/**
 * 监听网络状态变化。
 * @param listener - 网络状态变化的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addNetworkChangeListener(listener: (type: NetworkType) => void): () => void {
    const networkListener = (): void => {
        listener(getNetworkType());
    };

    const navi = (navigator as Navigator);

    navi.connection?.addEventListener('change', networkListener);

    return () => {
        navi.connection?.removeEventListener('change', networkListener);
    };
}