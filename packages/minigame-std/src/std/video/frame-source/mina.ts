/**
 * @internal
 * 小游戏平台的视频帧源实现。
 */

import { Err, Ok, tryAsyncResult, type AsyncVoidIOResult, type IOResult } from 'happy-rusty';
import { validateReadablePath } from '../../fs/mina_fs_shared.ts';
import type { CreateVideoFrameSourceFromFileOptions, CreateVideoFrameSourceOptions, PixelVideoFrame, VideoFrameSource, VideoFrameSourceFrame, VideoFrameSourceState } from './defines.ts';

// #region Exports

/**
 * 判断小游戏平台是否支持视频帧源。
 *
 * @returns 是否支持视频帧源。
 */
export function isVideoFrameSourceSupported(): boolean {
    return typeof wx.createVideoDecoder === 'function';
}

/**
 * 创建小游戏平台视频帧源。
 *
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源创建结果。
 */
export function createVideoFrameSource(options: CreateVideoFrameSourceOptions): IOResult<VideoFrameSource> {
    if (!isVideoFrameSourceSupported()) {
        return Err(new Error('VideoFrameSource is not supported on this minigame platform'));
    }

    const decoder = wx.createVideoDecoder();
    let state: VideoFrameSourceState = 'idle';
    let lastFrame: PixelVideoFrame | null = null;
    let currentTime = 0;
    let width = options.width ?? 0;
    let height = options.height ?? 0;

    const frameListeners = new Set<FrameListener>();
    const endedListeners = new Set<EndedListener>();
    const errorListeners = new Set<ErrorListener>();

    const pullFrame = (): PixelVideoFrame | null => {
        const frameData = decoder.getFrameData() as WechatMinigame.FrameDataOptions | null;
        if (frameData == null) return null;

        const frame = toPixelFrame(frameData);
        currentTime = frame.timestamp;
        width = frame.width;
        height = frame.height;
        return frame;
    };

    const handleEnded = () => {
        if (state !== 'destroyed') state = 'ended';
        endedListeners.forEach(listener => listener());
    };

    decoder.on('ended', handleEnded);

    return Ok({
        get state() {
            return state;
        },
        get currentTime() {
            return currentTime;
        },
        get duration() {
            return Number.NaN;
        },
        get width() {
            return width;
        },
        get height() {
            return height;
        },
        async play(): AsyncVoidIOResult {
            const result = await tryAsyncResult(decoder.start({ source: options.source }));
            return result.inspect(() => {
                state = 'playing';
            });
        },
        async pause(): AsyncVoidIOResult {
            const result = await tryAsyncResult(() => decoder.stop());
            return result.inspect(() => {
                state = 'paused';
            });
        },
        async stop(): AsyncVoidIOResult {
            const result = await tryAsyncResult(() => decoder.stop());
            return result.inspect(() => {
                state = 'paused';
                currentTime = 0;
            });
        },
        async seek(time: number): AsyncVoidIOResult {
            // wx.VideoDecoder.seek 的 position 单位为 ms，公开 API 单位为秒，需转换
            const result = await tryAsyncResult(() => decoder.seek(time * 1000));
            return result.inspect(() => {
                currentTime = time;
            });
        },
        getFrame(): IOResult<VideoFrameSourceFrame | null> {
            lastFrame = pullFrame();
            if (lastFrame != null) {
                frameListeners.forEach(listener => listener(lastFrame as PixelVideoFrame));
            }
            const frame = lastFrame;
            lastFrame = null;
            return Ok(frame);
        },
        onFrame(listener: FrameListener): void {
            frameListeners.add(listener);
        },
        offFrame(listener?: FrameListener): void {
            if (listener) frameListeners.delete(listener);
            else frameListeners.clear();
        },
        onEnded(listener: EndedListener): void {
            endedListeners.add(listener);
        },
        offEnded(listener?: EndedListener): void {
            if (listener) endedListeners.delete(listener);
            else endedListeners.clear();
        },
        onError(listener: ErrorListener): void {
            errorListeners.add(listener);
        },
        offError(listener?: ErrorListener): void {
            if (listener) errorListeners.delete(listener);
            else errorListeners.clear();
        },
        destroy(): void {
            if (state === 'destroyed') return;
            state = 'destroyed';
            decoder.off('ended', handleEnded);
            void tryAsyncResult(decoder.remove());
            frameListeners.clear();
            endedListeners.clear();
            errorListeners.clear();
        },
    });
}

/**
 * 从小游戏本地文件创建视频帧源。
 *
 * @param filePath - 视频文件路径。
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源创建结果。
 */
export function createVideoFrameSourceFromFile(filePath: string, options?: CreateVideoFrameSourceFromFileOptions): IOResult<VideoFrameSource> {
    return validateReadablePath(filePath)
        .andThen(source => createVideoFrameSource({
            ...options,
            source,
        }));
}

// #endregion

// #region Internal Types

type FrameListener = (frame: VideoFrameSourceFrame) => void;
type EndedListener = () => void;
type ErrorListener = (error: Error) => void;

// #endregion

// #region Internal Functions

function toPixelFrame(frameData: WechatMinigame.FrameDataOptions): PixelVideoFrame {
    return {
        kind: 'pixels',
        format: 'rgba',
        data: new Uint8Array(frameData.data),
        width: frameData.width,
        height: frameData.height,
        timestamp: frameData.pkPts / 1000,
        release(): void {
            return undefined;
        },
    };
}

// #endregion
