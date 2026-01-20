import { isMinaEnv } from '../../macros/env.ts';
import type { DataSource } from '../defines.ts';
import { bufferSourceToAb, bufferSourceToBytes } from '../internal/mod.ts';
import { textDecode as minaTextDecode, textEncode as minaTextEncode } from './mina_codec.ts';
import { textDecode as webTextDecode, textEncode as webTextEncode } from './web_codec.ts';

/**
 * 将字符串数据编码为 `Uint8Array`（UTF-8 编码）。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`。
 * @since 1.0.0
 * @example
 * ```ts
 * const encoded = textEncode('你好');
 * console.log(encoded); // Uint8Array [228, 189, 160, 229, 165, 189]
 * ```
 */
export function textEncode(data: string): Uint8Array<ArrayBuffer> {
    return isMinaEnv()
        ? bufferSourceToBytes(minaTextEncode(data))
        : webTextEncode(data);
}

/**
 * 将二进制数据解码为字符串（UTF-8 解码）。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const decoded = textDecode(new Uint8Array([228, 189, 160, 229, 165, 189]));
 * console.log(decoded); // '你好'
 * ```
 */
export function textDecode(data: BufferSource): string {
    return isMinaEnv()
        ? minaTextDecode(bufferSourceToAb(data))
        : webTextDecode(data);
}

/**
 * 将 BufferSource 转换为十六进制字符串。
 * @param buffer - 需要转换的 BufferSource。
 * @returns 十六进制字符串。
 * @since 1.6.0
 * @example
 * ```ts
 * const hex = hexFromBuffer(new Uint8Array([255, 0, 128]));
 * console.log(hex); // 'ff0080'
 * ```
 */
export function hexFromBuffer(buffer: BufferSource): string {
    return Array.from(bufferSourceToBytes(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 将字节字符串转换为 Uint8Array，每个字符的 charCode 作为一个字节。
 * @param str - 需要转换的字节字符串。
 * @returns Uint8Array。
 * @since 1.0.0
 * @example
 * ```ts
 * const buffer = byteStringToBuffer('Hello');
 * console.log(buffer); // Uint8Array [72, 101, 108, 108, 111]
 * ```
 */
export function byteStringToBuffer(str: string): Uint8Array<ArrayBuffer> {
    const { length } = str;
    const u8a = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        u8a[i] = str.charCodeAt(i);
    }

    return u8a;
}

/**
 * 将 Buffer 转换为字节字符串，每个字节作为一个字符。
 * @param buffer - 需要转换的 Buffer。
 * @returns 字节字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const str = byteStringFromBuffer(new Uint8Array([72, 101, 108, 108, 111]));
 * console.log(str); // 'Hello'
 * ```
 */
export function byteStringFromBuffer(buffer: BufferSource): string {
    return String.fromCharCode(...bufferSourceToBytes(buffer));
}

/**
 * 将 UTF-8 字符串或 BufferSource 转换为字节字符串。
 * @param data - 需要转换的字符串或 BufferSource。
 * @returns 转换后的字节字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const byteStr = toByteString('你好');
 * // 返回 UTF-8 编码后的字节字符串
 * ```
 */
export function toByteString(data: DataSource): string {
    const buffer = typeof data === 'string'
        ? textEncode(data)
        : data;

    return byteStringFromBuffer(buffer);
}