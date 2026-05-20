/**
 * @internal
 * Web 平台的视频帧源实现。
 */

import { readBlobFile } from 'happy-opfs';
import { Ok, tryAsyncResult, type AsyncIOResult, type AsyncVoidIOResult, type IOResult } from 'happy-rusty';
import type { CreateVideoFrameSourceFromFileOptions, CreateVideoFrameSourceOptions, ElementVideoFrame, VideoFrameSource, VideoFrameSourceFrame, VideoFrameSourceState } from './defines.ts';

// #region Exports

/**
 * 判断 Web 平台是否支持视频帧源。
 *
 * @returns 是否支持视频帧源。
 */
export function isVideoFrameSourceSupported(): boolean {
    return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

/**
 * 创建 Web 平台视频帧源。
 *
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源。
 */
export function createVideoFrameSource(options: CreateVideoFrameSourceOptions): VideoFrameSource {
    const video = document.createElement('video') as VideoElementWithFrameCallback;
    let state: VideoFrameSourceState = 'idle';
    let hasNewFrame = false;
    let frameCallbackId: number | undefined;
    let rafId: number | undefined;
    let lastFrameTime = -1;

    const frameListeners = new Set<FrameListener>();
    const endedListeners = new Set<EndedListener>();
    const errorListeners = new Set<ErrorListener>();

    const createFrame = (): ElementVideoFrame => ({
        kind: 'element',
        element: video,
        width: video.videoWidth || video.width,
        height: video.videoHeight || video.height,
        timestamp: video.currentTime,
        release(): void {
            return undefined;
        },
    });

    const emitFrame = () => {
        if (state === 'destroyed') return;
        hasNewFrame = true;
        const frame = createFrame();
        frameListeners.forEach(listener => listener(frame));
    };

    const requestNextFrame = () => {
        if (state === 'destroyed') return;

        if (typeof video.requestVideoFrameCallback === 'function') {
            frameCallbackId = video.requestVideoFrameCallback((_now, metadata) => {
                lastFrameTime = metadata.mediaTime;
                emitFrame();
                requestNextFrame();
            });
            return;
        }

        rafId = requestAnimationFrame(() => {
            if (video.currentTime !== lastFrameTime) {
                lastFrameTime = video.currentTime;
                emitFrame();
            }
            requestNextFrame();
        });
    };

    const cancelFrameRequest = () => {
        if (frameCallbackId != null && typeof video.cancelVideoFrameCallback === 'function') {
            video.cancelVideoFrameCallback(frameCallbackId);
            frameCallbackId = undefined;
        }
        if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = undefined;
        }
    };

    video.src = options.source;
    video.loop = options.loop ?? false;
    video.muted = options.muted ?? false;
    video.autoplay = options.autoplay ?? false;
    video.preload = 'auto';
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    if (options.crossOrigin !== undefined) {
        video.crossOrigin = options.crossOrigin;
    }
    if (options.width !== undefined) {
        video.width = options.width;
    }
    if (options.height !== undefined) {
        video.height = options.height;
    }

    video.style.display = 'none';
    document.body.appendChild(video);
    state = 'loading';

    video.addEventListener('loadedmetadata', () => {
        if (state !== 'destroyed') state = 'ready';
    });
    video.addEventListener('ended', () => {
        if (state !== 'destroyed') state = 'ended';
        endedListeners.forEach(listener => listener());
    });
    video.addEventListener('error', () => {
        if (state !== 'destroyed') state = 'error';
        const error = new Error(video.error?.message ?? 'Video frame source error');
        errorListeners.forEach(listener => listener(error));
    });

    requestNextFrame();

    const source: VideoFrameSource = {
        get state() {
            return state;
        },
        get currentTime() {
            return video.currentTime;
        },
        get duration() {
            return video.duration;
        },
        get width() {
            return video.videoWidth || video.width;
        },
        get height() {
            return video.videoHeight || video.height;
        },
        async play(): AsyncVoidIOResult {
            const result = await tryAsyncResult(video.play());
            return result.inspect(() => {
                state = 'playing';
            });
        },
        async pause(): AsyncVoidIOResult {
            return tryAsyncResult(() => {
                video.pause();
                state = 'paused';
            });
        },
        async stop(): AsyncVoidIOResult {
            return tryAsyncResult(() => {
                video.pause();
                video.currentTime = 0;
                state = 'paused';
            });
        },
        async seek(time: number): AsyncVoidIOResult {
            return tryAsyncResult(() => {
                video.currentTime = time;
            });
        },
        getFrame(): IOResult<VideoFrameSourceFrame | null> {
            if (!hasNewFrame || state === 'destroyed') {
                return Ok(null);
            }
            hasNewFrame = false;
            return Ok(createFrame());
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
            cancelFrameRequest();
            video.pause();
            video.src = '';
            video.load();
            video.remove();
            frameListeners.clear();
            endedListeners.clear();
            errorListeners.clear();
        },
    };

    if (options.autoplay) {
        void source.play();
    }

    return source;
}

/**
 * 从 Web 本地文件创建视频帧源。
 *
 * @param filePath - 视频文件路径。
 * @param options - 视频帧源创建选项。
 * @returns 视频帧源创建结果。
 */
export async function createVideoFrameSourceFromFile(filePath: string, options?: CreateVideoFrameSourceFromFileOptions): AsyncIOResult<VideoFrameSource> {
    const readRes = await readBlobFile(filePath);

    return readRes.andThen(blob => {
        const url = URL.createObjectURL(blob);
        const source = createVideoFrameSource({
            ...options,
            source: url,
        });
        const destroy = source.destroy.bind(source);

        source.destroy = () => {
            destroy();
            URL.revokeObjectURL(url);
        };

        return Ok(source);
    });
}

// #endregion

// #region Internal Types

type FrameListener = (frame: VideoFrameSourceFrame) => void;
type EndedListener = () => void;
type ErrorListener = (error: Error) => void;
type RequestVideoFrameCallback = (now: number, metadata: RequestVideoFrameCallbackMetadata) => void;
type VideoElementWithFrameCallback = HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: RequestVideoFrameCallback) => number;
    cancelVideoFrameCallback?: (id: number) => void;
};

interface RequestVideoFrameCallbackMetadata {
    mediaTime: number;
}

// #endregion
