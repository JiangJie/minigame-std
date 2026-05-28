/**
 * 测试小游戏环境下的 target.ts - HarmonyOS PC 平台
 */
import { expect, test, vi } from 'vitest';

vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;
    (globalThis as Record<string, unknown>)['wx'] = {
        getDeviceInfo: () => ({
            platform: 'ohos_pc',
            model: 'MateStation',
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

test('should detect HarmonyOS PC platform', () => {
    expect(isMiniGameHarmonyPC()).toBe(true);
    expect(isMiniGameRuntime()).toBe(true);
    expect(isMiniGameDevtools()).toBe(false);
    expect(isMiniGameHarmonyOS()).toBe(false);
    expect(isMiniGameIOS()).toBe(false);
    expect(isMiniGameAndroid()).toBe(false);
    expect(isMiniGameWin()).toBe(false);
    expect(isMiniGameMac()).toBe(false);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
