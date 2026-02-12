/**
 * 测试 Web 平台下的 codec 模块
 */
import { expect, test } from 'vitest';
import { decodeUtf8, encodeUtf8 } from '../src/mod.ts';

test('decodeUtf8 with default options replaces invalid bytes with U+FFFD', () => {
    const invalidBytes = new Uint8Array([0xff, 0xfe]);
    const result = decodeUtf8(invalidBytes);

    expect(result).toBe('\uFFFD\uFFFD');
});

test('decodeUtf8 with fatal=true throws on invalid bytes', () => {
    const invalidBytes = new Uint8Array([0xff, 0xfe]);

    expect(() => decodeUtf8(invalidBytes, { fatal: true })).toThrow();
});

test('decodeUtf8 strips BOM by default', () => {
    // UTF-8 BOM (EF BB BF) + 'Hi'
    const withBOM = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]);
    const result = decodeUtf8(withBOM);

    expect(result).toBe('Hi');
});

test('decodeUtf8 with ignoreBOM=true preserves BOM', () => {
    // UTF-8 BOM (EF BB BF) + 'Hi'
    const withBOM = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]);
    const result = decodeUtf8(withBOM, { ignoreBOM: true });

    expect(result).toBe('\uFEFFHi');
});

test('encodeUtf8 and decodeUtf8 round trip', () => {
    const original = 'Hello, 世界! 🌍';
    const encoded = encodeUtf8(original);
    const decoded = decodeUtf8(encoded);

    expect(decoded).toBe(original);
});
