import { expect, test } from 'vitest';
import { addErrorListener, addResizeListener, addUnhandledrejectionListener } from '../src/mod.ts';

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
