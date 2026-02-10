/**
 * 测试小游戏环境下的 codec/utf8/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // wx 环境不需要特殊 mock，因为小游戏 UTF-8 实现使用内置的 ArrayBuffer 操作
    (globalThis as Record<string, unknown>)['wx'] = {};
});

import { decodeUtf8, encodeUtf8 } from '../src/std/codec/mod.ts';

test('encodeUtf8 encodes string to Uint8Array in minigame environment', () => {
    const result = encodeUtf8('你好');

    expect(result).toBeInstanceOf(Uint8Array);
    // UTF-8 编码的"你好"是 6 字节
    expect(result.length).toBe(6);
    expect(Array.from(result)).toEqual([228, 189, 160, 229, 165, 189]);
});

test('decodeUtf8 decodes Uint8Array to string in minigame environment', () => {
    const data = new Uint8Array([228, 189, 160, 229, 165, 189]);

    const result = decodeUtf8(data);

    expect(result).toBe('你好');
});

test('encodeUtf8 and decodeUtf8 round trip in minigame environment', () => {
    const original = 'Hello, 世界!';
    const encoded = encodeUtf8(original);
    const decoded = decodeUtf8(encoded);

    expect(decoded).toBe(original);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
