/**
 * 添加错误监听器，用于监听微信小游戏中的错误事件。
 * @param listener - 错误事件的回调函数。
 */
export function addErrorListener(listener: WechatMinigame.WxOnErrorCallback): void {
    wx.onError(listener);
}

/**
 * 移除错误监听器，停止监听微信小游戏中的错误事件。
 * @param listener - 已注册的错误事件的回调函数。
 */
export function removeErrorListener(listener: WechatMinigame.WxOnErrorCallback): void {
    wx.offError(listener as unknown as WechatMinigame.WxOffErrorCallback);
}

/**
 * 添加未处理的 Promise 拒绝事件监听器。
 * @param listener - 未处理的 Promise 拒绝事件的回调函数。
 */
export function addUnhandledrejectionListener(listener: (WechatMinigame.OnUnhandledRejectionCallback)): void {
    wx.onUnhandledRejection(listener)
}

/**
 * 移除未处理的 Promise 拒绝事件监听器。
 * @param listener - 已注册的未处理的 Promise 拒绝事件的回调函数。
 */
export function removeUnhandledrejectionListener(listener: WechatMinigame.OnUnhandledRejectionCallback): void {
    wx.offUnhandledRejection(listener);
}