import { isMinaEnv } from '../../macros/env.ts';

export * from './target.ts';

/**
 * 获取窗口信息。
 * @returns
 */
export function getWindowInfo(): Pick<WechatMinigame.WindowInfo, 'pixelRatio' | 'screenHeight' | 'screenTop' | 'screenWidth' | 'windowHeight' | 'windowWidth'> {
    return isMinaEnv()
        ? wx.getWindowInfo()
        : {
            pixelRatio: devicePixelRatio,
            screenHeight: screen.height,
            screenTop,
            screenWidth: screen.width,
            windowHeight: innerHeight,
            windowWidth: innerWidth,
        };
}