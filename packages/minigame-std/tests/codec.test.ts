import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import {
    decodeBase64,
    decodeByteString,
    decodeHex,
    decodeUtf8,
    encodeBase64,
    encodeByteString,
    encodeHex,
    encodeUtf8,
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

test('encodeHex converts buffer to hex string', () => {
    const buffer = new Uint8Array([0, 15, 16, 255]);
    expect(encodeHex(buffer)).toBe('000f10ff');
});

test('encodeHex handles empty buffer', () => {
    expect(encodeHex(new Uint8Array([]))).toBe('');
});

test('encodeHex works with ArrayBuffer', () => {
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view.set([0xde, 0xad, 0xbe, 0xef]);
    expect(encodeHex(buffer)).toBe('deadbeef');
});

test('decodeByteString converts string to Uint8Array', () => {
    const str = 'Hello';
    const result = decodeByteString(str);
    expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
});

test('decodeByteString handles empty string', () => {
    expect(decodeByteString('')).toEqual(new Uint8Array([]));
});

test('encodeByteString converts buffer to string', () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]);
    expect(encodeByteString(buffer)).toBe('Hello');
});

test('encodeByteString handles empty buffer', () => {
    expect(encodeByteString(new Uint8Array([]))).toBe('');
});

test('byteString round-trip conversion', () => {
    const original = 'Test string 123';
    const buffer = decodeByteString(original);
    const result = encodeByteString(buffer);
    expect(result).toBe(original);
});

test('encodeByteString converts string to byte string', () => {
    const str = 'Hello';
    const result = encodeByteString(str);
    // UTF-8 encoded "Hello" as byte string
    expect(result).toBe('Hello');
});

test('encodeByteString handles unicode string', () => {
    const str = '中文';
    const result = encodeByteString(str);
    // UTF-8 encoded bytes converted to byte string
    const expected = encodeByteString(encodeUtf8(str));
    expect(result).toBe(expected);
});

test('encodeByteString handles BufferSource input', () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]);
    const result = encodeByteString(buffer);
    expect(result).toBe('Hello');
});

test('encodeByteString works with DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 72, 101, 108, 108, 111, 0]);

    const dataView = new DataView(buffer, 2, 5);
    expect(encodeByteString(dataView)).toBe('Hello');
});

test('encodeHex with single byte values', () => {
    // Test edge cases
    expect(encodeHex(new Uint8Array([0]))).toBe('00');
    expect(encodeHex(new Uint8Array([255]))).toBe('ff');
    expect(encodeHex(new Uint8Array([1]))).toBe('01');
    expect(encodeHex(new Uint8Array([16]))).toBe('10');
});

test('decodeHex converts hex string to Uint8Array', () => {
    expect(decodeHex('000f10ff')).toEqual(new Uint8Array([0, 15, 16, 255]));
});

test('decodeHex handles empty string', () => {
    expect(decodeHex('')).toEqual(new Uint8Array([]));
});

test('decodeHex handles uppercase hex', () => {
    expect(decodeHex('DEADBEEF')).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
});

test('decodeHex handles mixed case hex', () => {
    expect(decodeHex('DeAdBeEf')).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
});

test('decodeHex with single byte values', () => {
    expect(decodeHex('00')).toEqual(new Uint8Array([0]));
    expect(decodeHex('ff')).toEqual(new Uint8Array([255]));
    expect(decodeHex('01')).toEqual(new Uint8Array([1]));
    expect(decodeHex('10')).toEqual(new Uint8Array([16]));
});

test('hex round-trip conversion', () => {
    const original = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0xff]);
    const hex = encodeHex(original);
    const result = decodeHex(hex);
    expect(result).toEqual(original);
});

// #region mina_codec.ts tests (using mock to trigger fallback implementation)

