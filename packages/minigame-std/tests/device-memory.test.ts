import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行
// 设置 deviceMemory 为 undefined 来覆盖 ?? 0 的右侧分支（fallback）
const originalDeviceMemory = vi.hoisted(() => {
    const original = (navigator as Navigator & { deviceMemory?: number; }).deviceMemory;
    Object.defineProperty(navigator, 'deviceMemory', {
        value: undefined,
        configurable: true,
        writable: true,
    });
    return original;
});

// 现在导入模块，它会使用我们设置的 deviceMemory = undefined
import { getDeviceInfo } from '../src/std/platform/device.ts';

test('getDeviceInfo returns 0 memorySize when deviceMemory is undefined', () => {
    const deviceInfo = getDeviceInfo();
    // undefined ?? 0 => 0, 0 * 1024 = 0
    expect(deviceInfo.memorySize).toBe(0);
});

// 测试结束后恢复原始状态
test.afterAll(() => {
    if (originalDeviceMemory !== undefined) {
        Object.defineProperty(navigator, 'deviceMemory', {
            value: originalDeviceMemory,
            configurable: true,
            writable: true,
        });
    }
});
