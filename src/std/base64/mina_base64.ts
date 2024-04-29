import { decode, encode } from '../codec/mod';
import { base64FromArrayBuffer, base64ToArrayBuffer } from './base64.ts';

export function encodeBase64(data: string): string {
    return base64FromArrayBuffer(encode(data));
}

export function decodeBase64(data: string): string {
    return decode(base64ToArrayBuffer(data));
}