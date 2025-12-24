/**
 * @internal
 * Mini-game platform implementation for event listeners.
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