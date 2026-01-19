/**
 * 播放音频的选项。
 * @since 1.5.0
 * @example
 * ```ts
 * import { audio } from 'minigame-std';
 *
 * // 循环播放
 * const source = audio.playWebAudioFromAudioBuffer(buffer, { loop: true });
 *
 * // 禁用自动断开连接
 * const source2 = audio.playWebAudioFromAudioBuffer(buffer, { autoDisconnect: false });
 * ```
 */
export interface PlayOptions {
    /**
     * 是否循环播放。
     * @defaultValue `false`
     */
    loop?: boolean;

    /**
     * 播放完后是否自动调用 `source.disconnect`。
     * @defaultValue `true`
     */
    autoDisconnect?: boolean;
}