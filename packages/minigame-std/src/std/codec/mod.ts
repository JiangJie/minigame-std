/**
 * Codec 模块：提供各种编码/解码功能。
 *
 * @module codec
 */

import { decodeUtf8 as webDecodeUtf8, encodeUtf8 as webEncodeUtf8 } from 'happy-codec';
import { isMinaEnv } from '../../macros/env.ts';
import { decodeUtf8 as minaDecodeUtf8, encodeUtf8 as minaEncodeUtf8 } from './mina_utf8.ts';

/**
 * 除了 UTF-8 编码/解码功能外，其余编码/解码功能直接从 `happy-codec` 包中导出。
 */
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
 * @returns 解码后的字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const decoded = decodeUtf8(new Uint8Array([228, 189, 160, 229, 165, 189]));
 * console.log(decoded); // '你好'
 * ```
 */
export function decodeUtf8(data: BufferSource): string {
    return (isMinaEnv() ? minaDecodeUtf8 : webDecodeUtf8)(data);
}
