/**
 * 在 Uint8Array 和 base64 编码字符串之间进行编解码。
 *
 * - encodeBase64: 全平台使用纯 JS 实现，因为原生 btoa 存在 Latin1 限制且需要额外转换，性能较差
 * - decodeBase64: 支持 atob 时使用 atob，否则使用纯 JS 实现
 *
 * 源自 @std/encoding/base64 和 https://github.com/cross-org/base64
 */

import { Lazy } from 'happy-rusty';
import type { DataSource } from '../defines.ts';
import { decodeByteString } from './bytestring.ts';
import { dataSourceToBytes } from './helpers.ts';

// #region Internal Variables

/**
 * 包含标准 base64 字符的字符串。
 */
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * 标准 base64 字符数组。
 */
const base64abc = chars.split('');

/**
 * 标准 base64 字符查找表（延迟初始化）。
 */
const lookup = Lazy(() => {
    const bytes = new Uint8Array(256);

    for (let i = 0; i < base64abc.length; i++) {
        bytes[base64abc[i].charCodeAt(0)] = i;
    }

    return bytes;
});

// #endregion

/**
 * 将 DataSource（字符串或 BufferSource）转换为 Base64 编码的字符串。
 *
 * 全平台使用纯 JS 实现，避免 Latin1 限制和额外转换开销。
 *
 * @param data - 需要编码的数据，可以是字符串、ArrayBuffer、TypedArray 或 DataView。
 * @returns Base64 编码的字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * // 字符串输入
 * const encoded = encodeBase64('Hello, World!');
 * console.log(encoded); // 'SGVsbG8sIFdvcmxkIQ=='
 *
 * // BufferSource 输入
 * const buffer = new Uint8Array([72, 101, 108, 108, 111]);
 * const base64 = encodeBase64(buffer);
 * console.log(base64); // 'SGVsbG8='
 * ```
 */
export function encodeBase64(data: DataSource): string {
    let result = '';

    const bytes = dataSourceToBytes(data);
    const { byteLength } = bytes;

    let i = 2;
    for (; i < byteLength; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3f];
    }

    if (i === byteLength + 1) {
        // 还有 1 个字节待写入
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += '==';
    }

    if (i === byteLength) {
        // 还有 2 个字节待写入
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0f) << 2];
        result += '=';
    }

    return result;
}

/**
 * 将 Base64 编码的字符串转换为 Uint8Array。
 *
 * 在支持 atob 的环境（浏览器）下使用原生实现以获得更好的性能，
 * 在不支持的环境下使用纯 JS 实现。
 *
 * @param data - Base64 编码的字符串。
 * @returns 解码后的 Uint8Array。
 * @since 1.0.0
 * @example
 * ```ts
 * const buffer = decodeBase64('SGVsbG8=');
 * console.log(buffer); // Uint8Array [72, 101, 108, 108, 111]
 *
 * // 解码为字符串
 * const text = new TextDecoder().decode(decodeBase64('SGVsbG8sIFdvcmxkIQ=='));
 * console.log(text); // 'Hello, World!'
 * ```
 */
export const decodeBase64: (data: string) => Uint8Array<ArrayBuffer> = typeof atob === 'function'
    ? decodeBase64Native
    : decodeBase64Pure;

// #region Internal Functions

/**
 * 原生实现：使用 atob 将 Base64 编码的字符串转换为 Uint8Array。
 */
function decodeBase64Native(data: string): Uint8Array<ArrayBuffer> {
    return decodeByteString(atob(data));
}

/**
 * 纯 JS 实现：将 Base64 编码的字符串转换为 Uint8Array。
 */
function decodeBase64Pure(data: string): Uint8Array<ArrayBuffer> {
    const { length } = data;

    let byteLength = length * 0.75;

    if (data[length - 1] === '=') {
        byteLength--;
        if (data[length - 2] === '=') {
            byteLength--;
        }
    }

    const bytes = new Uint8Array(byteLength);
    const table = lookup.force();

    let pos = 0;
    for (let i = 0; i < length; i += 4) {
        const encoded1 = table[data.charCodeAt(i)];
        const encoded2 = table[data.charCodeAt(i + 1)];
        const encoded3 = table[data.charCodeAt(i + 2)];
        const encoded4 = table[data.charCodeAt(i + 3)];

        bytes[pos++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[pos++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[pos++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return bytes;
}

// #endregion