import { describe, expect, test } from 'vitest';
import { decodeBase64, decodeBase64Buffer, encodeBase64, encodeBase64Buffer, encodeUtf8 } from '../src/mod.ts';
// Direct import for testing mina implementation (doesn't use wx API)
import { decodeBase64 as minaDecodeBase64, encodeBase64 as minaEncodeBase64 } from '../src/std/base64/mina_base64.ts';

test('encode/decode string to/from base64 string', () => {
    const data = 'minigame-std';
    const encodedData = 'bWluaWdhbWUtc3Rk';

    const data1 = '中文';
    const encodedData1 = '5Lit5paH';

    expect(encodeBase64(data)).toBe(encodedData);
    expect(decodeBase64(encodedData)).toBe(data);

    expect(encodeBase64(data1)).toBe(encodedData1);
    expect(decodeBase64(encodedData1)).toBe(data1);
});

test('encodeBase64Buffer encodes Uint8Array to base64 string', () => {
    // Test with simple ASCII data
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    expect(encodeBase64Buffer(data)).toBe('SGVsbG8=');

    // Test with empty array
    expect(encodeBase64Buffer(new Uint8Array([]))).toBe('');

    // Test with single byte
    expect(encodeBase64Buffer(new Uint8Array([65]))).toBe('QQ==');

    // Test with two bytes
    expect(encodeBase64Buffer(new Uint8Array([65, 66]))).toBe('QUI=');

    // Test with three bytes (no padding needed)
    expect(encodeBase64Buffer(new Uint8Array([65, 66, 67]))).toBe('QUJD');
});

test('encodeBase64Buffer encodes ArrayBuffer to base64 string', () => {
    const buffer = new ArrayBuffer(5);
    const view = new Uint8Array(buffer);
    view.set([72, 101, 108, 108, 111]); // "Hello"
    expect(encodeBase64Buffer(buffer)).toBe('SGVsbG8=');
});

test('decodeBase64Buffer decodes base64 string to Uint8Array', () => {
    // Test with simple ASCII data
    const result = decodeBase64Buffer('SGVsbG8=');
    expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));

    // Test with empty string
    expect(decodeBase64Buffer('')).toEqual(new Uint8Array([]));

    // Test with single byte (double padding)
    expect(decodeBase64Buffer('QQ==')).toEqual(new Uint8Array([65]));

    // Test with two bytes (single padding)
    expect(decodeBase64Buffer('QUI=')).toEqual(new Uint8Array([65, 66]));

    // Test with three bytes (no padding)
    expect(decodeBase64Buffer('QUJD')).toEqual(new Uint8Array([65, 66, 67]));
});

test('base64 round-trip conversion', () => {
    const originalData = encodeUtf8('Hello, 世界! 🎮');
    const encoded = encodeBase64Buffer(originalData);
    const decoded = decodeBase64Buffer(encoded);

    expect(decoded).toEqual(originalData);
});

test('encodeBase64Buffer with DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 72, 101, 108, 108, 111, 0]);

    // Create a DataView with offset
    const dataView = new DataView(buffer, 2, 5);
    expect(encodeBase64Buffer(dataView)).toBe('SGVsbG8=');
});

test('base64 handles binary data correctly', () => {
    // Test with all possible byte values (0-255)
    const allBytes = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        allBytes[i] = i;
    }

    const encoded = encodeBase64Buffer(allBytes);
    const decoded = decodeBase64Buffer(encoded);

    expect(decoded).toEqual(allBytes);
});

describe('mina base64 implementation', () => {
    test('minaEncodeBase64 encodes string to base64', () => {
        expect(minaEncodeBase64('minigame-std')).toBe('bWluaWdhbWUtc3Rk');
        expect(minaEncodeBase64('中文')).toBe('5Lit5paH');
        expect(minaEncodeBase64('')).toBe('');
    });

    test('minaDecodeBase64 decodes base64 to string', () => {
        expect(minaDecodeBase64('bWluaWdhbWUtc3Rk')).toBe('minigame-std');
        expect(minaDecodeBase64('5Lit5paH')).toBe('中文');
        expect(minaDecodeBase64('')).toBe('');
    });

    test('mina base64 round-trip conversion', () => {
        const testStrings = ['Hello, World!', '中文测试', 'emoji 🎮🎯', ''];
        for (const str of testStrings) {
            expect(minaDecodeBase64(minaEncodeBase64(str))).toBe(str);
        }
    });
});
