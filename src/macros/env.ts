/**
 * 小游戏环境
 *
 * 可通过打包工具在build时修改，如esbuild、webpack等。
 */
declare const __MINIGAME_STD_MINA__ = false;

/**
 * 返回是否小游戏环境
 * @returns
 */
export function isMinaEnv(): boolean {
    return __MINIGAME_STD_MINA__;
}