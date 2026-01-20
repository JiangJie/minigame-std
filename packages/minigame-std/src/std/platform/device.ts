import { Lazy, Ok, OnceAsync, type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { miniGameFailureToError } from '../internal/mod.ts';
import { asyncResultify } from '../utils/mod.ts';
import { parseUserAgent } from './user_agent.ts';

// #region Internal Variables

// 以下变量一旦获取则不会变化
// 兼容基础库低版本
const deviceInfo = Lazy<DeviceInfo>(() => isMinaEnv()
    ? (wx.getDeviceInfo ? wx.getDeviceInfo() : wx.getSystemInfoSync()) as unknown as DeviceInfo
    : getWebDeviceInfo(),
);
const benchmarkLevel = OnceAsync<number>();

// #endregion

/**
 * 获取设备信息。
 * @returns 返回小游戏的设备信息对象。
 * @since 1.0.0
 * @example
 * ```ts
 * const info = getDeviceInfo();
 * console.log('设备平台:', info.platform);
 * console.log('设备品牌:', info.brand);
 * console.log('设备型号:', info.model);
 * ```
 */
export function getDeviceInfo(): DeviceInfo {
    return deviceInfo.force();
}

/**
 * 获取设备性能等级， web 环境返回 -2。
 * @returns 返回设备性能等级。
 * @since 1.10.0
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
    // 小游戏从-1开始，-2表示web环境
    if (!isMinaEnv()) {
        return Ok(-2);
    }

    if (benchmarkLevel.isInitialized()) {
        return Ok(benchmarkLevel.get().unwrap());
    }

    // 优先使用新 API
    if (wx.getDeviceBenchmarkInfo) {
        return await benchmarkLevel.getOrTryInit(async () => {
            return (await asyncResultify(wx.getDeviceBenchmarkInfo)())
                .map(x => x.benchmarkLevel)
                .mapErr(miniGameFailureToError);
        });
    }

    // 兼容低版本基础库
    const level = getDeviceInfo().benchmarkLevel;
    benchmarkLevel.set(level);

    return Ok(level);
}

/**
 * 获取窗口信息。
 * @returns 包含窗口和屏幕相关信息的对象。
 * @since 1.7.0
 * @example
 * ```ts
 * const info = getWindowInfo();
 * console.log('窗口尺寸:', info.windowWidth, 'x', info.windowHeight);
 * console.log('屏幕尺寸:', info.screenWidth, 'x', info.screenHeight);
 * console.log('设备像素比:', info.pixelRatio);
 * ```
 */
export function getWindowInfo(): WechatMinigame.WindowInfo {
    return isMinaEnv() ? wx.getWindowInfo() : getWebWindowInfo();
}

/**
 * 平台类型。
 * @since 1.0.0
 * @example
 * ```ts
 * import { platform, type Platform } from 'minigame-std';
 *
 * const info = platform.getDeviceInfo();
 * const devicePlatform: Platform = info.platform;
 * console.log(devicePlatform); // 'ios' | 'android' | 'mac' | ...
 * ```
 */
export type Platform = 'ios' | 'android' | 'mac' | 'windows' | 'ohos' | 'ohos_pc' | 'devtools' | 'linux' | 'unknown';

/**
 * 设备信息类型。
 * 修正了 `memorySize` 的类型为 `number`（小游戏 API 实际返回数字，但官方类型定义错误地声明为 string）。
 * @see https://github.com/wechat-miniprogram/minigame-api-typings/issues/27
 * @since 1.0.0
 * @example
 * ```ts
 * import { platform, type DeviceInfo } from 'minigame-std';
 *
 * const info: DeviceInfo = platform.getDeviceInfo();
 * console.log('平台:', info.platform);
 * console.log('内存:', info.memorySize, 'MB');
 * ```
 */
export type DeviceInfo = Omit<WechatMinigame.DeviceInfo, 'abi' | 'cpuType' | 'deviceAbi' | 'memorySize' | 'platform'> & {
    abi?: string;
    cpuType?: string;
    deviceAbi?: string;
    /** 设备内存大小，单位为 MB */
    memorySize: number;
    /** 设备平台 */
    platform: Platform;
};

// #region Internal Functions

/**
 * 获取 Web 环境下的设备信息。
 */
function getWebDeviceInfo(): DeviceInfo {
    const { model, platform, system } = parseUserAgent();
    const memorySize = ((navigator as Navigator & { deviceMemory?: number; }).deviceMemory ?? 0) * 1024;

    return {
        benchmarkLevel: -2, // Web 环境固定返回 -2
        brand: '', // Web 环境无法可靠获取品牌信息
        memorySize,
        model,
        platform: platform as Platform,
        system,
    };
}

/**
 * 获取 Web 环境下的窗口信息。
 */
function getWebWindowInfo(): WechatMinigame.WindowInfo {
    return {
        pixelRatio: devicePixelRatio,
        screenHeight: screen.height,
        screenTop,
        screenWidth: screen.width,
        windowHeight: innerHeight,
        windowWidth: innerWidth,
        statusBarHeight: 0,
        safeArea: {
            left: 0,
            right: innerWidth,
            top: 0,
            bottom: innerHeight,
            width: innerWidth,
            height: innerHeight,
        },
    };
}

// #endregion
