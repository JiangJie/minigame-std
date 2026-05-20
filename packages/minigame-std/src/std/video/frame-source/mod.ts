import { Ok, type IOResult } from 'happy-rusty';
import { isMinaEnv } from '../../../macros/env.ts';
import type { CreateVideoFrameSourceOptions, VideoFrameSource } from './defines.ts';
import {
    createVideoFrameSource as minaCreateVideoFrameSource,
    isVideoFrameSourceSupported as isMinaVideoFrameSourceSupported,
} from './mina.ts';
import {
    createVideoFrameSource as webCreateVideoFrameSource,
    isVideoFrameSourceSupported as isWebVideoFrameSourceSupported,
} from './web.ts';

export * from './defines.ts';

// #region Exports

/**
 * 判断当前平台是否支持视频帧源。
 *
 * @returns 是否支持创建 VideoFrameSource。
 * @since unreleased
 * @example
 * ```ts
 * if (video.isVideoFrameSourceSupported()) {
 *     const sourceRes = video.createVideoFrameSource({ src: 'https://example.com/video.mp4' });
 * }
 * ```
 */
export function isVideoFrameSourceSupported(): boolean {
    return isMinaEnv() ? isMinaVideoFrameSourceSupported() : isWebVideoFrameSourceSupported();
}

/**
 * 创建视频帧源，用于将视频帧上传到 RenderTexture/WebGL 纹理。
 *
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源创建结果。
 * @since unreleased
 * @example
 * ```ts
 * const sourceRes = video.createVideoFrameSource({
 *     src: 'https://example.com/video.mp4',
 *     muted: true,
 *     loop: true,
 * });
 * if (sourceRes.isOk()) {
 *     const source = sourceRes.unwrap();
 *     await source.play();
 * }
 * ```
 */
export function createVideoFrameSource(options: CreateVideoFrameSourceOptions): IOResult<VideoFrameSource> {
    return isMinaEnv()
        ? minaCreateVideoFrameSource(options)
        : Ok(webCreateVideoFrameSource(options));
}

// #endregion
