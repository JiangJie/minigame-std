/**
 * 测试小游戏环境下 wx.getDeviceBenchmarkInfo 不存在时的 fallback 逻辑
 *
 * 这个场景需要单独的测试文件，因为模块级别的 OnceAsync 缓存会导致
 * 同一文件中的多个测试相互影响
 */
import { expect, test, vi } from 'vitest';

// Mock 小游戏的设备信息（包含 benchmarkLevel）
const mockMinaDeviceInfo = {
    benchmarkLevel: 25, // fallback 时使用这个值
    brand: 'Xiaomi',
    memorySize: 8192,
    model: 'Mi 12',
    platform: 'android' as const,
    system: 'Android 13',
};

const mockMinaWindowInfo = {
    pixelRatio: 2.75,
    screenHeight: 2400,
    screenTop: 0,
    screenWidth: 1080,
    windowHeight: 2400,
    windowWidth: 1080,
    statusBarHeight: 40,
    safeArea: {
        left: 0,
        right: 1080,
        top: 40,
        bottom: 2340,
        width: 1080,
        height: 2300,
    },
};

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    // Mock __MINIGAME_STD_MINA__ 编译时宏
    // Mock __MINIGAME_STD_MINA__ 编译时宏
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx 全局对象，不包含 getDeviceBenchmarkInfo
    // Mock wx 全局对象，不包含 getDeviceBenchmarkInfo
    (globalThis as Record<string, unknown>)['wx'] = {
        getDeviceInfo: () => mockMinaDeviceInfo,
        getSystemInfoSync: () => mockMinaDeviceInfo,
        getWindowInfo: () => mockMinaWindowInfo,
        // 注意：不提供 getDeviceBenchmarkInfo，测试 fallback 逻辑
    };
});

// 现在导入模块
import { getDeviceBenchmarkLevel } from '../src/std/platform/device.ts';

test('getDeviceBenchmarkLevel falls back to getDeviceInfo().benchmarkLevel when wx.getDeviceBenchmarkInfo is not available', async () => {
    const result = await getDeviceBenchmarkLevel();

    expect(result.isOk()).toBe(true);
    // 应该使用 mockMinaDeviceInfo.benchmarkLevel = 25
    expect(result.unwrap()).toBe(25);
});

// 清理 mock
test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
