import { expect, test } from 'vitest';
import { base64FromBuffer, base64ToBuffer, decodeBase64, encodeBase64, textEncode } from 'minigame-std';

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

test('base64FromBuffer encodes Uint8Array to base64 string', () => {
    // Test with simple ASCII data
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    expect(base64FromBuffer(data)).toBe('SGVsbG8=');

    // Test with empty array
    expect(base64FromBuffer(new Uint8Array([]))).toBe('');

    // Test with single byte
    expect(base64FromBuffer(new Uint8Array([65]))).toBe('QQ==');

    // Test with two bytes
    expect(base64FromBuffer(new Uint8Array([65, 66]))).toBe('QUI=');

    // Test with three bytes (no padding needed)
    expect(base64FromBuffer(new Uint8Array([65, 66, 67]))).toBe('QUJD');
});

test('base64FromBuffer encodes ArrayBuffer to base64 string', () => {
    const buffer = new ArrayBuffer(5);
    const view = new Uint8Array(buffer);
    view.set([72, 101, 108, 108, 111]); // "Hello"
    expect(base64FromBuffer(buffer)).toBe('SGVsbG8=');
});

test('base64ToBuffer decodes base64 string to Uint8Array', () => {
    // Test with simple ASCII data
    const result = base64ToBuffer('SGVsbG8=');
    expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));

    // Test with empty string
    expect(base64ToBuffer('')).toEqual(new Uint8Array([]));

    // Test with single byte (double padding)
    expect(base64ToBuffer('QQ==')).toEqual(new Uint8Array([65]));

    // Test with two bytes (single padding)
    expect(base64ToBuffer('QUI=')).toEqual(new Uint8Array([65, 66]));

    // Test with three bytes (no padding)
    expect(base64ToBuffer('QUJD')).toEqual(new Uint8Array([65, 66, 67]));
});

test('base64 round-trip conversion', () => {
    const originalData = textEncode('Hello, 世界! 🎮');
    const encoded = base64FromBuffer(originalData);
    const decoded = base64ToBuffer(encoded);

    expect(decoded).toEqual(originalData);
});

test('base64FromBuffer with DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 72, 101, 108, 108, 111, 0]);
    
    // Create a DataView with offset
    const dataView = new DataView(buffer, 2, 5);
    expect(base64FromBuffer(dataView)).toBe('SGVsbG8=');
});

test('base64 handles binary data correctly', () => {
    // Test with all possible byte values (0-255)
    const allBytes = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        allBytes[i] = i;
    }
    
    const encoded = base64FromBuffer(allBytes);
    const decoded = base64ToBuffer(encoded);
    
    expect(decoded).toEqual(allBytes);
});
