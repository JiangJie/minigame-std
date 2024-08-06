import { isMinaEnv } from '../../macros/env.ts';
import { decode as minaDecode, encode as minaEncode } from './mina_codec.ts';
import { decode as webDecode, encode as webEncode } from './web_codec.ts';

/**
 * 将`utf8`字符串编码为`ArrayBuffer`
 * @param data 要编码的字符串
 * @returns
 */
export function encode(data: string): ArrayBuffer {
    return (isMinaEnv() ? minaEncode : webEncode)(data);
}

/**
 * 将一段`ArrayBuffer`解码为`utf8`字符串
 * @param data 要解码的buffer
 * @returns
 */
export function decode(data: ArrayBuffer): string {
    return (isMinaEnv() ? minaDecode : webDecode)(data);
}