/**
 * 测试鸿蒙微信小游戏环境下的 encodeUtf8 行为
 * 鸿蒙平台的 wx.encode 实现存在 bug, 应回退到 happy-codec 的 webEncodeUtf8
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx: 提供有 bug 的 wx.encode, 但鸿蒙平台应跳过它
    (globalThis as Record<string, unknown>)['wx'] = {
        // 返回鸿蒙平台 ohos, 触发 isMiniGameHarmonyOS() === true
        getDeviceInfo: () => ({ platform: 'ohos' }),
        encode: (): ArrayBuffer => {
            // 模拟鸿蒙平台的 bug: 返回错误的编码结果（空 ArrayBuffer）
            return new ArrayBuffer(0);
        },
        decode: (options: { data: ArrayBuffer; format: string; }): string => {
            // 模拟 UTF-8 解码（decode 不受影响）
            const decoder = new TextDecoder();
            return decoder.decode(options.data);
        },
    };
});

import { decodeUtf8, encodeUtf8 } from '../src/std/codec/mod.ts';

test('encodeUtf8 skips buggy wx.encode on HarmonyOS platform', () => {
    // 鸿蒙平台的 wx.encode 存在 bug, 应回退到 webEncodeUtf8 而不是使用 wx.encode
    const result = encodeUtf8('你好');

    expect(result).toBeInstanceOf(Uint8Array);
    // UTF-8 编码的"你好"是 6 字节, 而不是鸿蒙 bug 返回的 0 字节
    expect(result.length).toBe(6);
    expect(Array.from(result)).toEqual([228, 189, 160, 229, 165, 189]);
});

test('encodeUtf8 and decodeUtf8 round trip on HarmonyOS platform', () => {
    // 鸿蒙平台 encode 走 webEncodeUtf8, decode 走 wx.decode (默认 options)
    const original = 'Hello, 世界!';
    const encoded = encodeUtf8(original);
    const decoded = decodeUtf8(encoded);

    expect(decoded).toBe(original);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
