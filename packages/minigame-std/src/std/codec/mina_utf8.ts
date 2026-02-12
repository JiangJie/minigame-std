/**
 * 小游戏环境的 UTF-8 编解码
 *
 * @internal
 */

import { decodeUtf8 as webDecodeUtf8, encodeUtf8 as webEncodeUtf8 } from 'happy-codec';
import { bufferSourceToAb } from '../internal/mod.ts';

// #region Internal Variables

const FORMAT = 'utf8' as const;

// #endregion

/**
 * 将字符串数据编码为 Uint8Array。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 Uint8Array。
 */
export function encodeUtf8(data: string): Uint8Array<ArrayBuffer> {
    // 兼容某些平台没有 `encode` 方法
    return typeof wx.encode === 'function'
        ? new Uint8Array(
            wx.encode({
                data,
                format: FORMAT,
            }),
        )
        : webEncodeUtf8(data);
}

/**
 * 将 BufferSource 数据解码为字符串。
 *
 * 当 `options` 为默认值（`fatal = false` 且 `ignoreBOM = false`）时，优先使用 `wx.decode` 以获得更好的性能；
 * 否则回退到 `happy-codec` 实现以支持完整的 `TextDecoderOptions` 功能。
 *
 * @param data - 需要解码的 BufferSource。
 * @param options - 解码选项（可选）。
 * @param options.fatal - 如果为 `true`，遇到无效 UTF-8 序列会抛出异常；默认为 `false`，使用 U+FFFD 替换。
 * @param options.ignoreBOM - 如果为 `true`，保留 BOM；默认为 `false`，自动删除 BOM。
 * @returns 解码后的字符串。
 */
export function decodeUtf8(data: BufferSource, options?: TextDecoderOptions): string {
    const {
        fatal = false,
        ignoreBOM = false,
    } = options ?? {};

    // `wx.decode` 的行为和 `fatal = false(不会报错) && ignoreBOM = false(丢弃BOM)` 的行为一致
    // 兼容某些平台没有 `decode` 方法
    if (!fatal && !ignoreBOM && typeof wx.decode === 'function') {
        const ab = bufferSourceToAb(data);
        return wx.decode({
            data: ab,
            format: FORMAT,
        });
    }

    return webDecodeUtf8(data, options);
}
