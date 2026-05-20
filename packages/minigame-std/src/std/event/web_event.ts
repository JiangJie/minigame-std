/**
 * @internal
 * Web 平台的事件监听实现。
 */

/**
 * 添加错误监听器，用于监听标准的错误事件。
 * @param listener - 错误事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addErrorListener(listener: (ev: ErrorEvent) => void): () => void {
    addEventListener('error', listener);

    return (): void => {
        removeEventListener('error', listener);
    };
}

/**
 * 添加未处理的 Promise 拒绝事件监听器。
 * @param listener - 未处理的 Promise 拒绝事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addUnhandledrejectionListener(listener: (ev: PromiseRejectionEvent) => void): () => void {
    addEventListener('unhandledrejection', listener);

    return (): void => {
        removeEventListener('unhandledrejection', listener);
    };
}

/**
 * 添加窗口大小改变事件监听器。
 * @param listener - 窗口大小改变事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addResizeListener(listener: (ev: UIEvent) => void): () => void {
    addEventListener('resize', listener);

    return (): void => {
        removeEventListener('resize', listener);
    };
}

/**
 * 添加页面回到前台事件监听器。
 * @param listener - 页面回到前台事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addShowListener(listener: (ev: WechatMinigame.OnShowListenerResult) => void): () => void {
    const webListener = () => {
        if (document.visibilityState === 'visible') listener(getWebShowOptions());
    };

    document.addEventListener('visibilitychange', webListener);

    return (): void => {
        document.removeEventListener('visibilitychange', webListener);
    };
}

/**
 * 添加页面切到后台事件监听器。
 * @param listener - 页面切到后台事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addHideListener(listener: () => void): () => void {
    const webListener = () => {
        if (document.visibilityState === 'hidden') listener();
    };

    document.addEventListener('visibilitychange', webListener);

    return (): void => {
        document.removeEventListener('visibilitychange', webListener);
    };
}

// #region Internal Functions

function getWebShowOptions(): WechatMinigame.OnShowListenerResult {
    const query: Record<string, string> = {};

    new URLSearchParams(location.search).forEach((value, key) => {
        query[key] = value;
    });

    return {
        query,
        referrerInfo: {
            appId: document.referrer,
            extraData: {},
        },
        scene: 0,
    };
}

// #endregion
