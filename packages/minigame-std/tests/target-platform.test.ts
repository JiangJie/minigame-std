/**
 * 测试小游戏环境下的 target.ts - iOS 平台
 *
 * 注意：由于模块缓存的存在，这个测试文件需要在模块加载之前就设置好 mock
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;
    (globalThis as Record<string, unknown>)['wx'] = {
        getDeviceInfo: () => ({
            platform: 'iOS',
            model: 'iPhone 14',
            brand: 'Apple',
            system: 'iOS 16.0',
        }),
    };
});

import {
    isMiniGameAndroid,
    isMiniGameDevtools,
    isMiniGameHarmonyOS,
    isMiniGameIOS,
    isMiniGameMac,
    isMiniGameRuntime,
    isMiniGameWin,
} from '../src/std/platform/target.ts';

test('should detect iOS platform', () => {
    expect(isMiniGameIOS()).toBe(true);
    expect(isMiniGameRuntime()).toBe(true);
    expect(isMiniGameDevtools()).toBe(false);
    expect(isMiniGameAndroid()).toBe(false);
    expect(isMiniGameWin()).toBe(false);
    expect(isMiniGameMac()).toBe(false);
    expect(isMiniGameHarmonyOS()).toBe(false);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});