/**
 * 测试小游戏环境下的 crypto/random/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    (globalThis as Record<string, unknown>)['wx'] = {
        getUserCryptoManager: () => ({
            getRandomValues: (options: {
                length: number;
                success: (res: { randomValues: ArrayBuffer; }) => void;
                fail: (err: Error) => void;
            }) => {
                // 模拟返回随机数据
                const buffer = new ArrayBuffer(options.length);
                const view = new Uint8Array(buffer);
                for (let i = 0; i < options.length; i++) {
                    view[i] = Math.floor(Math.random() * 256);
                }
                options.success({ randomValues: buffer });
            },
        }),
    };
});

import { getRandomValues, randomUUID } from '../src/std/crypto/random/mod.ts';

test('getRandomValues returns random bytes in minigame environment', async () => {
    const result = await getRandomValues(16);

    expect(result.isOk()).toBe(true);
    const bytes = result.unwrap();
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(16);
});

test('randomUUID returns a valid UUID in minigame environment', async () => {
    const result = await randomUUID();

    expect(result.isOk()).toBe(true);
    const uuid = result.unwrap();
    // UUID v4 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
