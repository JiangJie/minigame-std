import { getDeviceInfo } from './device.ts';

export type TargetType = 'minigame' | 'web';

/**
 * 获取运行平台类型
 *
 * @returns {TargetType}
 */
export function getTargetType(): TargetType {
    return 'wx' in globalThis ? 'minigame' : 'web';
}

/**
 * 判断是否在小游戏环境
 *
 * @returns {boolean} true - 小游戏; false - 其他
 */
export function isMiniGame(): boolean {
    return getTargetType() === 'minigame';
}

/**
 * 判断是否在小游戏真机环境
 * @returns {boolean} true - 小游戏真机环境; false - 其他
 */
export function isMiniGameRuntime(): boolean {
    return isMiniGame() && getDeviceInfo().platform !== 'devtools';
}

/**
 * 判断是否在小游戏开发者工具环境
 * @returns {boolean} true - 小游戏开发者工具; false - 其他
 */
export function isMiniGameDevtools(): boolean {
    return isMiniGame() && getDeviceInfo().platform === 'devtools';
}

/**
 * 判断是否在浏览器环境
 *
 * @returns {boolean} true - 浏览器; false - 其他
 */
export function isWeb(): boolean {
    return getTargetType() === 'web';
}