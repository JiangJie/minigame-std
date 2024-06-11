import { getDeviceInfo } from './device.ts';

export type TargetType = 'minigame' | 'web';

/**
 * 获取当前的平台类型。
 * @returns 返回当前的运行环境类型，可能是 'minigame' 或 'web'。
 */
export function getTargetType(): TargetType {
    return 'wx' in globalThis ? 'minigame' : 'web';
}

/**
 * 判断当前是否在小游戏环境中。
 * @returns 如果在小游戏环境中返回 true，否则返回 false。
 */
export function isMiniGame(): boolean {
    return getTargetType() === 'minigame';
}

/**
 * 判断当前是否在小游戏的运行时环境中。
 * @returns 如果在小游戏的运行时环境中返回 true，否则返回 false。
 */
export function isMiniGameRuntime(): boolean {
    return isMiniGame() && getDeviceInfo().platform !== 'devtools';
}

/**
 * 判断当前是否在小游戏的开发者工具中。
 * @returns 如果在小游戏的开发者工具中返回 true，否则返回 false。
 */
export function isMiniGameDevtools(): boolean {
    return isMiniGame() && getDeviceInfo().platform === 'devtools';
}

/**
 * 判断当前是否在 Web 环境中。
 * @returns 如果在 Web 现境中返回 true，否则返回 false。
 */
export function isWeb(): boolean {
    return getTargetType() === 'web';
}