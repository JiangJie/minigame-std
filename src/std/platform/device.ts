let deviceInfo: WechatMinigame.DeviceInfo;

export function getDeviceInfo(): WechatMinigame.DeviceInfo {
    deviceInfo ??= wx.getDeviceInfo();
    return deviceInfo;
}