/**
 * @internal
 * 小游戏环境宏模块。
 */

/**
 * 小游戏环境宏。
 *
 * 可通过打包工具在build时修改，如esbuild、webpack等。
 */
declare const __MINIGAME_STD_MINA__ = false;

/**
 * 判断当前环境是否为小游戏环境。
 * @returns 如果在小游戏环境中返回 true，否则返回 false。
 */
export function isMinaEnv(): boolean {
    return __MINIGAME_STD_MINA__;
}
