/**
 * 测试小游戏环境下的 target.ts - Android 平台
 */
import { expect, test, vi } from 'vitest';

vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;
    (globalThis as Record<string, unknown>)['wx'] = {
        getDeviceInfo: () => ({
            platform: 'Android',
            model: 'Pixel 7',
            brand: 'Google',
            system: 'Android 13',
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

test('should detect Android platform', () => {
    expect(isMiniGameAndroid()).toBe(true);
    expect(isMiniGameRuntime()).toBe(true);
    expect(isMiniGameDevtools()).toBe(false);
    expect(isMiniGameIOS()).toBe(false);
    expect(isMiniGameWin()).toBe(false);
    expect(isMiniGameMac()).toBe(false);
    expect(isMiniGameHarmonyOS()).toBe(false);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
