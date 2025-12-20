import { isMinaEnv } from '../../macros/env.ts';

export * from './base.ts';
export * from './device.ts';
export * from './target.ts';

/**
 * 获取窗口信息。
 * @returns 包含窗口和屏幕相关信息的对象。
 * @example
 * ```ts
 * const info = getWindowInfo();
 * console.log('窗口尺寸:', info.windowWidth, 'x', info.windowHeight);
 * console.log('屏幕尺寸:', info.screenWidth, 'x', info.screenHeight);
 * console.log('设备像素比:', info.pixelRatio);
 * ```
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