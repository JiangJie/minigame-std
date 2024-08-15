import { isMinaEnv } from '../../macros/env.ts';
import { bufferSource2Ab, bufferSource2U8a } from '../utils/mod.ts';
import { textDecode as minaTextDecode, textEncode as minaTextEncode } from './mina_codec.ts';
import { textDecode as webTextDecode, textEncode as webTextEncode } from './web_codec.ts';

/**
 * 将字符串数据编码为 `Uint8Array`
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`
 */
export function textEncode(data: string): Uint8Array {
    return isMinaEnv()
        ? bufferSource2U8a(minaTextEncode(data))
        : webTextEncode(data);
}

/**
 * 将二进制数据解码为字符串。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 */
export function textDecode(data: BufferSource): string {
    return isMinaEnv()
        ? minaTextDecode(bufferSource2Ab(data))
        : webTextDecode(data);
}

/**
 * 将 BufferSource 转换为十六进制字符串。
 * @param buffer - 需要转换的 BufferSource。
 * @returns 十六进制字符串。
 */
export function hexFromBuffer(buffer: BufferSource): string {
    return Array.from(bufferSource2U8a(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 将字符串转换为 Uint8Array。
 * @param str - 需要转换的字符串。
 * @returns Uint8Array。
 */
export function byteStringToBuffer(str: string): Uint8Array {
    const { length } = str;
    const u8a = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        u8a[i] = str.charCodeAt(i);
    }

    return u8a;
}

/**
 * 将字符串转换为 Uint8Array。
 * @param str - 需要转换的字符串。
 * @returns Uint8Array。
 */
export function byteStringFromBuffer(buffer: BufferSource): string {
    return String.fromCharCode(...bufferSource2U8a(buffer));
}