/**
 * Web/小游戏 平台的音频播放实现。
 */

import { Once, tryAsyncResult, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { readFile } from '../fs/mod.ts';
import { ASYNC_RESULT_VOID, bufferSourceToAb } from '../internal/mod.ts';
import type { PlayOptions } from './audio_defines.ts';

// #region Internal Variables

/**
 * 缓存的 AudioContext。
 */
const audioContext = Once<AudioContext>();

// #endregion

/**
 * 获取缓存的 AudioContext。
 * @returns 返回缓存的 AudioContext。
 * @since 1.5.0
 * @example
 * ```ts
 * const context = audio.getGlobalAudioContext();
 * ```
 */
export function getGlobalAudioContext(): AudioContext {
    return audioContext.getOrInit(createWebAudioContext);
}

/**
 * 关闭缓存的 AudioContext。
 * @returns 返回一个 AsyncVoidIOResult。
 * @since 1.5.0
 * @example
 * ```ts
 * await audio.closeGlobalAudioContext();
 * ```
 */
export function closeGlobalAudioContext(): AsyncVoidIOResult {
    if (!audioContext.isInitialized()) {
        return ASYNC_RESULT_VOID;
    }

    // 重置 Once 以便下次重新创建
    return tryAsyncResult(audioContext.take().unwrap().close());
}

/**
 * 创建一个 AudioContext。
 * 如果要获取缓存的实例，请使用 `getGlobalAudioContext`。
 * @returns 返回一个 AudioContext实例。
 * @since 1.5.0
 * @example
 * ```ts
 * const context = audio.createWebAudioContext();
 * ```
 */
export function createWebAudioContext(): AudioContext {
    return isMinaEnv()
        // 两者 API 基本兼容
        ? (wx.createWebAudioContext() as unknown as AudioContext)
        : new AudioContext();
}

/**
 * 播放一个 AudioBuffer。
 * @param buffer - 解码后的 AudioBuffer。
 * @param options - 播放选项。
 * @returns 正在播放的 AudioBufferSourceNode。
 * @since 1.5.0
 * @example
 * ```ts
 * const source = audio.playWebAudioFromAudioBuffer(audioBuffer, { loop: true });
 * ```
 */
export function playWebAudioFromAudioBuffer(buffer: AudioBuffer, options?: PlayOptions): AudioBufferSourceNode {
    const {
        loop = false,
        autoDisconnect = true,
    } = options ?? {};

    const context = getGlobalAudioContext();
    const source = context.createBufferSource();

    source.buffer = buffer;
    source.loop = loop;
    source.connect(context.destination);

    if (autoDisconnect) {
        source.onended = () => {
            source.disconnect();
        };
    }

    source.start();

    return source;
}

/**
 * 使用 Buffer 进行解码播放。
 * @param buffer - 需要解码的 Buffer。
 * @param options - 播放选项。
 * @returns 正在播放的 AudioBufferSourceNode。
 * @since 1.5.0
 * @example
 * ```ts
 * const source = await audio.playWebAudioFromBufferSource(buffer);
 * ```
 */
export async function playWebAudioFromBufferSource(buffer: BufferSource, options?: PlayOptions): AsyncIOResult<AudioBufferSourceNode> {
    const context = getGlobalAudioContext();
    const audioBufferRes = await tryAsyncResult(() => context.decodeAudioData(bufferSourceToAb(buffer)));

    return audioBufferRes.map(audioBuffer => playWebAudioFromAudioBuffer(audioBuffer, options));
}

/**
 * 读取文件并播放。
 * @param filePath - 文件路径。
 * @param options - 播放选项。
 * @returns 正在播放的 AudioBufferSourceNode。
 * @since 1.5.0
 * @example
 * ```ts
 * const result = await audio.playWebAudioFromFile('/path/to/audio.mp3');
 * if (result.isOk()) {
 *     const source = result.unwrap();
 * }
 * ```
 */
export async function playWebAudioFromFile(filePath: string, options?: PlayOptions): AsyncIOResult<AudioBufferSourceNode> {
    const bufferRes = await readFile(filePath);

    return bufferRes.andThenAsync(buffer => playWebAudioFromBufferSource(buffer, options));
}
