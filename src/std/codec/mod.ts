import { isMinaEnv } from '../../macros/env.ts';
import { textDecode as minaTextDecode, textEncode as minaTextEncode } from './mina_codec.ts';
import { textDecode as webTextDecode, textEncode as webTextEncode } from './web_codec.ts';

/**
 * 将字符串数据编码为 `Uint8Array`
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`
 */
export function textEncode(data: string): Uint8Array {
    return isMinaEnv()
        ? new Uint8Array(minaTextEncode(data))
        : webTextEncode(data);
}

/**
 * 将二进制数据解码为字符串。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 */
export function textDecode(data: BufferSource): string {
    if (isMinaEnv()) {
        return data instanceof ArrayBuffer
            ? minaTextDecode(data)
            : minaTextDecode(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    }

    return webTextDecode(data);
}