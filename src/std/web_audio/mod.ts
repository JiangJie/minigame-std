import { Err, Ok, RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { readFile } from '../fs/mod.ts';
import type { PlayOptions } from './audio_defines.ts';

export * from './audio_defines.ts';

/**
 * Cache AudioContext.
 */
let audioContext: AudioContext | null;

/**
 * 获取缓存的 AudioContext。
 * @returns 返回缓存的 AudioContext。
 */
export function getGlobalAudioContext(): AudioContext {
    audioContext ??= createWebAudioContext();
    return audioContext;
}

/**
 * 关闭缓存的 AudioContext。
 * @returns 返回一个 AsyncVoidIOResult。
 */
export async function closeGlobalAudioContext(): AsyncVoidIOResult {
    try {
        await audioContext?.close();
        audioContext = null;

        return RESULT_VOID;
    } catch (e) {
        return Err(e as DOMException);
    }
}

/**
 * 创建一个 AudioContext。
 * 如果要获取缓存的实例，请使用 `getGlobalAudioContext`。
 * @returns 返回一个 AudioContext实例。
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
 * 使用 ArrayBuffer 进行解码播放。
 * @param buffer - 需要解码的 ArrayBuffer。
 * @param options - 播放选项。
 * @returns 正在播放的 AudioBufferSourceNode。
 */
export async function playWebAudioFromArrayBuffer(buffer: ArrayBuffer, options?: PlayOptions): Promise<AudioBufferSourceNode> {
    const context = getGlobalAudioContext();
    const audioBuffer = await context.decodeAudioData(buffer);

    return playWebAudioFromAudioBuffer(audioBuffer, options);
}

/**
 * 读取文件并播放。
 * @param filePath - 文件路径。
 * @param options - 播放选项。
 * @returns 正在播放的 AudioBufferSourceNode。
 */
export async function playWebAudioFromFile(filePath: string, options?: PlayOptions): AsyncIOResult<AudioBufferSourceNode> {
    return (await readFile(filePath)).andThenAsync(async buffer => {
        return Ok(await playWebAudioFromArrayBuffer(buffer, options));
    })
}