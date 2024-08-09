import { isMinaEnv } from '../../macros/env.ts';
import { decode as minaDecode, encode as minaEncode } from './mina_codec.ts';
import { decode as webDecode, encode as webEncode } from './web_codec.ts';

/**
 * 将字符串数据编码为 `Uint8Array`
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`
 */
export function encode(data: string): Uint8Array {
    return isMinaEnv()
        ? new Uint8Array(minaEncode(data))
        : webEncode(data);
}

/**
 * 将二进制数据解码为字符串。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 */
export function decode(data: AllowSharedBufferSource): string {
    if (isMinaEnv()) {
        return data instanceof ArrayBuffer
            ? minaDecode(data)
            : minaDecode(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    }

    return webDecode(data);

}