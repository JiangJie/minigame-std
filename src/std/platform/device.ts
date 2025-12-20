import { Err, Ok, type AsyncIOResult } from 'happy-rusty';
import { miniGameFailureToError, promisifyWithResult } from '../utils/mod.ts';
import { isWeb } from './base.ts';

// 以下变量一旦获取则不会变化
let deviceInfo: WechatMinigame.DeviceInfo | undefined;
let benchmarkLevel: number | undefined;

/**
 * 获取设备信息。
 * @returns 返回小游戏的设备信息对象。
 * @example
 * ```ts
 * const info = getDeviceInfo();
 * console.log('设备平台:', info.platform);
 * console.log('设备品牌:', info.brand);
 * console.log('设备型号:', info.model);
 * ```
 */
export function getDeviceInfo(): WechatMinigame.DeviceInfo {
    // 兼容基础库低版本
    // TODO 暂时只用了platform属性，可安全强转类型
    deviceInfo ??= wx.getDeviceInfo ? wx.getDeviceInfo() : (wx.getSystemInfoSync() as unknown as WechatMinigame.DeviceInfo);
    return deviceInfo;
}

/**
 * 获取设备性能等级， web 环境返回 -2。
 * @returns 返回设备性能等级。
 * @example
 * ```ts
 * const result = await getDeviceBenchmarkLevel();
 * if (result.isOk()) {
 *     const level = result.unwrap();
 *     if (level >= 30) {
 *         console.log('高性能设备');
 *     } else if (level >= 20) {
 *         console.log('中等性能设备');
 *     } else {
 *         console.log('低性能设备');
 *     }
 * }
 * ```
 */
export async function getDeviceBenchmarkLevel(): AsyncIOResult<number> {
    if (isWeb()) {
        // 小游戏从-1开始，-2表示web环境
        return Ok(-2);
    }

    if (benchmarkLevel != null) {
        return Ok(benchmarkLevel);
    }

    // 优先使用新 API
    if (wx.getDeviceBenchmarkInfo) {
        return (await promisifyWithResult(wx.getDeviceBenchmarkInfo)()).map(x => {
            // 缓存起来
            benchmarkLevel = x.benchmarkLevel;
            return benchmarkLevel;
        }).mapErr(miniGameFailureToError);
    } else {
        const info = getDeviceInfo();

        if (info) {
            benchmarkLevel = info.benchmarkLevel;
            return Ok(benchmarkLevel);
        }
        return Err(new Error('Failed to get device benchmarkLevel'));
    }
}