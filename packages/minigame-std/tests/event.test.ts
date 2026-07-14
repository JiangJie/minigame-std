import { describe, expect, test, vi } from 'vitest';
import { addErrorListener, addHideListener, addResizeListener, addShowListener, addUnhandledrejectionListener, getEnterOptionsSync, getLaunchOptionsSync } from '../src/mod.ts';

test('addErrorListener and remove', () => {
    let errorCaught = false;
    let errorMessage = '';

    const listener = (ev: WechatMinigame.ListenerError) => {
        errorCaught = true;
        errorMessage = ev.message;
    };

    const removeListener = addErrorListener(listener);

    // Trigger an error
    const errorEvent = new ErrorEvent('error', {
        message: 'Test error message',
    });
    dispatchEvent(errorEvent);

    expect(errorCaught).toBe(true);
    expect(errorMessage).toBe('Test error message');

    // Remove listener and verify it doesn't fire
    removeListener();
    errorCaught = false;
    dispatchEvent(new ErrorEvent('error', { message: 'Another error' }));
    expect(errorCaught).toBe(false);
});

test('addErrorListener with error stack', () => {
    let errorMessage = '';

    const listener = (ev: WechatMinigame.ListenerError) => {
        errorMessage = ev.message;
    };

    const removeListener = addErrorListener(listener);

    // 创建带有 stack 的 Error 对象
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test.ts:1:1';

    // 触发带有 error.stack 的错误事件
    const errorEvent = new ErrorEvent('error', {
        message: 'Test error message',
        error,
    });
    dispatchEvent(errorEvent);

    // 验证 message 包含 stack 信息
    expect(errorMessage).toBe('Test error message\nError: Test error\n    at test.ts:1:1');

    removeListener();
});

test('addUnhandledrejectionListener and remove', async () => {
    let rejectionCaught = false;
    let rejectionReason = '';

    const listener = (ev: PromiseRejectionEvent) => {
        rejectionCaught = true;
        rejectionReason = ev.reason;
        // Prevent the default behavior to avoid test failure
        ev.preventDefault();
    };

    // @ts-expect-error: listener is not assignable to parameter of type '(ev: PromiseRejectionEvent) => void'
    const removeListener = addUnhandledrejectionListener(listener);

    // Dispatch the event manually for testing
    const promise = Promise.resolve(); // Use resolved promise to avoid uncaught rejection
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise,
        reason: 'Test rejection reason',
        cancelable: true,
    });
    dispatchEvent(rejectionEvent);

    // Wait a tick
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(rejectionCaught).toBe(true);
    expect(rejectionReason).toBe('Test rejection reason');

    // Remove listener - need to add a handler to prevent unhandled rejection error
    removeListener();
    rejectionCaught = false;

    // Add a temporary handler to catch the event and prevent vitest error
    const tempHandler = (ev: PromiseRejectionEvent) => {
        ev.preventDefault();
    };
    window.addEventListener('unhandledrejection', tempHandler);

    const anotherEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: 'Another rejection',
        cancelable: true,
    });
    dispatchEvent(anotherEvent);

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(rejectionCaught).toBe(false);

    window.removeEventListener('unhandledrejection', tempHandler);
});

