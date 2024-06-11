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
 * 将字符串数据编码为 ArrayBuffer。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 ArrayBuffer。
 */
export function encode(data: string): ArrayBuffer {
    return getEncoder().encode(data).buffer as ArrayBuffer;
}

/**
 * 将 ArrayBuffer 数据解码为字符串。
 * @param data - 需要解码的 ArrayBuffer。
 * @returns 解码后的字符串。
 */
export function decode(data: ArrayBuffer): string {
    return getDecoder().decode(data);
}