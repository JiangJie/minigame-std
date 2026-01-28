/**
 * 测试小游戏环境下的 performance/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx.getDeviceInfo 返回非 devtools 平台
    (globalThis as Record<string, unknown>)['wx'] = {
        getPerformance: () => ({
            now: () => 1000000, // 返回微秒
        }),
        getDeviceInfo: () => ({
            platform: 'ios',
        }),
    };
});

import { getPerformanceNow } from '../src/std/performance/mod.ts';

test('getPerformanceNow returns performance time in minigame environment', () => {
    const now = getPerformanceNow();

    // 小游戏环境返回的是微秒，需要除以 1000 转换为毫秒
    // 非 devtools 环境下会除以 1000
    expect(now).toBe(1000); // 1000000 / 1000 = 1000
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
