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

export function encode(data: string): ArrayBuffer {
    return getEncoder().encode(data).buffer as ArrayBuffer;
}

export function decode(data: ArrayBuffer): string {
    return getDecoder().decode(data);
}