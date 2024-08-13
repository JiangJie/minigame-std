/**
 * @fileoverview Encode/Decode between Uint8Array and base64 encoded string.
 *
 * Forked from @std/encoding/base64 and https://github.com/cross-org/base64
 */

import { bufferSource2U8a } from '../utils/mod.ts';

/**
 * A string containing standard base64 characters
 */
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Standard base64 characters
 */
const base64abc = chars.split('');

/**
 * Lookup table for standard base64 characters
 */
const lookup = ((): Uint8Array => {
    const lookupTemp = new Uint8Array(256); // base64abc.length * 4

    for (let i = 0; i < base64abc.length; i++) {
        lookupTemp[base64abc[i].charCodeAt(0)] = i;
    }

    return lookupTemp;
})();

/**
 * Converts Uint8Array into a base64 encoded string.
 *
 * @param data - The data to encode.
 * @returns The base64 encoded string.
 */
export function base64FromBuffer(data: BufferSource): string {
    let result = '';

    const u8a = bufferSource2U8a(data);

    const len = u8a.length;
    let i: number;

    for (i = 2; i < len; i += 3) {
        result += base64abc[(u8a[i - 2]) >> 2];
        result += base64abc[
            (((u8a[i - 2]) & 0x03) << 4)
            | ((u8a[i - 1]) >> 4)
        ];
        result += base64abc[
            (((u8a[i - 1]) & 0x0f) << 2)
            | ((u8a[i]) >> 6)
        ];
        result += base64abc[(u8a[i]) & 0x3f];
    }

    if (i === len + 1) {
        // 1 octet yet to write
        result += base64abc[(u8a[i - 2]) >> 2];
        result += base64abc[((u8a[i - 2]) & 0x03) << 4];
        result += '==';
    }

    if (i === len) {
        // 2 octets yet to write
        result += base64abc[(u8a[i - 2]) >> 2];
        result += base64abc[
            (((u8a[i - 2]) & 0x03) << 4)
            | ((u8a[i - 1]) >> 4)
        ];
        result += base64abc[((u8a[i - 1]) & 0x0f) << 2];
        result += '=';
    }

    return result;
}

/**
 * Converts a base64 encoded string to an Uint8Array
 *
 * @param data - Base64 encoded string
 * @returns The decoded data as an Uint8Array.
 */
export function base64ToBuffer(data: string): Uint8Array {
    const len = data.length;

    let bufferLength = len * 0.75;

    if (data[len - 1] === '=') {
        bufferLength--;
        if (data[len - 2] === '=') {
            bufferLength--;
        }
    }

    const u8a = new Uint8Array(bufferLength);

    let pos = 0;

    for (let i = 0; i < len; i += 4) {
        const encoded1 = lookup[data.charCodeAt(i)];
        const encoded2 = lookup[data.charCodeAt(i + 1)];
        const encoded3 = lookup[data.charCodeAt(i + 2)];
        const encoded4 = lookup[data.charCodeAt(i + 3)];

        u8a[pos++] = (encoded1 << 2) | (encoded2 >> 4);
        u8a[pos++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        u8a[pos++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return u8a;
}