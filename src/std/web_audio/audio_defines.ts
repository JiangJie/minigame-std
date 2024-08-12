/**
 * 播放音频的选项。
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