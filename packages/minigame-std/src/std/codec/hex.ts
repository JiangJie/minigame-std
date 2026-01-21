import { bufferSourceToBytes } from '../internal/mod.ts';

/**
 * 将 BufferSource 编码为十六进制字符串。
 * @param data - 需要编码的 BufferSource。
 * @returns 十六进制字符串。
 * @since 1.6.0
 * @example
 * ```ts
 * const hex = encodeHex(new Uint8Array([255, 0, 128]));
 * console.log(hex); // 'ff0080'
 * ```
 */
export function encodeHex(data: BufferSource): string {
    return Array.from(bufferSourceToBytes(data), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 将十六进制字符串解码为 Uint8Array。
 * @param hex - 十六进制字符串。
 * @returns 解码后的 Uint8Array。
 * @example
 * ```ts
 * const bytes = decodeHex('ff0080');
 * console.log(bytes); // Uint8Array [255, 0, 128]
 * ```
 */
export function decodeHex(hex: string): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    return bytes;
}
