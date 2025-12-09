import { expect, test } from 'vitest';
import { platform } from 'minigame-std';

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
