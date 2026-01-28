import { isMiniGame } from './base.ts';
import { getDeviceInfo } from './device.ts';

/**
 * 判断当前是否在小游戏的运行时环境中。
 * @returns 如果在小游戏的运行时环境中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameRuntime()) {
 *     console.log('在小游戏真机环境中');
 * }
 * ```
 */
export function isMiniGameRuntime(): boolean {
    return isMiniGame() && getPlatform() !== 'devtools';
}

/**
 * 判断当前是否在小游戏的开发者工具中。
 * @returns 如果在小游戏的开发者工具中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameDevtools()) {
 *     console.log('在开发者工具中');
 * }
 * ```
 */
export function isMiniGameDevtools(): boolean {
    return isMiniGame() && getPlatform() === 'devtools';
}

/**
 * 判断当前是否在小游戏的 iOS 环境中。
 * @returns 如果在小游戏的 iOS 环境中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameIOS()) {
 *     console.log('在 iOS 设备上运行');
 * }
 * ```
 */
export function isMiniGameIOS(): boolean {
    return isMiniGame() && getPlatform() === 'ios';
}

/**
 * 判断当前是否在小游戏的 Android 环境中。
 * @returns 如果在小游戏的 Android 环境中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameAndroid()) {
 *     console.log('在 Android 设备上运行');
 * }
 * ```
 */
export function isMiniGameAndroid(): boolean {
    return isMiniGame() && getPlatform() === 'android';
}

/**
 * 判断当前是否在小游戏的 Windows 环境中。
 * @returns 如果在小游戏的 Windows 环境中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameWin()) {
 *     console.log('在 Windows 设备上运行');
 * }
 * ```
 */
export function isMiniGameWin(): boolean {
    return isMiniGame() && getPlatform() === 'windows';
}

/**
 * 判断当前是否在小游戏的 Mac 环境中。
 * @returns 如果在小游戏的 Mac 环境中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameMac()) {
 *     console.log('在 Mac 设备上运行');
 * }
 * ```
 */
export function isMiniGameMac(): boolean {
    return isMiniGame() && getPlatform() === 'mac';
}

/**
 * 判断当前是否在小游戏的 HarmonyOS 环境中。
 * @returns 如果在小游戏的 HarmonyOS 环境中返回 true，否则返回 false。
 * @since 1.9.0
 * @example
 * ```ts
 * if (isMiniGameHarmonyOS()) {
 *     console.log('在 HarmonyOS 设备上运行');
 * }
 * ```
 */
export function isMiniGameHarmonyOS(): boolean {
    return isMiniGame() && getPlatform() === 'ohos';
}

// #region Internal Functions

/**
 * 获取当前平台类型。
 */
function getPlatform(): string {
    return getDeviceInfo().platform.toLowerCase();
}

// #endregion