/**
 * @fileoverview 在 Uint8Array 和 base64 编码字符串之间进行编解码。
 *
 * 源自 @std/encoding/base64 和 https://github.com/cross-org/base64
 */

import { Lazy } from 'happy-rusty';
import { bufferSource2U8a } from '../utils/mod.ts';

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
    const lookupTemp = new Uint8Array(256); // base64abc.length * 4

    for (let i = 0; i < base64abc.length; i++) {
        lookupTemp[base64abc[i].charCodeAt(0)] = i;
    }

    return lookupTemp;
});

/**
 * 将 BufferSource 转换为 Base64 编码的字符串。
 * @param data - 需要编码的数据，可以是 ArrayBuffer、TypedArray 或 DataView。
 * @returns Base64 编码的字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const buffer = new Uint8Array([72, 101, 108, 108, 111]);
 * const base64 = base64FromBuffer(buffer);
 * console.log(base64); // 'SGVsbG8='
 * ```
 */
export function base64FromBuffer(data: BufferSource): string {
    let result = '';

    const u8a = bufferSource2U8a(data);

    const len = u8a.length;
    let i: number;

    for (i = 2; i < len; i += 3) {
        result += base64abc[(u8a[i - 2]) >> 2];
        result += base64abc[
            (((u8a[i - 2]) & 0x03) << 4)
            | ((u8a[i - 1]) >> 4)
        ];
        result += base64abc[
            (((u8a[i - 1]) & 0x0f) << 2)
            | ((u8a[i]) >> 6)
        ];
        result += base64abc[(u8a[i]) & 0x3f];
    }

    if (i === len + 1) {
        // 还有 1 个字节待写入
        result += base64abc[(u8a[i - 2]) >> 2];
        result += base64abc[((u8a[i - 2]) & 0x03) << 4];
        result += '==';
    }

    if (i === len) {
        // 还有 2 个字节待写入
        result += base64abc[(u8a[i - 2]) >> 2];
        result += base64abc[
            (((u8a[i - 2]) & 0x03) << 4)
            | ((u8a[i - 1]) >> 4)
        ];
        result += base64abc[((u8a[i - 1]) & 0x0f) << 2];
        result += '=';
    }

    return result;
}

/**
 * 将 Base64 编码的字符串转换为 Uint8Array。
 * @param data - Base64 编码的字符串。
 * @returns 解码后的 Uint8Array。
 * @since 1.0.0
 * @example
 * ```ts
 * const buffer = base64ToBuffer('SGVsbG8=');
 * console.log(buffer); // Uint8Array [72, 101, 108, 108, 111]
 * ```
 */
export function base64ToBuffer(data: string): Uint8Array<ArrayBuffer> {
    const len = data.length;

    let bufferLength = len * 0.75;

    if (data[len - 1] === '=') {
        bufferLength--;
        if (data[len - 2] === '=') {
            bufferLength--;
        }
    }

    const u8a = new Uint8Array(bufferLength);

    let pos = 0;

    const table = lookup.force();

    for (let i = 0; i < len; i += 4) {
        const encoded1 = table[data.charCodeAt(i)];
        const encoded2 = table[data.charCodeAt(i + 1)];
        const encoded3 = table[data.charCodeAt(i + 2)];
        const encoded4 = table[data.charCodeAt(i + 3)];

        u8a[pos++] = (encoded1 << 2) | (encoded2 >> 4);
        u8a[pos++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        u8a[pos++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return u8a;
}