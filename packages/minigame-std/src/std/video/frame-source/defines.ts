import type { AsyncVoidIOResult, IOResult } from 'happy-rusty';

/**
 * 视频帧源创建选项。
 *
 * @since unreleased
 * @example
 * ```ts
 * import { video } from 'minigame-std';
 *
 * const source = video.createVideoFrameSource({
 *     source: 'https://example.com/video.mp4',
 *     muted: true,
 *     loop: true,
 * });
 * ```
 */
export interface CreateVideoFrameSourceOptions {
    /**
     * 视频资源。
     *
     * 小游戏平台支持本地文件路径和 URL；Web 平台只支持 URL，包括通过 `URL.createObjectURL` 创建的 Blob URL。
     */
    source: string;

    /**
     * 是否循环播放。
     * @defaultValue `false`
     */
    loop?: boolean;

    /**
     * 是否静音。
     * Web 平台通常需要静音才能自动播放。
     * @defaultValue `false`
     */
    muted?: boolean;

    /**
     * 是否自动开始播放/解码。
     * @defaultValue `false`
     */
    autoplay?: boolean;

    /**
     * Web 平台跨域配置。
     * 跨域视频上传 WebGL texture 时通常需要设置为 `anonymous`，且服务端返回 CORS header。
     */
    crossOrigin?: '' | 'anonymous' | 'use-credentials';

    /**
     * 期望宽度，仅作为平台创建 hint。
     */
    width?: number;

    /**
     * 期望高度，仅作为平台创建 hint。
     */
    height?: number;
}

/**
 * 从文件创建视频帧源的选项。
 *
 * @since unreleased
 */
export type CreateVideoFrameSourceFromFileOptions = Omit<CreateVideoFrameSourceOptions, 'source' | 'crossOrigin'>;

/**
 * 视频帧源状态。
 *
 * @since unreleased
 */
export type VideoFrameSourceState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error' | 'destroyed';

/**
 * 视频帧基础信息。
 *
 * @since unreleased
 */
export interface BaseVideoFrame {
    /**
     * 视频宽度。
     */
    width: number;

    /**
     * 视频高度。
     */
    height: number;

    /**
     * 当前帧时间，单位：秒。
     */
    timestamp: number;

    /**
     * 释放当前帧资源。
     */
    release(): void;
}

/**
 * 像素数据视频帧。
 *
 * @since unreleased
 */
export interface PixelVideoFrame extends BaseVideoFrame {
    /**
     * 帧类型。
     */
    kind: 'pixels';

    /**
     * 像素格式。
     */
    format: 'rgba';

    /**
     * RGBA 像素数据。
     */
    data: Uint8Array<ArrayBuffer>;
}

/**
 * HTMLVideoElement 视频帧。
 *
 * @since unreleased
 */
export interface ElementVideoFrame extends BaseVideoFrame {
    /**
     * 帧类型。
     */
    kind: 'element';

    /**
     * 可直接作为 WebGL TexImageSource 使用的视频元素。
     */
    element: HTMLVideoElement;
}

/**
 * 视频帧源返回的帧类型。
 *
 * @since unreleased
 */
export type VideoFrameSourceFrame = PixelVideoFrame | ElementVideoFrame;

/**
 * 视频帧源，用于游戏渲染循环主动获取视频帧并上传到 RenderTexture/WebGL。
 *
 * @since unreleased
 * @example
 * ```ts
 * const sourceRes = video.createVideoFrameSource({ source: 'https://example.com/video.mp4' });
 * if (sourceRes.isOk()) {
 *     const source = sourceRes.unwrap();
 *     await source.play();
 *     const frameRes = source.getFrame();
 * }
 * ```
 */
export interface VideoFrameSource {
    /**
     * 当前状态。
     */
    readonly state: VideoFrameSourceState;

    /**
     * 当前播放位置，单位：秒。
     */
    readonly currentTime: number;

    /**
     * 视频总时长，未知时返回 `NaN`。
     */
    readonly duration: number;

    /**
     * 当前视频宽度。
     */
    readonly width: number;

    /**
     * 当前视频高度。
     */
    readonly height: number;

    /**
     * 开始播放/解码。
     */
    play(): AsyncVoidIOResult;

    /**
     * 暂停播放/解码。
     */
    pause(): AsyncVoidIOResult;

    /**
     * 停止播放/解码，并回到起始位置。
     */
    stop(): AsyncVoidIOResult;

    /**
     * 跳转到指定时间。
     *
     * @param time - 时间，单位：秒。
     */
    seek(time: number): AsyncVoidIOResult;

    /**
     * 获取当前可用帧。没有新帧时返回 `Ok(null)`。
     */
    getFrame(): IOResult<VideoFrameSourceFrame | null>;

    /**
     * 监听新帧。
     */
    onFrame(listener: (frame: VideoFrameSourceFrame) => void): void;

    /**
     * 取消监听新帧。
     */
    offFrame(listener?: (frame: VideoFrameSourceFrame) => void): void;

    /**
     * 监听播放结束。
     */
    onEnded(listener: () => void): void;

    /**
     * 取消监听播放结束。
     */
    offEnded(listener?: () => void): void;

    /**
     * 监听错误。
     */
    onError(listener: (error: Error) => void): void;

    /**
     * 取消监听错误。
     */
    offError(listener?: (error: Error) => void): void;

    /**
     * 销毁底层资源。
     */
    destroy(): void;
}
