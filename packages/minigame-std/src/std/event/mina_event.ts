/**
 * @internal
 * 小游戏平台的事件监听实现。
 */

/**
 * 添加错误监听器，用于监听微信小游戏中的错误事件。
 * @param listener - 错误事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addErrorListener(listener: WechatMinigame.WxOnErrorCallback): () => void {
    wx.onError(listener);

    return (): void => {
        wx.offError(listener as unknown as WechatMinigame.WxOffErrorCallback);
    };
}

/**
 * 添加未处理的 Promise 拒绝事件监听器。
 * @param listener - 未处理的 Promise 拒绝事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addUnhandledrejectionListener(listener: (WechatMinigame.OnUnhandledRejectionCallback)): () => void {
    wx.onUnhandledRejection(listener);

    return (): void => {
        wx.offUnhandledRejection(listener);
    };
}

/**
 * 添加窗口大小改变事件监听器。
 * @param listener - 窗口大小改变事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addResizeListener(listener: WechatMinigame.OnWindowResizeCallback): () => void {
    wx.onWindowResize(listener);

    return (): void => {
        wx.offWindowResize(listener);
    };
}

/**
 * 添加小游戏回到前台事件监听器。
 * @param listener - 小游戏回到前台事件的回调函数。
 * @param options - 可选配置。
 * @param options.fireImmediately - 是否在注册时立即以当前进入参数回调一次（默认 `false`）。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addShowListener(
    listener: WechatMinigame.OnShowCallback,
    options?: { fireImmediately?: boolean; },
): () => void {
    if (options?.fireImmediately) {
        // 使用 getEnterOptionsSync 获取最新进入参数，语义与 wx.onShow 回调参数一致
        listener(getEnterOptionsSync());
    }

    wx.onShow(listener);

    return (): void => {
        wx.offShow(listener);
    };
}

/**
 * 添加小游戏切到后台事件监听器。
 * @param listener - 小游戏切到后台事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addHideListener(listener: () => void): () => void {
    wx.onHide(listener);

    return (): void => {
        wx.offHide(listener);
    };
}

/**
 * 获取小游戏冷启动时的参数。
 * 对应 `wx.getLaunchOptionsSync()`，生命周期内返回值始终不变。
 * @returns 返回冷启动参数。
 */
export function getLaunchOptionsSync(): WechatMinigame.LaunchOptionsGame {
    return wx.getLaunchOptionsSync();
}

/**
 * 获取小游戏最近一次进入的参数。
 * 对应 `wx.getEnterOptionsSync()`，热启动（切前台）时返回值可能更新。
 * @returns 返回当前进入参数。
 */
export function getEnterOptionsSync(): WechatMinigame.EnterOptionsGame {
    return wx.getEnterOptionsSync();
}
