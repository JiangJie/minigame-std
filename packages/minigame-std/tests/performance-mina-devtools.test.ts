/**
 * 测试小游戏环境下的 performance/mod.ts (devtools 环境)
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx.getDeviceInfo 返回 devtools 平台
    (globalThis as Record<string, unknown>)['wx'] = {
        getPerformance: () => ({
            now: () => 1000, // devtools 返回毫秒
        }),
        getDeviceInfo: () => ({
            platform: 'devtools',
        }),
    };
});

import { getPerformanceNow } from '../src/std/performance/mod.ts';

test('getPerformanceNow returns performance time in minigame devtools environment', () => {
    const now = getPerformanceNow();

    // devtools 环境返回的已经是毫秒，不需要除以 1000
    expect(now).toBe(1000);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
