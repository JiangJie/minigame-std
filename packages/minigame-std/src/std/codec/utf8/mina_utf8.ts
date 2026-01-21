/**
 * @internal
 * 小游戏环境的编解码
 */

import { bufferSourceToAb } from '../../internal/mod.ts';
import { decodeUtf8Buffer, encodeUtf8Buffer } from './utf8.ts';

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
        ? new Uint8Array(wx.encode({
            data,
            format: FORMAT,
        }))
        : encodeUtf8Buffer(data);
}

/**
 * 将 BufferSource 数据解码为字符串。
 * @param data - 需要解码的 BufferSource。
 * @returns 解码后的字符串。
 */
export function decodeUtf8(data: BufferSource): string {
    // 兼容某些平台没有 `decode` 方法
    if (typeof wx.decode === 'function') {
        const ab = bufferSourceToAb(data);
        return wx.decode({
            data: ab,
            format: FORMAT,
        });
    }

    return decodeUtf8Buffer(data);
}
