/**
 * @fileoverview Encode/Decode between ArrayBuffer and base64 encoded string.
 *
 * Forked from @std/encoding/base64 and https://github.com/cross-org/base64
 */

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
 * Converts ArrayBuffer into a base64 encoded string.
 *
 * @param data The data to encode.
 * @returns The base64 encoded string.
 */
export function base64FromArrayBuffer(data: ArrayBuffer): string {
    let result = '';

    const uint8 = new Uint8Array(data);
    const len = uint8.length;
    let i: number;

    for (i = 2; i < len; i += 3) {
        result += base64abc[(uint8[i - 2]) >> 2];
        result += base64abc[
            (((uint8[i - 2]) & 0x03) << 4) |
            ((uint8[i - 1]) >> 4)
        ];
        result += base64abc[
            (((uint8[i - 1]) & 0x0f) << 2) |
            ((uint8[i]!) >> 6)
        ];
        result += base64abc[(uint8[i]) & 0x3f];
    }

    if (i === len + 1) {
        // 1 octet yet to write
        result += base64abc[(uint8[i - 2]) >> 2];
        result += base64abc[((uint8[i - 2]) & 0x03) << 4];
        result += '==';
    }

    if (i === len) {
        // 2 octets yet to write
        result += base64abc[(uint8[i - 2]) >> 2];
        result += base64abc[
            (((uint8[i - 2]) & 0x03) << 4) |
            ((uint8[i - 1]) >> 4)
        ];
        result += base64abc[((uint8[i - 1]) & 0x0f) << 2];
        result += '=';
    }

    return result;
}

/**
 * Converts a base64 encoded string to an ArrayBuffer
 *
 * @param data Base64 encoded string
 * @returns The decoded data as an ArrayBuffer.
 */
export function base64ToArrayBuffer(data: string): ArrayBuffer {
    const len = data.length;

    let bufferLength = len * 0.75;

    if (data[len - 1] === '=') {
        bufferLength--;
        if (data[len - 2] === '=') {
            bufferLength--;
        }
    }

    const arraybuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arraybuffer);

    let pos = 0;

    for (let i = 0; i < len; i += 4) {
        const encoded1 = lookup[data.charCodeAt(i)];
        const encoded2 = lookup[data.charCodeAt(i + 1)];
        const encoded3 = lookup[data.charCodeAt(i + 2)];
        const encoded4 = lookup[data.charCodeAt(i + 3)];

        bytes[pos++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[pos++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[pos++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
}