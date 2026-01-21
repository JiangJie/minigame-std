import { beforeAll, describe, expect, test, vi } from 'vitest';
import {
    byteStringFromBuffer,
    byteStringToBuffer,
    decodeUtf8,
    encodeUtf8,
    hexFromBuffer,
    toByteString,
} from '../src/mod.ts';

test('encode/decode between utf8 string and binary', () => {
    const data = 'minigame-std';
    expect(decodeUtf8(encodeUtf8(data))).toBe(data);
});

test('encodeUtf8/decodeUtf8 handles unicode correctly', () => {
    const data = 'Hello, 世界! 🎮';
    const encoded = encodeUtf8(data);
    expect(decodeUtf8(encoded)).toBe(data);
});

test('encodeUtf8/decodeUtf8 handles empty string', () => {
    expect(decodeUtf8(encodeUtf8(''))).toBe('');
});

test('encodeUtf8 returns Uint8Array', () => {
    const result = encodeUtf8('test');
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
    const expected = byteStringFromBuffer(encodeUtf8(str));
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

// #region mina_codec.ts tests (using mock to trigger fallback implementation)

describe('mina_codec fallback implementation', () => {
    let encodeUtf8Mina: (data: string) => ArrayBuffer;
    let decodeUtf8Mina: (data: ArrayBuffer) => string;

    beforeAll(async () => {
        // Mock wx global without encode/decode methods to trigger fallback implementation
        vi.stubGlobal('wx', {});

        // Clear module cache to ensure fresh import with mocked wx
        vi.resetModules();

        // Dynamically import the mina_codec module
        const minaCodec = await import('../src/std/codec/mina_codec.ts');
        encodeUtf8Mina = minaCodec.encodeUtf8;
        decodeUtf8Mina = minaCodec.decodeUtf8;
    });

    test('encodeUtf8 converts ASCII string correctly', () => {
        const str = 'Hello';
        const result = new Uint8Array(encodeUtf8Mina(str));
        expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    test('encodeUtf8 handles empty string', () => {
        const result = new Uint8Array(encodeUtf8Mina(''));
        expect(result).toEqual(new Uint8Array([]));
    });

    test('encodeUtf8 encodes 2-byte UTF-8 characters', () => {
        // 'é' (U+00E9) should be encoded as [0xC3, 0xA9]
        const str = 'é';
        const result = new Uint8Array(encodeUtf8Mina(str));
        expect(result).toEqual(new Uint8Array([0xc3, 0xa9]));
    });

    test('encodeUtf8 encodes 3-byte UTF-8 characters (Chinese)', () => {
        // '中' (U+4E2D) should be encoded as [0xE4, 0xB8, 0xAD]
        const str = '中';
        const result = new Uint8Array(encodeUtf8Mina(str));
        expect(result).toEqual(new Uint8Array([0xe4, 0xb8, 0xad]));
    });

    test('encodeUtf8 encodes 4-byte UTF-8 characters (emoji)', () => {
        // '😀' (U+1F600) should be encoded as [0xF0, 0x9F, 0x98, 0x80]
        const str = '😀';
        const result = new Uint8Array(encodeUtf8Mina(str));
        expect(result).toEqual(new Uint8Array([0xf0, 0x9f, 0x98, 0x80]));
    });

    test('encodeUtf8 handles mixed characters', () => {
        const str = 'A中😀';
        const result = new Uint8Array(encodeUtf8Mina(str));
        // 'A' = [0x41], '中' = [0xE4, 0xB8, 0xAD], '😀' = [0xF0, 0x9F, 0x98, 0x80]
        expect(result).toEqual(new Uint8Array([0x41, 0xe4, 0xb8, 0xad, 0xf0, 0x9f, 0x98, 0x80]));
    });

    test('decodeUtf8 decodes ASCII correctly', () => {
        const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
        expect(decodeUtf8Mina(buffer)).toBe('Hello');
    });

    test('decodeUtf8 handles empty buffer', () => {
        const buffer = new ArrayBuffer(0);
        expect(decodeUtf8Mina(buffer)).toBe('');
    });

    test('decodeUtf8 decodes 2-byte UTF-8 characters', () => {
        // 'é' (U+00E9) encoded as [0xC3, 0xA9]
        const buffer = new Uint8Array([0xc3, 0xa9]).buffer;
        expect(decodeUtf8Mina(buffer)).toBe('é');
    });

    test('decodeUtf8 decodes 3-byte UTF-8 characters (Chinese)', () => {
        // '中' (U+4E2D) encoded as [0xE4, 0xB8, 0xAD]
        const buffer = new Uint8Array([0xe4, 0xb8, 0xad]).buffer;
        expect(decodeUtf8Mina(buffer)).toBe('中');
    });

    test('decodeUtf8 decodes 4-byte UTF-8 characters (emoji)', () => {
        // '😀' (U+1F600) encoded as [0xF0, 0x9F, 0x98, 0x80]
        const buffer = new Uint8Array([0xf0, 0x9f, 0x98, 0x80]).buffer;
        expect(decodeUtf8Mina(buffer)).toBe('😀');
    });

    test('decodeUtf8 decodes mixed characters', () => {
        // 'A中😀'
        const buffer = new Uint8Array([0x41, 0xe4, 0xb8, 0xad, 0xf0, 0x9f, 0x98, 0x80]).buffer;
        expect(decodeUtf8Mina(buffer)).toBe('A中😀');
    });

    test('decodeUtf8 throws on invalid UTF-8 byte sequence', () => {
        // 0xF8 is invalid UTF-8 start byte (5-byte sequence, not valid in UTF-8)
        const buffer = new Uint8Array([0xf8, 0x80, 0x80, 0x80]).buffer;
        expect(() => decodeUtf8Mina(buffer)).toThrow('Invalid UTF-8 byte sequence');
    });

    test('encodeUtf8 and decodeUtf8 round-trip', () => {
        const testCases = [
            'Hello, World!',
            '你好，世界！',
            '🎮🎲🎯',
            'Mixed: Hello 你好 🌍',
            '',
            'Special chars: \t\n\r',
        ];

        for (const original of testCases) {
            const encoded = encodeUtf8Mina(original);
            const decoded = decodeUtf8Mina(encoded);
            expect(decoded).toBe(original);
        }
    });
});

// #endregion
