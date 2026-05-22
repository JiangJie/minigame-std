import { Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { IS_MINA } from '../../../macros/env.ts';
import type { CreateVideoFrameSourceFromFileOptions, CreateVideoFrameSourceOptions, VideoFrameSource } from './defines.ts';
import {
    isVideoFrameSourceSupported as isMinaVideoFrameSourceSupported,
    createVideoFrameSource as minaCreateVideoFrameSource,
    createVideoFrameSourceFromFile as minaCreateVideoFrameSourceFromFile,
} from './mina.ts';
import {
    isVideoFrameSourceSupported as isWebVideoFrameSourceSupported,
    createVideoFrameSource as webCreateVideoFrameSource,
    createVideoFrameSourceFromFile as webCreateVideoFrameSourceFromFile,
} from './web.ts';

export * from './defines.ts';

// #region Exports

/**
 * 判断当前平台是否支持视频帧源。
 *
 * @returns 是否支持创建 VideoFrameSource。
 * @since 2.2.0
 * @example
 * ```ts
 * if (video.isVideoFrameSourceSupported()) {
 *     const sourceRes = video.createVideoFrameSource({ source: 'https://example.com/video.mp4' });
 * }
 * ```
 */
export function isVideoFrameSourceSupported(): boolean {
    return IS_MINA ? isMinaVideoFrameSourceSupported() : isWebVideoFrameSourceSupported();
}

/**
 * 创建视频帧源，用于将视频帧上传到 RenderTexture/WebGL 纹理。
 *
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源创建结果。
 * @since 2.2.0
 * @example
 * ```ts
 * const sourceRes = video.createVideoFrameSource({
 *     source: 'https://example.com/video.mp4',
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
    return IS_MINA
        ? minaCreateVideoFrameSource(options)
        : Ok(webCreateVideoFrameSource(options));
}

/**
 * 从本地文件创建视频帧源。
 *
 * 小游戏平台会直接使用文件路径；Web 平台会从 OPFS 读取文件并创建 Blob URL。
 *
 * @param filePath - 视频文件路径。
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源创建结果。
 * @since 2.2.0
 * @example
 * ```ts
 * const sourceRes = await video.createVideoFrameSourceFromFile('/videos/demo.mp4', {
 *     muted: true,
 * });
 * if (sourceRes.isOk()) {
 *     const source = sourceRes.unwrap();
 *     await source.play();
 * }
 * ```
 */
export function createVideoFrameSourceFromFile(filePath: string, options?: CreateVideoFrameSourceFromFileOptions): AsyncIOResult<VideoFrameSource> {
    return IS_MINA
        ? Promise.resolve(minaCreateVideoFrameSourceFromFile(filePath, options))
        : webCreateVideoFrameSourceFromFile(filePath, options);
}

// #endregion
