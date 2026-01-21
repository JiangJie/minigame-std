/**
 * @internal
 * 小游戏平台的 Base64 编解码实现。
 */

import { decodeUtf8, encodeUtf8 } from '../codec/mod.ts';
import { decodeBase64Buffer, encodeBase64Buffer } from './base64.ts';

/**
 * 将字符串数据编码为 Base64 格式。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 Base64 字符串。
 */
export function encodeBase64(data: string): string {
    return encodeBase64Buffer(encodeUtf8(data));
}

/**
 * 将 Base64 格式的字符串数据解码。
 * @param data - 需要解码的 Base64 字符串。
 * @returns 解码后的字符串。
 */
export function decodeBase64(data: string): string {
    return decodeUtf8(decodeBase64Buffer(data));
}