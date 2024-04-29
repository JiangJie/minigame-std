export function addErrorListener(listener: WechatMinigame.WxOnErrorCallback): void {
    wx.onError(listener);
}

export function removeErrorListener(listener: WechatMinigame.WxOnErrorCallback): void {
    wx.offError(listener as unknown as WechatMinigame.WxOffErrorCallback);
}

export function addUnhandledrejectionListener(listener: (WechatMinigame.OnUnhandledRejectionCallback)): void {
    wx.onUnhandledRejection(listener)
}

export function removeUnhandledrejectionListener(listener: WechatMinigame.OnUnhandledRejectionCallback): void {
    wx.offUnhandledRejection(listener);
}