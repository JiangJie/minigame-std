/**
 * 测试小游戏环境下的 codec/utf8/mod.ts
 * 使用 wx.encode 和 wx.decode 方法
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx.encode 和 wx.decode 方法
    (globalThis as Record<string, unknown>)['wx'] = {
        encode: (options: { data: string; format: string; }): ArrayBuffer => {
            // 模拟 UTF-8 编码
            const encoder = new TextEncoder();
            const uint8 = encoder.encode(options.data);
            return uint8.buffer as ArrayBuffer;
        },
        decode: (options: { data: ArrayBuffer; format: string; }): string => {
            // 模拟 UTF-8 解码
            const decoder = new TextDecoder();
            return decoder.decode(options.data);
        },
    };
});

import { decodeUtf8, encodeUtf8 } from '../src/std/codec/mod.ts';

test('encodeUtf8 uses wx.encode when available', () => {
    const result = encodeUtf8('你好');

    expect(result).toBeInstanceOf(Uint8Array);
    // UTF-8 编码的"你好"是 6 字节
    expect(result.length).toBe(6);
    expect(Array.from(result)).toEqual([228, 189, 160, 229, 165, 189]);
});

test('decodeUtf8 uses wx.decode when available', () => {
    const data = new Uint8Array([228, 189, 160, 229, 165, 189]);

    const result = decodeUtf8(data);

    expect(result).toBe('你好');
});

test('encodeUtf8 and decodeUtf8 round trip with wx.encode/decode', () => {
    const original = 'Hello, 世界!';
    const encoded = encodeUtf8(original);
    const decoded = decodeUtf8(encoded);

    expect(decoded).toBe(original);
});

test('decodeUtf8 handles ArrayBuffer input', () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode('测试').buffer;

    const result = decodeUtf8(buffer);

    expect(result).toBe('测试');
});

test('decodeUtf8 with default options uses wx.decode and replaces invalid bytes', () => {
    const invalidBytes = new Uint8Array([0xff, 0xfe]);
    const result = decodeUtf8(invalidBytes);

    // wx.decode mock 使用 TextDecoder 默认行为：替换为 U+FFFD
    expect(result).toBe('\uFFFD\uFFFD');
});

test('decodeUtf8 with fatal=true falls back to webDecodeUtf8 and throws', () => {
    const invalidBytes = new Uint8Array([0xff, 0xfe]);

    // fatal=true 会回退到 webDecodeUtf8，抛出异常
    expect(() => decodeUtf8(invalidBytes, { fatal: true })).toThrow();
});

test('decodeUtf8 with ignoreBOM=true falls back to webDecodeUtf8 and preserves BOM', () => {
    // UTF-8 BOM (EF BB BF) + 'Hi'
    const withBOM = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]);
    const result = decodeUtf8(withBOM, { ignoreBOM: true });

    expect(result).toBe('\uFEFFHi');
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
