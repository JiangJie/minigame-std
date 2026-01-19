import { isMinaEnv } from '../../macros/env.ts';
import { createVideo as webCreateVideo } from './web_video.ts';

/**
 * 创建视频播放器。
 * @param options - 视频配置选项。
 * @returns Video对象。
 * @example
 * ```ts
 * const video = createVideo({
 *     src: 'https://example.com/video.mp4',
 *     width: 640,
 *     height: 360,
 *     autoplay: false,
 * });
 * video.play();
 * // 销毁视频
 * video.destroy();
 * ```
 */
export function createVideo(options: WechatMinigame.CreateVideoOption): WechatMinigame.Video {
    return (isMinaEnv() ? wx.createVideo : webCreateVideo)(options);
}
