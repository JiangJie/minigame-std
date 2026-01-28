/**
 * @internal
 * 纯 JS 实现的 UTF-8 编解码。
 *
 * 当平台不支持 TextEncoder/TextDecoder 或 wx.encode/wx.decode 时使用。
 */

import { bufferSourceToBytes } from '../../internal/mod.ts';

/**
 * 将字符串编码为 UTF-8 格式的 Uint8Array。
 * @param data - 需要编码的字符串。
 * @returns 编码后的 Uint8Array。
 */
export function encodeUtf8Buffer(data: string): Uint8Array<ArrayBuffer> {
    const bytes: number[] = [];

    for (let i = 0; i < data.length; i++) {
        // 使用 codePointAt 获取完整的 Unicode 码点，正确处理代理对
        const codePoint = data.codePointAt(i) as number;

        // 处理不同的 Unicode 范围
        if (codePoint < 0x80) {
            // 1字节
            bytes.push(codePoint);
        } else if (codePoint < 0x800) {
            // 2字节
            bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        } else if (codePoint < 0x10000) {
            // 3字节
            bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        } else {
            // 4字节 (U+10000 及以上)，需要跳过代理对的第二个代码单元
            bytes.push(
                0xf0 | (codePoint >> 18),
                0x80 | ((codePoint >> 12) & 0x3f),
                0x80 | ((codePoint >> 6) & 0x3f),
                0x80 | (codePoint & 0x3f),
            );
            i++; // 跳过代理对的低位部分
        }
    }

    return new Uint8Array(bytes);
}

/**
 * 将 BufferSource 解码为 UTF-8 字符串。
 * @param data - 需要解码的 BufferSource。
 * @returns 解码后的字符串。
 */
export function decodeUtf8Buffer(data: BufferSource): string {
    const bytes = bufferSourceToBytes(data);

    let str = '';
    let i = 0;

    while (i < bytes.length) {
        const byte1 = bytes[i];

        let codePoint: number;

        if (byte1 < 0x80) {
            // 1字节字符
            codePoint = byte1;
            i += 1;
        } else if (byte1 < 0xe0) {
            // 2字节字符
            const byte2 = bytes[i + 1];
            codePoint = ((byte1 & 0x1f) << 6) | (byte2 & 0x3f);
            i += 2;
        } else if (byte1 < 0xf0) {
            // 3字节字符
            const byte2 = bytes[i + 1];
            const byte3 = bytes[i + 2];
            codePoint = ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f);
            i += 3;
        } else if (byte1 < 0xf8) {
            // 4字节字符（码点 >= U+10000，如 emoji）
            const byte2 = bytes[i + 1];
            const byte3 = bytes[i + 2];
            const byte4 = bytes[i + 3];
            codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
            i += 4;
        } else {
            // 无效的 UTF-8 字节序列
            throw new Error('Invalid UTF-8 byte sequence');
        }

        // 使用 fromCodePoint 正确处理所有 Unicode 码点（包括 >= U+10000）
        str += String.fromCodePoint(codePoint);
    }

    return str;
}
