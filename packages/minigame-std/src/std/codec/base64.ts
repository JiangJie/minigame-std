/**
 * 在 Uint8Array 和 base64 编码字符串之间进行编解码。
 *
 * ## 为什么使用纯 JS 实现？
 *
 * 虽然浏览器提供了原生的 btoa/atob 方法，但它们存在以下问题：
 *
 * 1. **Latin1 限制**：btoa/atob 只能处理 Latin1 字符（0x00-0xFF），
 *    处理 UTF-8 数据需要额外的 string ↔ bytes 转换
 *
 * 2. **性能问题**：由于需要额外的转换步骤，原生方案反而更慢：
 *    - 编码：`string → UTF-8 bytes → Latin1 string → btoa`
 *    - 解码：`atob → Latin1 string → bytes`
 *
 * 3. **Benchmark 结果**：纯 JS 实现在所有场景下都比原生方案更快：
 *    - 编码：纯 JS 比 btoa 快 1.6x ~ 4.1x
 *    - 解码：纯 JS 比 atob 快 1.1x ~ 2.5x
 *
 * ## 如何运行 Benchmark
 *
 * ```bash
 * pnpm run bench
 * ```
 *
 * Benchmark 文件位于 `benchmarks/base64.bench.ts`，测试了不同长度和类型的字符串：
 * - 短字符串 (13 chars)
 * - 中等字符串 (1000 chars)
 * - 长字符串 (10000 chars)
 * - 中文字符串 (400 chars)
 * - 混合字符串 (1650 chars)
 *
 * 源自 @std/encoding/base64 和 https://github.com/cross-org/base64
 */

import { Lazy } from 'happy-rusty';
import type { DataSource } from '../defines.ts';
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
 * 全平台使用纯 JS 实现，benchmark 显示比 atob + 字符串转换更快。
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
 * const text = decodeUtf8(decodeBase64('SGVsbG8sIFdvcmxkIQ=='));
 * console.log(text); // 'Hello, World!'
 * ```
 */
export function decodeBase64(data: string): Uint8Array<ArrayBuffer> {
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