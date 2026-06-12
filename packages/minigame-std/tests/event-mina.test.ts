/**
 * 测试小游戏环境下的 event/mod.ts
 */
import { expect, test, vi } from 'vitest';

type ErrorCallback = (ev: { message: string; }) => void;
type RejectionCallback = (ev: { reason: unknown; promise: Promise<unknown>; }) => void;
type ResizeCallback = (ev: { windowWidth: number; windowHeight: number; }) => void;
type ShowCallback = (ev: WechatMinigame.OnShowListenerResult) => void;
type HideCallback = (ev: WechatMinigame.GeneralCallbackResult) => void;

let errorListeners: ErrorCallback[] = [];
let rejectionListeners: RejectionCallback[] = [];
let resizeListeners: ResizeCallback[] = [];
let showListeners: ShowCallback[] = [];
let hideListeners: HideCallback[] = [];

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
        onShow: (callback: ShowCallback) => {
            showListeners.push(callback);
        },
        offShow: (callback: ShowCallback) => {
            showListeners = showListeners.filter(cb => cb !== callback);
        },
        onHide: (callback: HideCallback) => {
            hideListeners.push(callback);
        },
        offHide: (callback: HideCallback) => {
            hideListeners = hideListeners.filter(cb => cb !== callback);
        },
        getLaunchOptionsSync: () => ({
            query: { from: 'launch' },
            scene: 1001,
            referrerInfo: { appId: 'wx123', extraData: { key: 'value' } },
            chatType: 1,
            shareTicket: 'share_launch',
            hostExtraData: { host_scene: 10 },
        }),
        getEnterOptionsSync: () => ({
            query: { from: 'enter' },
            scene: 2002,
            referrerInfo: { appId: 'wx456', extraData: { key2: 'value2' } },
            chatType: 3,
            shareTicket: 'share_enter',
            apiCategory: 'default',
        }),
    };
});

import { addErrorListener, addHideListener, addResizeListener, addShowListener, addUnhandledrejectionListener, getEnterOptionsSync, getLaunchOptionsSync } from '../src/std/event/mod.ts';

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

test('addShowListener adds and removes listener in minigame environment', () => {
    const mockListener = vi.fn();
    const removeListener = addShowListener(mockListener);

    // 默认不立即回调
    expect(mockListener).not.toHaveBeenCalled();

    expect(showListeners.length).toBe(1);

    const showOptions: WechatMinigame.OnShowListenerResult = {
        query: {},
        referrerInfo: { appId: '', extraData: {} },
        scene: 1001,
    };
    showListeners[0](showOptions);
    expect(mockListener).toHaveBeenCalledWith(showOptions);

    removeListener();
    expect(showListeners.length).toBe(0);
});

test('addShowListener with fireImmediately=true fires immediately', () => {
    const mockListener = vi.fn();
    const removeListener = addShowListener(mockListener, { fireImmediately: true });

    // 注册时立即回调一次
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        query: { from: 'enter' },
        scene: 2002,
    }));

    expect(showListeners.length).toBe(1);

    // 后续 wx.onShow 事件仍正常触发
    const showOptions: WechatMinigame.OnShowListenerResult = {
        query: { from: 'new_enter' },
        referrerInfo: { appId: '', extraData: {} },
        scene: 3003,
    };
    showListeners[0](showOptions);
    expect(mockListener).toHaveBeenCalledTimes(2);
    expect(mockListener).toHaveBeenLastCalledWith(showOptions);

    removeListener();
    expect(showListeners.length).toBe(0);
});

test('getLaunchOptionsSync returns launch options with hostExtraData', () => {
    const options = getLaunchOptionsSync();
    expect(options.query).toEqual({ from: 'launch' });
    expect(options.scene).toBe(1001);
    expect(options.referrerInfo).toEqual({ appId: 'wx123', extraData: { key: 'value' } });
    expect(options.chatType).toBe(1);
    expect(options.shareTicket).toBe('share_launch');
    expect(options.hostExtraData).toEqual({ host_scene: 10 });
});

test('getEnterOptionsSync returns enter options with apiCategory', () => {
    const options = getEnterOptionsSync();
    expect(options.query).toEqual({ from: 'enter' });
    expect(options.scene).toBe(2002);
    expect(options.referrerInfo).toEqual({ appId: 'wx456', extraData: { key2: 'value2' } });
    expect(options.chatType).toBe(3);
    expect(options.shareTicket).toBe('share_enter');
    expect(options.apiCategory).toBe('default');
});

test('addHideListener adds and removes listener in minigame environment', () => {
    const mockListener = vi.fn();
    const removeListener = addHideListener(mockListener);

    expect(hideListeners.length).toBe(1);

    const hideOptions = { errMsg: 'hide:ok' };
    hideListeners[0](hideOptions);
    expect(mockListener).toHaveBeenCalledWith(hideOptions);

    removeListener();
    expect(hideListeners.length).toBe(0);
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
