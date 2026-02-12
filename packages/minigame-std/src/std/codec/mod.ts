/**
 * Codec 模块：提供各种编码/解码功能。
 * 除了 UTF-8 编码/解码功能外，其余编码/解码功能直接从 `happy-codec` 包中导出。
 *
 * @module codec
 */

import { decodeUtf8 as webDecodeUtf8, encodeUtf8 as webEncodeUtf8 } from 'happy-codec';
import { isMinaEnv } from '../../macros/env.ts';
import { decodeUtf8 as minaDecodeUtf8, encodeUtf8 as minaEncodeUtf8 } from './mina_utf8.ts';

export { decodeBase64, decodeByteString, decodeHex, encodeBase64, encodeByteString, encodeHex, type DecodeBase64Options, type EncodeBase64Options } from 'happy-codec';

/**
 * 将字符串数据编码为 `Uint8Array`（UTF-8 编码）。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`。
 * @since 1.0.0
 * @example
 * ```ts
 * const encoded = encodeUtf8('你好');
 * console.log(encoded); // Uint8Array [228, 189, 160, 229, 165, 189]
 * ```
 */
export function encodeUtf8(data: string): Uint8Array<ArrayBuffer> {
    return (isMinaEnv() ? minaEncodeUtf8 : webEncodeUtf8)(data);
}

/**
 * 将二进制数据解码为字符串（UTF-8 解码）。
 * @param data - 需要解码的二进制数据。
 * @param options - 解码选项（可选）。
 * @param options.fatal - 如果为 `true`，遇到无效的 UTF-8 序列会抛出异常；如果为 `false`（默认），使用替换字符 U+FFFD 代替。
 * @param options.ignoreBOM - 如果为 `true`，保留字节顺序标记（BOM）；如果为 `false`（默认），自动删除 BOM。
 * @returns 解码后的字符串。
 * @throws {TypeError} 当 `options.fatal` 为 `true` 且输入包含无效的 UTF-8 序列时。
 * @since 1.0.0
 * @example
 * ```ts
 * // 基本用法
 * const decoded = decodeUtf8(new Uint8Array([228, 189, 160, 229, 165, 189]));
 * console.log(decoded); // '你好'
 *
 * // 使用 fatal 选项处理无效字节
 * const withReplacement = decodeUtf8(new Uint8Array([0xff, 0xfe]));
 * console.log(withReplacement); // '��'（使用替换字符）
 *
 * // 使用 ignoreBOM 选项保留 BOM
 * const withBOM = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]); // BOM + 'Hi'
 * decodeUtf8(withBOM); // 'Hi'（删除 BOM）
 * decodeUtf8(withBOM, { ignoreBOM: true }); // '\uFEFFHi'（保留 BOM）
 * ```
 */
export function decodeUtf8(data: BufferSource, options?: TextDecoderOptions): string {
    return (isMinaEnv() ? minaDecodeUtf8 : webDecodeUtf8)(data, options);
}
