/**
 * @internal
 * Web 平台的事件监听实现。
 */

// #region Internal Variables

// 模块加载时立即计算并缓存，而非 Lazy 延迟到首次调用：
// 若延迟计算，期间 SPA 路由可能已改变 location.search，缓存的就不是真正的冷启动参数。
const launchOptions: WechatMinigame.LaunchOptionsGame = /*#__PURE__*/ (() => {
    const web = getWebShowOptions();
    return {
        query: web.query,
        scene: web.scene,
        referrerInfo: {
            appId: document.referrer,
            extraData: {},
        },
        chatType: web.chatType,
        shareTicket: web.shareTicket,
    } as WechatMinigame.LaunchOptionsGame;
})();

// #endregion

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
 * @param options - 可选配置。
 * @param options.fireImmediately - 是否在注册时立即以当前进入参数回调一次（默认 `false`）。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addShowListener(
    listener: (ev: WechatMinigame.OnShowListenerResult) => void,
    options?: { fireImmediately?: boolean; },
): () => void {
    if (options?.fireImmediately) {
        listener(getWebShowOptions());
    }

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

/**
 * 获取页面冷启动时的参数。首次调用时解析并缓存页面 URL 参数，后续调用始终返回缓存值。
 *
 * **注意：** Web 环境下 `hostExtraData` 无实际值，请使用可选链 `?.` 访问。
 *
 * @returns 返回冷启动参数。
 */
export function getLaunchOptionsSync(): WechatMinigame.LaunchOptionsGame {
    return launchOptions;
}

/**
 * 获取页面当前进入参数。每次调用实时解析当前页面 URL 参数。
 *
 * **注意：** Web 环境下 `apiCategory` 无实际值，请使用可选链 `?.` 访问。
 *
 * @returns 返回当前进入参数。
 */
export function getEnterOptionsSync(): WechatMinigame.EnterOptionsGame {
    return getWebShowOptions() as WechatMinigame.EnterOptionsGame;
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