test('addShowListener and remove', () => {
    let showCaught = false;
    let showOptions: WechatMinigame.OnShowListenerResult | undefined;

    const originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')
        ?? Object.getOwnPropertyDescriptor(document, 'visibilityState');
    history.pushState(null, '', '?roomId=42&name=%E6%B5%8B%E8%AF%95');
    const removeListener = addShowListener((options) => {
        showCaught = true;
        showOptions = options;
    });

    Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(showCaught).toBe(false);

    Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(showCaught).toBe(true);
    expect(showOptions?.query).toEqual({
        roomId: '42',
        name: '测试',
    });
    expect(showOptions?.scene).toBe(0);
    expect(showOptions?.referrerInfo.extraData).toEqual({});

    removeListener();
    showCaught = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(showCaught).toBe(false);

    history.pushState(null, '', location.pathname);
    if (originalVisibilityState) {
        Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
});

test('addHideListener and remove', () => {
    let hideCaught = false;

    const originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')
        ?? Object.getOwnPropertyDescriptor(document, 'visibilityState');
    const removeListener = addHideListener(() => {
        hideCaught = true;
    });

    Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(hideCaught).toBe(false);

    Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(hideCaught).toBe(true);

    removeListener();
    hideCaught = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(hideCaught).toBe(false);

    if (originalVisibilityState) {
        Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
});

test('addResizeListener and remove', () => {
    let resizeCaught = false;


    const listener = (_: Event) => {
        resizeCaught = true;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addResizeListener(listener as any);

    // Trigger a resize event (use Event instead of UIEvent for compatibility)
    const resizeEvent = new Event('resize');
    dispatchEvent(resizeEvent);

    expect(resizeCaught).toBe(true);

    // Remove listener and verify it doesn't fire
    removeListener();
    resizeCaught = false;
    dispatchEvent(new Event('resize'));
    expect(resizeCaught).toBe(false);
});

test('multiple error listeners', () => {
    let listener1Called = false;
    let listener2Called = false;

    const listener1 = () => { listener1Called = true; };
    const listener2 = () => { listener2Called = true; };

    const remove1 = addErrorListener(listener1);
    const remove2 = addErrorListener(listener2);

    dispatchEvent(new ErrorEvent('error', { message: 'Test' }));

    expect(listener1Called).toBe(true);
    expect(listener2Called).toBe(true);

    // Remove both
    remove1();
    remove2();
});

test('getLaunchOptionsSync returns cached launch options unchanged after URL change', () => {
    // launchOptions 在模块加载时已缓存，不会随 URL 变化而改变
    const first = getLaunchOptionsSync();
    expect(first.scene).toBe(0);
    expect(first.referrerInfo.extraData).toEqual({});
    expect(first.hostExtraData).toBeUndefined();

    // 改变 URL 后再次调用，应返回同一缓存值
    history.pushState(null, '', '?c=3&d=4');
    const second = getLaunchOptionsSync();
    expect(second).toBe(first); // 同一对象引用，证明是缓存
    expect(second.query).toEqual(first.query);

    history.pushState(null, '', location.pathname);
});

test('getEnterOptionsSync returns current URL query parameters', () => {
    history.pushState(null, '', '?roomId=42&name=%E6%B5%8B%E8%AF%95');

    const options = getEnterOptionsSync();
    expect(options.query).toEqual({
        roomId: '42',
        name: '测试',
    });
    expect(options.scene).toBe(0);
    expect(options.referrerInfo.extraData).toEqual({});
    // Web 环境下 apiCategory 无实际值
    expect(options.apiCategory).toBeUndefined();

    history.pushState(null, '', location.pathname);
});

test('getEnterOptionsSync updates after URL change', () => {
    history.pushState(null, '', '?a=1&b=2');
    const first = getEnterOptionsSync();
    expect(first.query).toEqual({ a: '1', b: '2' });

    // 改变 URL 后再次调用，应返回最新值
    history.pushState(null, '', '?c=3&d=4');
    const second = getEnterOptionsSync();
    expect(second.query).toEqual({ c: '3', d: '4' });

    history.pushState(null, '', location.pathname);
});

test('addShowListener with default fireImmediately=false does not fire immediately', () => {
    let fireCount = 0;

    const removeListener = addShowListener(() => {
        fireCount++;
    });

    // 默认不立即回调
    expect(fireCount).toBe(0);

    removeListener();
});

test('addShowListener with fireImmediately=true fires immediately and on visibilitychange', () => {
    let fireCount = 0;
    let lastOptions: WechatMinigame.OnShowListenerResult | undefined;

    const originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')
        ?? Object.getOwnPropertyDescriptor(document, 'visibilityState');
    history.pushState(null, '', '?roomId=42&name=%E6%B5%8B%E8%AF%95');

    const removeListener = addShowListener((options) => {
        fireCount++;
        lastOptions = options;
    }, { fireImmediately: true });

    // 注册时立即回调一次
    expect(fireCount).toBe(1);
    expect(lastOptions?.query).toEqual({
        roomId: '42',
        name: '测试',
    });
    expect(lastOptions?.scene).toBe(0);

    // 模拟切到隐藏再切回可见，应再次回调
    Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(fireCount).toBe(1); // 隐藏时不触发

    Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(fireCount).toBe(2); // 切回可见时触发

    removeListener();

    // 恢复
    history.pushState(null, '', location.pathname);
    if (originalVisibilityState) {
        Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
});

describe('non-DOM environment guards', () => {
    // document and location are non-configurable in browser (configurable=false),
    // cannot be stubbed via vi.stubGlobal. Only URLSearchParams is configurable.
    // The document/location guards (in IIFE, addShowListener, addHideListener) cannot
    // be tested in browser environment. The URLSearchParams guard below exercises the
    // "skip query parsing" path with hasDocument=true but URLSearchParams missing.

    test('getEnterOptionsSync returns empty query when URLSearchParams is undefined', () => {
        vi.stubGlobal('URLSearchParams', undefined);

        const options = getEnterOptionsSync();
        expect(options.query).toEqual({});
        // appId still comes from document.referrer (document exists in browser)
        expect(options.referrerInfo.appId).toBe(document.referrer);

        vi.unstubAllGlobals();
    });

    test('addShowListener fireImmediately returns degraded options when URLSearchParams is undefined', () => {
        vi.stubGlobal('URLSearchParams', undefined);

        let lastOptions: WechatMinigame.OnShowListenerResult | undefined;
        const removeListener = addShowListener((options) => {
            lastOptions = options;
        }, { fireImmediately: true });

        // fireImmediately callback receives empty query from degraded getWebShowOptions
        expect(lastOptions?.query).toEqual({});

        removeListener();
        vi.unstubAllGlobals();
    });
});
