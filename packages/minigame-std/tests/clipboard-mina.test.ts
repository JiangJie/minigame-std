/**
 * 测试小游戏环境下的 clipboard/mod.ts
 */
import { expect, test, vi } from 'vitest';

let clipboardData = '';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    (globalThis as Record<string, unknown>)['wx'] = {
        setClipboardData: (options: { data: string; success: () => void; fail: (err: Error) => void; }) => {
            clipboardData = options.data;
            options.success();
        },
        getClipboardData: (options: { success: (res: { data: string; }) => void; fail: (err: Error) => void; }) => {
            options.success({ data: clipboardData });
        },
    };
});

import { readText, writeText } from '../src/std/clipboard/mod.ts';

test('writeText writes text to clipboard in minigame environment', async () => {
    const result = await writeText('Hello, 小游戏!');

    expect(result.isOk()).toBe(true);
    expect(clipboardData).toBe('Hello, 小游戏!');
});

test('readText reads text from clipboard in minigame environment', async () => {
    clipboardData = 'Test clipboard content';

    const result = await readText();

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('Test clipboard content');
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
