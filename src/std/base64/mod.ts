import { isMinaEnv } from '../../macros/env.ts';
import { decodeBase64 as minaDecodeBase64, encodeBase64 as minaEncodeBase64 } from './mina_base64.ts';
import { decodeBase64 as webDecodeBase64, encodeBase64 as webEncodeBase64 } from './web_base64.ts';
export { base64FromBuffer, base64ToBuffer } from './base64.ts';

/**
 * 将字符串数据编码为 Base64 格式。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 Base64 字符串。
 */
export function encodeBase64(data: string): string {
    return (isMinaEnv() ? minaEncodeBase64 : webEncodeBase64)(data);
}

/**
 * 将 Base64 格式的字符串数据解码。
 * @param data - 需要解码的 Base64 字符串。
 * @returns 解码后的字符串。
 */
export function decodeBase64(data: string): string {
    return (isMinaEnv() ? minaDecodeBase64 : webDecodeBase64)(data);
}