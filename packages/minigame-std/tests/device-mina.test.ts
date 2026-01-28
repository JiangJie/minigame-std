/**
 * 测试小游戏环境下的 device.ts
 *
 * 注意：由于模块缓存的存在，这个测试文件需要在模块加载之前就设置好 mock
 */
import { expect, test, vi } from 'vitest';

// Mock 小游戏的设备信息
const mockMinaDeviceInfo = {
    benchmarkLevel: 30,
    brand: 'Apple',
    memorySize: 4096,
    model: 'iPhone 14',
    platform: 'ios' as const,
    system: 'iOS 16.0',
};

const mockMinaWindowInfo = {
    pixelRatio: 3,
    screenHeight: 844,
    screenTop: 0,
    screenWidth: 390,
    windowHeight: 844,
    windowWidth: 390,
    statusBarHeight: 47,
    safeArea: {
        left: 0,
        right: 390,
        top: 47,
        bottom: 778,
        width: 390,
        height: 731,
    },
};

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    // Mock __MINIGAME_STD_MINA__ 编译时宏
    // Mock __MINIGAME_STD_MINA__ 编译时宏
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // Mock wx 全局对象
    // Mock wx 全局对象
    (globalThis as Record<string, unknown>)['wx'] = {
        getDeviceInfo: () => mockMinaDeviceInfo,
        getSystemInfoSync: () => mockMinaDeviceInfo,
        getWindowInfo: () => mockMinaWindowInfo,
        getDeviceBenchmarkInfo: ({ success }: { success: (res: { benchmarkLevel: number; }) => void; }) => {
            success({ benchmarkLevel: 35 });
        },
    };
});

// 现在导入模块，它会使用我们设置的小游戏环境
import { getDeviceBenchmarkLevel, getDeviceInfo, getWindowInfo } from '../src/std/platform/device.ts';

test('getDeviceInfo uses wx.getDeviceInfo in minigame environment', () => {
    const deviceInfo = getDeviceInfo();

    expect(deviceInfo.platform).toBe('ios');
    expect(deviceInfo.brand).toBe('Apple');
    expect(deviceInfo.memorySize).toBe(4096);
    expect(deviceInfo.model).toBe('iPhone 14');
});

test('getWindowInfo uses wx.getWindowInfo in minigame environment', () => {
    const windowInfo = getWindowInfo();

    expect(windowInfo.pixelRatio).toBe(3);
    expect(windowInfo.windowWidth).toBe(390);
    expect(windowInfo.windowHeight).toBe(844);
    expect(windowInfo.statusBarHeight).toBe(47);
});

test('getDeviceBenchmarkLevel uses wx.getDeviceBenchmarkInfo in minigame environment', async () => {
    const result = await getDeviceBenchmarkLevel();

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(35);
});

test('getDeviceBenchmarkLevel returns cached value on subsequent calls', async () => {
    // 第一次调用
    const result1 = await getDeviceBenchmarkLevel();
    expect(result1.unwrap()).toBe(35);

    // 第二次调用应该返回缓存值
    const result2 = await getDeviceBenchmarkLevel();
    expect(result2.unwrap()).toBe(35);
});

// 清理 mock
test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
