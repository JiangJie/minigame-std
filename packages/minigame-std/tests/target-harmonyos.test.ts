/**
 * 测试小游戏环境下的 target.ts - HarmonyOS 平台
 */
import { expect, test, vi } from 'vite-plus/test';

vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;
    (globalThis as Record<string, unknown>)['wx'] = {
        getDeviceInfo: () => ({
            platform: 'ohos',
            model: 'Mate 60',
            brand: 'Huawei',
            system: 'HarmonyOS 4.0',
        }),
    };
});

import {
    isMiniGameAndroid,
    isMiniGameDevtools,
    isMiniGameHarmonyOS,
    isMiniGameHarmonyPC,
    isMiniGameIOS,
    isMiniGameMac,
    isMiniGameRuntime,
    isMiniGameWin,
} from '../src/std/platform/target.ts';

test('should detect HarmonyOS platform', () => {
    expect(isMiniGameHarmonyOS()).toBe(true);
    expect(isMiniGameHarmonyPC()).toBe(false);
    expect(isMiniGameRuntime()).toBe(true);
    expect(isMiniGameDevtools()).toBe(false);
    expect(isMiniGameIOS()).toBe(false);
    expect(isMiniGameAndroid()).toBe(false);
    expect(isMiniGameWin()).toBe(false);
    expect(isMiniGameMac()).toBe(false);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
