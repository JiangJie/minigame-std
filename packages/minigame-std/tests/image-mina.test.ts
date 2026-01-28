/**
 * 测试小游戏环境下的 image/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock Image 类
    class MockImage {
        src = '';
        width = 100;
        height = 100;
        onload: (() => void) | null = null;
        onerror: ((err: Error) => void) | null = null;

        constructor() {
            // 模拟图片加载成功
            setTimeout(() => {
                if (this.onload) this.onload();
            }, 0);
        }
    }

    (globalThis as Record<string, unknown>)['wx'] = {
        createImage: () => new MockImage(),
    };
});

import { createImageFromFile, createImageFromUrl } from '../src/std/image/mod.ts';

test('createImageFromUrl creates image in minigame environment', () => {
    const image = createImageFromUrl('https://example.com/image.png');

    expect(image).toBeDefined();
    expect(image.src).toBe('https://example.com/image.png');
});

test('createImageFromFile creates image from file path in minigame environment', async () => {
    const result = await createImageFromFile('/local/path/image.png');

    expect(result.isOk()).toBe(true);
    const image = result.unwrap();
    expect(image.src).toBe('/local/path/image.png');
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
