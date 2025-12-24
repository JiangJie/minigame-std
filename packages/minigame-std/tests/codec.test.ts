import { expect, test } from 'vitest';
import {
    byteStringFromBuffer,
    byteStringToBuffer,
    hexFromBuffer,
    textDecode,
    textEncode,
    toByteString,
} from '../src/mod.ts';

test('encode/decode between utf8 string and binary', () => {
    const data = 'minigame-std';
    expect(textDecode(textEncode(data))).toBe(data);
});

test('textEncode/textDecode handles unicode correctly', () => {
    const data = 'Hello, 世界! 🎮';
    const encoded = textEncode(data);
    expect(textDecode(encoded)).toBe(data);
});

test('textEncode/textDecode handles empty string', () => {
    expect(textDecode(textEncode(''))).toBe('');
});

test('textEncode returns Uint8Array', () => {
    const result = textEncode('test');
    expect(result).toBeInstanceOf(Uint8Array);
});

test('hexFromBuffer converts buffer to hex string', () => {
    const buffer = new Uint8Array([0, 15, 16, 255]);
    expect(hexFromBuffer(buffer)).toBe('000f10ff');
});

test('hexFromBuffer handles empty buffer', () => {
    expect(hexFromBuffer(new Uint8Array([]))).toBe('');
});

test('hexFromBuffer works with ArrayBuffer', () => {
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view.set([0xde, 0xad, 0xbe, 0xef]);
    expect(hexFromBuffer(buffer)).toBe('deadbeef');
});

test('byteStringToBuffer converts string to Uint8Array', () => {
    const str = 'Hello';
    const result = byteStringToBuffer(str);
    expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
});

test('byteStringToBuffer handles empty string', () => {
    expect(byteStringToBuffer('')).toEqual(new Uint8Array([]));
});

test('byteStringFromBuffer converts buffer to string', () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]);
    expect(byteStringFromBuffer(buffer)).toBe('Hello');
});

test('byteStringFromBuffer handles empty buffer', () => {
    expect(byteStringFromBuffer(new Uint8Array([]))).toBe('');
});

test('byteString round-trip conversion', () => {
    const original = 'Test string 123';
    const buffer = byteStringToBuffer(original);
    const result = byteStringFromBuffer(buffer);
    expect(result).toBe(original);
});

test('toByteString converts string to byte string', () => {
    const str = 'Hello';
    const result = toByteString(str);
    // UTF-8 encoded "Hello" as byte string
    expect(result).toBe('Hello');
});

test('toByteString handles unicode string', () => {
    const str = '中文';
    const result = toByteString(str);
    // UTF-8 encoded bytes converted to byte string
    const expected = byteStringFromBuffer(textEncode(str));
    expect(result).toBe(expected);
});

test('toByteString handles BufferSource input', () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]);
    const result = toByteString(buffer);
    expect(result).toBe('Hello');
});

test('byteStringFromBuffer works with DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 72, 101, 108, 108, 111, 0]);

    const dataView = new DataView(buffer, 2, 5);
    expect(byteStringFromBuffer(dataView)).toBe('Hello');
});

test('hexFromBuffer with single byte values', () => {
    // Test edge cases
    expect(hexFromBuffer(new Uint8Array([0]))).toBe('00');
    expect(hexFromBuffer(new Uint8Array([255]))).toBe('ff');
    expect(hexFromBuffer(new Uint8Array([1]))).toBe('01');
    expect(hexFromBuffer(new Uint8Array([16]))).toBe('10');
});