describe('mina_codec fallback implementation', () => {
    let encodeUtf8Mina: (data: string) => Uint8Array<ArrayBuffer>;
    let decodeUtf8Mina: (data: BufferSource) => string;

    beforeAll(async () => {
        // Mock wx global without encode/decode methods to trigger fallback implementation
        vi.stubGlobal('wx', {});

        // Clear module cache to ensure fresh import with mocked wx
        vi.resetModules();

        // Dynamically import the mina_codec module
        const minaCodec = await import('../src/std/codec/utf8/mina_utf8.ts');
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

// #region web_utf8.ts fallback tests (when TextEncoder/TextDecoder are not available)

describe('web_utf8 fallback implementation', () => {
    let encodeUtf8Web: (data: string) => Uint8Array<ArrayBuffer>;
    let decodeUtf8Web: (data: BufferSource) => string;
    let originalTextEncoder: typeof TextEncoder;
    let originalTextDecoder: typeof TextDecoder;

    beforeAll(async () => {
        // Save original constructors
        originalTextEncoder = globalThis.TextEncoder;
        originalTextDecoder = globalThis.TextDecoder;

        // Remove TextEncoder/TextDecoder to trigger fallback
        // @ts-expect-error - intentionally removing for testing
        delete globalThis.TextEncoder;
        // @ts-expect-error - intentionally removing for testing
        delete globalThis.TextDecoder;

        // Clear module cache to ensure fresh import without TextEncoder/TextDecoder
        vi.resetModules();

        // Dynamically import the web_utf8 module
        const webUtf8 = await import('../src/std/codec/utf8/web_utf8.ts');
        encodeUtf8Web = webUtf8.encodeUtf8;
        decodeUtf8Web = webUtf8.decodeUtf8;
    });

    afterAll(() => {
        // Restore original constructors
        globalThis.TextEncoder = originalTextEncoder;
        globalThis.TextDecoder = originalTextDecoder;
    });

    test('encodeUtf8 converts ASCII string correctly without TextEncoder', () => {
        const str = 'Hello';
        const result = new Uint8Array(encodeUtf8Web(str));
        expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    test('encodeUtf8 handles empty string without TextEncoder', () => {
        const result = new Uint8Array(encodeUtf8Web(''));
        expect(result).toEqual(new Uint8Array([]));
    });

    test('encodeUtf8 encodes 2-byte UTF-8 characters without TextEncoder', () => {
        // 'é' (U+00E9) should be encoded as [0xC3, 0xA9]
        const str = 'é';
        const result = new Uint8Array(encodeUtf8Web(str));
        expect(result).toEqual(new Uint8Array([0xc3, 0xa9]));
    });

    test('encodeUtf8 encodes 3-byte UTF-8 characters (Chinese) without TextEncoder', () => {
        // '中' (U+4E2D) should be encoded as [0xE4, 0xB8, 0xAD]
        const str = '中';
        const result = new Uint8Array(encodeUtf8Web(str));
        expect(result).toEqual(new Uint8Array([0xe4, 0xb8, 0xad]));
    });

    test('encodeUtf8 encodes 4-byte UTF-8 characters (emoji) without TextEncoder', () => {
        // '😀' (U+1F600) should be encoded as [0xF0, 0x9F, 0x98, 0x80]
        const str = '😀';
        const result = new Uint8Array(encodeUtf8Web(str));
        expect(result).toEqual(new Uint8Array([0xf0, 0x9f, 0x98, 0x80]));
    });

    test('encodeUtf8 handles mixed characters without TextEncoder', () => {
        const str = 'A中😀';
        const result = new Uint8Array(encodeUtf8Web(str));
        // 'A' = [0x41], '中' = [0xE4, 0xB8, 0xAD], '😀' = [0xF0, 0x9F, 0x98, 0x80]
        expect(result).toEqual(new Uint8Array([0x41, 0xe4, 0xb8, 0xad, 0xf0, 0x9f, 0x98, 0x80]));
    });

    test('decodeUtf8 decodes ASCII correctly without TextDecoder', () => {
        const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
        expect(decodeUtf8Web(buffer)).toBe('Hello');
    });

    test('decodeUtf8 handles empty buffer without TextDecoder', () => {
        const buffer = new ArrayBuffer(0);
        expect(decodeUtf8Web(buffer)).toBe('');
    });

    test('decodeUtf8 decodes 2-byte UTF-8 characters without TextDecoder', () => {
        // 'é' (U+00E9) encoded as [0xC3, 0xA9]
        const buffer = new Uint8Array([0xc3, 0xa9]).buffer;
        expect(decodeUtf8Web(buffer)).toBe('é');
    });

    test('decodeUtf8 decodes 3-byte UTF-8 characters (Chinese) without TextDecoder', () => {
        // '中' (U+4E2D) encoded as [0xE4, 0xB8, 0xAD]
        const buffer = new Uint8Array([0xe4, 0xb8, 0xad]).buffer;
        expect(decodeUtf8Web(buffer)).toBe('中');
    });

    test('decodeUtf8 decodes 4-byte UTF-8 characters (emoji) without TextDecoder', () => {
        // '😀' (U+1F600) encoded as [0xF0, 0x9F, 0x98, 0x80]
        const buffer = new Uint8Array([0xf0, 0x9f, 0x98, 0x80]).buffer;
        expect(decodeUtf8Web(buffer)).toBe('😀');
    });

    test('decodeUtf8 decodes mixed characters without TextDecoder', () => {
        // 'A中😀'
        const buffer = new Uint8Array([0x41, 0xe4, 0xb8, 0xad, 0xf0, 0x9f, 0x98, 0x80]).buffer;
        expect(decodeUtf8Web(buffer)).toBe('A中😀');
    });

    test('decodeUtf8 throws on invalid UTF-8 byte sequence without TextDecoder', () => {
        // 0xF8 is invalid UTF-8 start byte (5-byte sequence, not valid in UTF-8)
        const buffer = new Uint8Array([0xf8, 0x80, 0x80, 0x80]).buffer;
        expect(() => decodeUtf8Web(buffer)).toThrow('Invalid UTF-8 byte sequence');
    });

    test('encodeUtf8 and decodeUtf8 round-trip without TextEncoder/TextDecoder', () => {
        const testCases = [
            'Hello, World!',
            '你好，世界！',
            '🎮🎲🎯',
            'Mixed: Hello 你好 🌍',
            '',
            'Special chars: \t\n\r',
        ];

        for (const original of testCases) {
            const encoded = encodeUtf8Web(original);
            const decoded = decodeUtf8Web(encoded);
            expect(decoded).toBe(original);
        }
    });
});

// #endregion

// #region base64 tests

test('encode/decode string to/from base64', () => {
    const data = 'minigame-std';
    const encodedData = 'bWluaWdhbWUtc3Rk';
    const data1 = '中文';
    const encodedData1 = '5Lit5paH';

    expect(encodeBase64(data)).toBe(encodedData);
    expect(new TextDecoder().decode(decodeBase64(encodedData))).toBe(data);

    expect(encodeBase64(data1)).toBe(encodedData1);
    expect(new TextDecoder().decode(decodeBase64(encodedData1))).toBe(data1);
});

test('encodeBase64 encodes Uint8Array to base64 string', () => {
    // Test with simple ASCII data
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    expect(encodeBase64(data)).toBe('SGVsbG8=');

    // Test with empty array
    expect(encodeBase64(new Uint8Array([]))).toBe('');

    // Test with single byte
    expect(encodeBase64(new Uint8Array([65]))).toBe('QQ==');

    // Test with two bytes
    expect(encodeBase64(new Uint8Array([65, 66]))).toBe('QUI=');

    // Test with three bytes (no padding needed)
    expect(encodeBase64(new Uint8Array([65, 66, 67]))).toBe('QUJD');
});

test('encodeBase64 encodes ArrayBuffer to base64 string', () => {
    const buffer = new ArrayBuffer(5);
    const view = new Uint8Array(buffer);
    view.set([72, 101, 108, 108, 111]); // "Hello"
    expect(encodeBase64(buffer)).toBe('SGVsbG8=');
});

test('decodeBase64 decodes base64 string to Uint8Array', () => {
    // Test with simple ASCII data
    const result = decodeBase64('SGVsbG8=');
    expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));

    // Test with empty string
    expect(decodeBase64('')).toEqual(new Uint8Array([]));

    // Test with single byte (double padding)
    expect(decodeBase64('QQ==')).toEqual(new Uint8Array([65]));

    // Test with two bytes (single padding)
    expect(decodeBase64('QUI=')).toEqual(new Uint8Array([65, 66]));

    // Test with three bytes (no padding)
    expect(decodeBase64('QUJD')).toEqual(new Uint8Array([65, 66, 67]));
});

test('base64 round-trip conversion', () => {
    const originalData = encodeUtf8('Hello, 世界! 🎮');
    const encoded = encodeBase64(originalData);
    const decoded = decodeBase64(encoded);

    expect(decoded).toEqual(originalData);
});

test('encodeBase64 with DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 72, 101, 108, 108, 111, 0]);

    // Create a DataView with offset
    const dataView = new DataView(buffer, 2, 5);
    expect(encodeBase64(dataView)).toBe('SGVsbG8=');
});

test('base64 handles binary data correctly', () => {
    // Test with all possible byte values (0-255)
    const allBytes = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        allBytes[i] = i;
    }

    const encoded = encodeBase64(allBytes);
    const decoded = decodeBase64(encoded);

    expect(decoded).toEqual(allBytes);
});

test('encodeBase64 encodes string to base64', () => {
    expect(encodeBase64('minigame-std')).toBe('bWluaWdhbWUtc3Rk');
    expect(encodeBase64('中文')).toBe('5Lit5paH');
    expect(encodeBase64('')).toBe('');
});

test('decodeBase64 decodes base64 to Uint8Array', () => {
    expect(new TextDecoder().decode(decodeBase64('bWluaWdhbWUtc3Rk'))).toBe('minigame-std');
    expect(new TextDecoder().decode(decodeBase64('5Lit5paH'))).toBe('中文');
    expect(decodeBase64('')).toEqual(new Uint8Array([]));
});

test('base64 round-trip conversion with string', () => {
    const testStrings = ['Hello, World!', '中文测试', 'emoji 🎮🎯', ''];
    for (const str of testStrings) {
        expect(new TextDecoder().decode(decodeBase64(encodeBase64(str)))).toBe(str);
    }
});

test('encodeBase64 supports DataSource types', () => {
    // 字符串输入
    expect(encodeBase64('Hello')).toBe('SGVsbG8=');

    // Uint8Array 输入
    expect(encodeBase64(new Uint8Array([72, 101, 108, 108, 111]))).toBe('SGVsbG8=');

    // ArrayBuffer 输入
    const buffer = new ArrayBuffer(5);
    new Uint8Array(buffer).set([72, 101, 108, 108, 111]);
    expect(encodeBase64(buffer)).toBe('SGVsbG8=');
});

// #endregion
