import { isMiniGame } from './base.ts';
import { getDeviceInfo } from './device.ts';

function getPlatform(): string {
    return getDeviceInfo().platform.toLowerCase();
}

/**
 * 判断当前是否在小游戏的运行时环境中。
 * @returns 如果在小游戏的运行时环境中返回 true，否则返回 false。
 */
export function isMiniGameRuntime(): boolean {
    return isMiniGame() && getPlatform() !== 'devtools';
}

/**
 * 判断当前是否在小游戏的开发者工具中。
 * @returns 如果在小游戏的开发者工具中返回 true，否则返回 false。
 */
export function isMiniGameDevtools(): boolean {
    return isMiniGame() && getPlatform() === 'devtools';
}

/**
 * 判断当前是否在小游戏的 iOS 环境中。
 * @returns 如果在小游戏的 iOS 环境中返回 true，否则返回 false。
 */
export function isMiniGameIOS(): boolean {
    return isMiniGame() && getPlatform() === 'ios';
}

/**
 * 判断当前是否在小游戏的 Android 环境中。
 * @returns 如果在小游戏的 Android 环境中返回 true，否则返回 false。
 */
export function isMiniGameAndroid(): boolean {
    return isMiniGame() && getPlatform() === 'android';
}

/**
 * 判断当前是否在小游戏的 Windows 环境中。
 * @returns 如果在小游戏的 Windows 环境中返回 true，否则返回 false。
 */
export function isMiniGameWin(): boolean {
    return isMiniGame() && getPlatform() === 'windows';
}

/**
 * 判断当前是否在小游戏的 Mac 环境中。
 * @returns 如果在小游戏的 Mac 环境中返回 true，否则返回 false。
 */
export function isMiniGameMac(): boolean {
    return isMiniGame() && getPlatform() === 'mac';
}

/**
 * 判断当前是否在小游戏的 HarmonyOS 环境中。
 * @returns 如果在小游戏的 HarmonyOS 环境中返回 true，否则返回 false。
 */
export function isMiniGameHarmonyOS(): boolean {
    return isMiniGame() && getPlatform() === 'ohos';
}