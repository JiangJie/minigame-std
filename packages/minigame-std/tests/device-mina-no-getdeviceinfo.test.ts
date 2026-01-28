/**
 * 测试小游戏环境下 wx.getDeviceInfo 不存在时的 fallback 逻辑
 *
 * 这个场景测试当 wx.getDeviceInfo 不存在时，fallback 到 wx.getSystemInfoSync
 */
import { expect, test, vi } from 'vitest';

// Mock 小游戏的设备信息
const mockMinaDeviceInfo = {
    benchmarkLevel: 20,
    brand: 'Huawei',
    memorySize: 6144,
    model: 'Mate 50',
    platform: 'android' as const,
    system: 'HarmonyOS 3.0',
};

const mockMinaWindowInfo = {
    pixelRatio: 3,
    screenHeight: 2340,
    screenTop: 0,
    screenWidth: 1080,
    windowHeight: 2340,
    windowWidth: 1080,
    statusBarHeight: 36,
    safeArea: {
        left: 0,
        right: 1080,
        top: 36,
        bottom: 2280,
        width: 1080,
        height: 2244,
    },
};

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    // Mock __MINIGAME_STD_MINA__ 编译时宏
    // Mock __MINIGAME_STD_MINA__ 编译时宏
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx 全局对象，不包含 getDeviceInfo（模拟低版本基础库）
    // Mock wx 全局对象，不包含 getDeviceInfo（模拟低版本基础库）
    (globalThis as Record<string, unknown>)['wx'] = {
        // 注意：不提供 getDeviceInfo，测试 fallback 到 getSystemInfoSync
        getSystemInfoSync: () => mockMinaDeviceInfo,
        getWindowInfo: () => mockMinaWindowInfo,
    };
});

// 现在导入模块
import { getDeviceInfo } from '../src/std/platform/device.ts';

test('getDeviceInfo falls back to wx.getSystemInfoSync when wx.getDeviceInfo is not available', () => {
    const deviceInfo = getDeviceInfo();

    // 应该使用 wx.getSystemInfoSync 返回的数据
    expect(deviceInfo.platform).toBe('android');
    expect(deviceInfo.brand).toBe('Huawei');
    expect(deviceInfo.memorySize).toBe(6144);
    expect(deviceInfo.model).toBe('Mate 50');
});

// 清理 mock
test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
