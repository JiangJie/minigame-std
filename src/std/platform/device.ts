let deviceInfo: WechatMinigame.DeviceInfo;

/**
 * 获取设备信息。
 * @returns 返回小游戏的设备信息对象。
 */
export function getDeviceInfo(): WechatMinigame.DeviceInfo {
    deviceInfo ??= wx.getDeviceInfo();
    return deviceInfo;
}