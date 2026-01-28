/**
 * 测试小游戏环境下的 network/mod.ts
 */
import { expect, test, vi } from 'vitest';

type NetworkCallback = (res: { networkType: string; isConnected: boolean; }) => void;
let networkListeners: NetworkCallback[] = [];

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    (globalThis as Record<string, unknown>)['wx'] = {
        getNetworkType: (options: {
            success: (res: { networkType: string; }) => void;
            fail: (err: Error) => void;
        }) => {
            options.success({ networkType: 'wifi' });
        },
        onNetworkStatusChange: (callback: NetworkCallback) => {
            networkListeners.push(callback);
        },
        offNetworkStatusChange: (callback: NetworkCallback) => {
            networkListeners = networkListeners.filter(cb => cb !== callback);
        },
    };
});

import { addNetworkChangeListener, getNetworkType } from '../src/std/network/mod.ts';

test('getNetworkType returns network type in minigame environment', async () => {
    const networkType = await getNetworkType();

    expect(networkType).toBe('wifi');
});

test('addNetworkChangeListener adds and removes listener in minigame environment', () => {
    const mockListener = vi.fn();
    const removeListener = addNetworkChangeListener(mockListener);

    expect(networkListeners.length).toBe(1);

    // 模拟触发网络状态变化
    networkListeners[0]({ networkType: '4g', isConnected: true });
    expect(mockListener).toHaveBeenCalledWith('4g');

    // 移除监听器
    removeListener();
    expect(networkListeners.length).toBe(0);
});

test('addNetworkChangeListener returns none when isConnected is false', () => {
    const mockListener = vi.fn();
    const removeListener = addNetworkChangeListener(mockListener);

    expect(networkListeners.length).toBe(1);

    // 模拟网络断开连接
    networkListeners[0]({ networkType: 'wifi', isConnected: false });
    expect(mockListener).toHaveBeenCalledWith('none');

    // 移除监听器
    removeListener();
    expect(networkListeners.length).toBe(0);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
