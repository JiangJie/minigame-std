/**
 * @internal
 * 小游戏环境宏模块。
 */

/**
 * 小游戏环境宏。
 *
 * 可通过打包工具在 build 时修改，如 esbuild webpack vite 等。
 */
declare const __MINIGAME_STD_MINA__: boolean;

/**
 * 如果在小游戏环境中返回 true，否则返回 false。
 */
export const IS_MINA = __MINIGAME_STD_MINA__;
