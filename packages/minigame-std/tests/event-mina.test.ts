/**
 * 测试小游戏环境下的 event/mod.ts
 */
import { expect, test, vi } from 'vitest';

type ErrorCallback = (ev: { message: string; }) => void;
type RejectionCallback = (ev: { reason: unknown; promise: Promise<unknown>; }) => void;
type ResizeCallback = (ev: { windowWidth: number; windowHeight: number; }) => void;

let errorListeners: ErrorCallback[] = [];
let rejectionListeners: RejectionCallback[] = [];
let resizeListeners: ResizeCallback[] = [];

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    (globalThis as Record<string, unknown>)['wx'] = {
        onError: (callback: ErrorCallback) => {
            errorListeners.push(callback);
        },
        offError: (callback: ErrorCallback) => {
            errorListeners = errorListeners.filter(cb => cb !== callback);
        },
        onUnhandledRejection: (callback: RejectionCallback) => {
            rejectionListeners.push(callback);
        },
        offUnhandledRejection: (callback: RejectionCallback) => {
            rejectionListeners = rejectionListeners.filter(cb => cb !== callback);
        },
        onWindowResize: (callback: ResizeCallback) => {
            resizeListeners.push(callback);
        },
        offWindowResize: (callback: ResizeCallback) => {
            resizeListeners = resizeListeners.filter(cb => cb !== callback);
        },
    };
});

import { addErrorListener, addResizeListener, addUnhandledrejectionListener } from '../src/std/event/mod.ts';

test('addErrorListener adds and removes listener in minigame environment', () => {
    const mockListener = vi.fn();
    const removeListener = addErrorListener(mockListener);

    expect(errorListeners.length).toBe(1);

    // 模拟触发错误事件
    errorListeners[0]({ message: 'Test error' });
    expect(mockListener).toHaveBeenCalledWith({ message: 'Test error' });

    // 移除监听器
    removeListener();
    expect(errorListeners.length).toBe(0);
});

test('addUnhandledrejectionListener adds and removes listener in minigame environment', () => {
    const mockListener = vi.fn();
    const removeListener = addUnhandledrejectionListener(mockListener);

    expect(rejectionListeners.length).toBe(1);

    // 模拟触发 rejection 事件
    const testPromise = Promise.resolve();
    rejectionListeners[0]({ reason: 'Test rejection', promise: testPromise });
    expect(mockListener).toHaveBeenCalled();

    // 移除监听器
    removeListener();
    expect(rejectionListeners.length).toBe(0);
});

test('addResizeListener adds and removes listener in minigame environment', () => {
    const mockListener = vi.fn();
    const removeListener = addResizeListener(mockListener);

    expect(resizeListeners.length).toBe(1);

    // 模拟触发 resize 事件
    resizeListeners[0]({ windowWidth: 800, windowHeight: 600 });
    expect(mockListener).toHaveBeenCalledWith({ windowWidth: 800, windowHeight: 600 });

    // 移除监听器
    removeListener();
    expect(resizeListeners.length).toBe(0);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
