import type { DataSource } from '../defines.ts';
import { dataSourceToBytes } from './helpers.ts';

/**
 * 将字符串或 BufferSource 编码为字节字符串，每个字节作为一个字符。
 * @param data - 需要编码的字符串或 BufferSource。
 * @returns 字节字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const str = encodeByteString(new Uint8Array([72, 101, 108, 108, 111]));
 * console.log(str); // 'Hello'
 *
 * const byteStr = encodeByteString('你好');
 * // 返回 UTF-8 编码后的字节字符串
 * ```
 */
export function encodeByteString(data: DataSource): string {
    return String.fromCharCode(...dataSourceToBytes(data));
}

/**
 * 将字节字符串解码为 Uint8Array，每个字符的 charCode 作为一个字节。
 * @param data - 需要解码的字节字符串。
 * @returns Uint8Array。
 * @since 1.0.0
 * @example
 * ```ts
 * const bytes = decodeByteString('Hello');
 * console.log(bytes); // Uint8Array [72, 101, 108, 108, 111]
 * ```
 */
export function decodeByteString(data: string): Uint8Array<ArrayBuffer> {
    const { length } = data;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = data.charCodeAt(i);
    }

    return bytes;
}
