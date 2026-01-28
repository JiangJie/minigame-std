/**
 * 解析 userAgent 获取设备信息。
 * @param ua - 要解析的 userAgent 字符串，默认为 navigator.userAgent。
 * @returns 解析后的设备信息，包含 model、platform 和 system。
 * @internal
 */
export function parseUserAgent(ua: string = navigator.userAgent): { model: string; platform: string; system: string; } {
    // iOS 设备: iPhone/iPad/iPod
    // 示例: Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X)
    // wx.getDeviceInfo: model="iPhone 17 Pro<iPhone18,1>", system="iOS 26.2"
    const iosMatch = ua.match(/\((iPhone|iPad|iPod);.*?OS (\d+[_\d]*)/);
    if (iosMatch) {
        const model = iosMatch[1];
        const version = iosMatch[2].replace(/_/g, '.');
        return { model, platform: 'ios', system: `iOS ${ version }` };
    }

    // Android 设备
    // 示例1: Linux; Android 12; ELS-AN00 Build/HUAWEIELS-AN00
    // wx.getDeviceInfo: model="ELS-AN00", system="Android 12"
    // 示例2: Linux; U; Android 13; zh-cn; 22127RK46C Build/TKQ1.220905.001
    // wx.getDeviceInfo: model="22127RK46C", system="Android 13"
    // 注意: model 是 Build/ 前面的最后一个字段
    const androidMatch = ua.match(/Android\s+([\d.]+);(?:.*?;\s*)?([^;]+)\s+Build/);
    if (androidMatch) {
        const version = androidMatch[1];
        const model = androidMatch[2].trim();
        return { model, platform: 'android', system: `Android ${ version }` };
    }

    // Mac
    // 示例: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)
    const macMatch = ua.match(/Mac OS X (\d+[_\d]*)/);
    if (macMatch) {
        const version = macMatch[1].replace(/_/g, '.');
        return { model: 'Mac', platform: 'mac', system: `macOS ${ version }` };
    }

    // Windows
    // 示例: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
    const winMatch = ua.match(/Windows NT ([\d.]+)/);
    if (winMatch) {
        return { model: 'PC', platform: 'windows', system: `Windows NT ${ winMatch[1] }` };
    }

    // Linux
    if (ua.includes('Linux')) {
        return { model: 'Linux', platform: 'linux', system: 'Linux' };
    }

    return { model: 'unknown', platform: 'unknown', system: 'unknown' };
}
