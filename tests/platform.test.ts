import { expect, test } from 'vitest';
import { platform } from '../src/mod.ts';

test('targetType is web', () => {
    expect(platform.isWeb()).toBe(true);
    expect(platform.isMiniGame()).toBe(false);
});

test('getTargetType returns web', () => {
    const targetType = platform.getTargetType();
    expect(targetType).toBe('web');
});

test('platform detection is consistent', () => {
    // All platform detection methods should be consistent
    const isWeb = platform.isWeb();
    const isMiniGame = platform.isMiniGame();
    const targetType = platform.getTargetType();

    if (isWeb) {
        expect(isMiniGame).toBe(false);
        expect(targetType).toBe('web');
    }

    if (isMiniGame) {
        expect(isWeb).toBe(false);
        expect(targetType).toBe('minigame');
    }
});

test('getDeviceBenchmarkLevel returns -2 in web environment', async () => {
    const result = await platform.getDeviceBenchmarkLevel();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(-2);
});

// MiniGame specific functions return false in web environment
test('isMiniGameRuntime returns false in web', () => {
    expect(platform.isMiniGameRuntime()).toBe(false);
});

test('isMiniGameDevtools returns false in web', () => {
    expect(platform.isMiniGameDevtools()).toBe(false);
});

test('isMiniGameIOS returns false in web', () => {
    expect(platform.isMiniGameIOS()).toBe(false);
});

test('isMiniGameAndroid returns false in web', () => {
    expect(platform.isMiniGameAndroid()).toBe(false);
});

test('isMiniGameWin returns false in web', () => {
    expect(platform.isMiniGameWin()).toBe(false);
});

test('isMiniGameMac returns false in web', () => {
    expect(platform.isMiniGameMac()).toBe(false);
});

test('isMiniGameHarmonyOS returns false in web', () => {
    expect(platform.isMiniGameHarmonyOS()).toBe(false);
});

test('getWindowInfo returns valid window information', () => {
    const windowInfo = platform.getWindowInfo();

    // Check all required properties exist
    expect(windowInfo).toHaveProperty('pixelRatio');
    expect(windowInfo).toHaveProperty('screenHeight');
    expect(windowInfo).toHaveProperty('screenTop');
    expect(windowInfo).toHaveProperty('screenWidth');
    expect(windowInfo).toHaveProperty('windowHeight');
    expect(windowInfo).toHaveProperty('windowWidth');

    // In web environment, values should be from window/screen objects
    expect(typeof windowInfo.pixelRatio).toBe('number');
    expect(typeof windowInfo.screenHeight).toBe('number');
    expect(typeof windowInfo.screenTop).toBe('number');
    expect(typeof windowInfo.screenWidth).toBe('number');
    expect(typeof windowInfo.windowHeight).toBe('number');
    expect(typeof windowInfo.windowWidth).toBe('number');

    // Values should be positive (or zero for screenTop)
    expect(windowInfo.pixelRatio).toBeGreaterThan(0);
    expect(windowInfo.screenHeight).toBeGreaterThan(0);
    expect(windowInfo.screenTop).toBeGreaterThanOrEqual(0);
    expect(windowInfo.screenWidth).toBeGreaterThan(0);
    expect(windowInfo.windowHeight).toBeGreaterThan(0);
    expect(windowInfo.windowWidth).toBeGreaterThan(0);
});

test('getWindowInfo values match web platform globals', () => {
    const windowInfo = platform.getWindowInfo();

    // In web environment, these should match the global values
    expect(windowInfo.pixelRatio).toBe(devicePixelRatio);
    expect(windowInfo.screenHeight).toBe(screen.height);
    expect(windowInfo.screenTop).toBe(screenTop);
    expect(windowInfo.screenWidth).toBe(screen.width);
    expect(windowInfo.windowHeight).toBe(innerHeight);
    expect(windowInfo.windowWidth).toBe(innerWidth);
});

test('TargetType is either minigame or web', () => {
    const targetType = platform.getTargetType();
    expect(['minigame', 'web']).toContain(targetType);
});

test('isWeb and isMiniGame are mutually exclusive', () => {
    const isWeb = platform.isWeb();
    const isMiniGame = platform.isMiniGame();

    // Exactly one should be true
    expect(isWeb !== isMiniGame).toBe(true);
});

test('all isMiniGame* functions return false when not in minigame environment', () => {
    // When isWeb() is true, all minigame-specific checks should be false
    if (platform.isWeb()) {
        expect(platform.isMiniGameRuntime()).toBe(false);
        expect(platform.isMiniGameDevtools()).toBe(false);
        expect(platform.isMiniGameIOS()).toBe(false);
        expect(platform.isMiniGameAndroid()).toBe(false);
        expect(platform.isMiniGameWin()).toBe(false);
        expect(platform.isMiniGameMac()).toBe(false);
        expect(platform.isMiniGameHarmonyOS()).toBe(false);
    }
});

test('getDeviceBenchmarkLevel is cached after first call', async () => {
    const result1 = await platform.getDeviceBenchmarkLevel();
    const result2 = await platform.getDeviceBenchmarkLevel();

    expect(result1.isOk()).toBe(true);
    expect(result2.isOk()).toBe(true);
    expect(result1.unwrap()).toBe(result2.unwrap());
});
