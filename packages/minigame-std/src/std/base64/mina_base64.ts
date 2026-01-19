/**
 * @internal
 * 小游戏平台的 Base64 编解码实现。
 */

import { textDecode, textEncode } from '../codec/mod.ts';
import { base64FromBuffer, base64ToBuffer } from './base64.ts';

/**
 * 将字符串数据编码为 Base64 格式。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 Base64 字符串。
 */
export function encodeBase64(data: string): string {
    return base64FromBuffer(textEncode(data));
}

/**
 * 将 Base64 格式的字符串数据解码。
 * @param data - 需要解码的 Base64 字符串。
 * @returns 解码后的字符串。
 */
export function decodeBase64(data: string): string {
    return textDecode(base64ToBuffer(data));
}