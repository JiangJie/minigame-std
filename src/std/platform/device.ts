let deviceInfo: WechatMinigame.DeviceInfo;

/**
 * 获取设备信息。
 * @returns 返回小游戏的设备信息对象。
 */
export function getDeviceInfo(): WechatMinigame.DeviceInfo {
    // 兼容基础库低版本
    // TODO 暂时只用了platform属性，可安全强转类型
    deviceInfo ??= wx.getDeviceInfo ? wx.getDeviceInfo() : (wx.getSystemInfoSync() as unknown as WechatMinigame.DeviceInfo);
    return deviceInfo;
}