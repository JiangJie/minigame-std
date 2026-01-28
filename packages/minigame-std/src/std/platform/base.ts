/**
 * 平台类型，Web 或者小游戏。
 * @since 1.0.0
 * @example
 * ```ts
 * import { platform, type TargetType } from 'minigame-std';
 *
 * const type: TargetType = platform.getTargetType();
 * console.log(type); // 'minigame' 或 'web'
 * ```
 */
export type TargetType = 'minigame' | 'web';

/**
 * 获取当前的平台类型。
 * @returns 返回当前的运行环境类型，可能是 'minigame' 或 'web'。
 * @since 1.0.0
 * @example
 * ```ts
 * const type = getTargetType();
 * console.log('当前平台:', type); // 'minigame' 或 'web'
 * ```
 */
export function getTargetType(): TargetType {
    return 'wx' in globalThis ? 'minigame' : 'web';
}

/**
 * 判断当前是否在 Web 环境中。
 * @returns 如果在 Web 环境中返回 true，否则返回 false。
 * @since 1.0.0
 * @example
 * ```ts
 * if (isWeb()) {
 *     console.log('当前在浏览器环境');
 * }
 * ```
 */
export function isWeb(): boolean {
    return getTargetType() === 'web';
}

/**
 * 判断当前是否在小游戏环境中。
 * @returns 如果在小游戏环境中返回 true，否则返回 false。
 * @since 1.0.0
 * @example
 * ```ts
 * if (isMiniGame()) {
 *     console.log('当前在小游戏环境');
 * }
 * ```
 */
export function isMiniGame(): boolean {
    return getTargetType() === 'minigame';
}