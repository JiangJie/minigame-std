/**
 * @internal
 * Web环境的编解码
 */

import { Lazy } from 'happy-rusty';
import { decodeUtf8Buffer, encodeUtf8Buffer } from './utf8.ts';

// #region Internal Variables

const encoder = Lazy(() => new TextEncoder());
// 非法数据直接抛出错误
const decoder = Lazy(() => new TextDecoder('utf-8', { fatal: true }));

// #endregion

/**
 * 将字符串数据编码为 `Uint8Array`
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`
 */
export function encodeUtf8(data: string): Uint8Array<ArrayBuffer> {
    // 兼容可能没有 `TextEncoder` 的环境
    return typeof TextEncoder === 'function'
        ? encoder.force().encode(data)
        : encodeUtf8Buffer(data);
}

/**
 * 将二进制数据解码为字符串。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 */
export function decodeUtf8(data: BufferSource): string {
    // 兼容可能没有 `TextDecoder` 的环境
    return typeof TextDecoder === 'function'
        ? decoder.force().decode(data)
        : decodeUtf8Buffer(data);
}
