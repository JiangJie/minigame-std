/**
 * 平台类型，Web 或者小游戏。
 */
export type TargetType = 'minigame' | 'web';

/**
 * 获取当前的平台类型。
 * @returns 返回当前的运行环境类型，可能是 'minigame' 或 'web'。
 */
export function getTargetType(): TargetType {
    return 'wx' in globalThis ? 'minigame' : 'web';
}

/**
 * 判断当前是否在 Web 环境中。
 * @returns 如果在 Web 现境中返回 true，否则返回 false。
 */
export function isWeb(): boolean {
    return getTargetType() === 'web';
}

/**
 * 判断当前是否在小游戏环境中。
 * @returns 如果在小游戏环境中返回 true，否则返回 false。
 */
export function isMiniGame(): boolean {
    return getTargetType() === 'minigame';
}