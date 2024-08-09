/**
 * Web环境的编解码
 */

let encoder: TextEncoder;
let decoder: TextDecoder;

function getEncoder(): TextEncoder {
    encoder ??= new TextEncoder();
    return encoder;
}

function getDecoder(): TextDecoder {
    decoder ??= new TextDecoder();
    return decoder;
}

/**
 * 将字符串数据编码为 `Uint8Array`
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`
 */
export function encode(data: string): Uint8Array {
    return getEncoder().encode(data);
}

/**
 * 将二进制数据解码为字符串。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 */
export function decode(data: AllowSharedBufferSource): string {
    return getDecoder().decode(data);
}