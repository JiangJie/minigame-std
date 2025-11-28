// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assertEquals } from '@std/assert';
import { addErrorListener, addResizeListener, addUnhandledrejectionListener } from 'minigame-std';

Deno.test('addErrorListener and remove', () => {
    let errorCaught = false;
    let errorMessage = '';

    const listener = (ev: ErrorEvent) => {
        errorCaught = true;
        errorMessage = ev.message;
    };

    const removeListener = addErrorListener(listener);

    // Trigger an error
    const errorEvent = new ErrorEvent('error', {
        message: 'Test error message',
    });
    dispatchEvent(errorEvent);

    assertEquals(errorCaught, true, 'Error listener should catch error');
    assertEquals(errorMessage, 'Test error message', 'Error message should match');

    // Remove listener and verify it doesn't fire
    removeListener();
    errorCaught = false;
    dispatchEvent(new ErrorEvent('error', { message: 'Another error' }));
    assertEquals(errorCaught, false, 'Removed listener should not catch error');
});

Deno.test('addUnhandledrejectionListener and remove', async () => {
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
    });
    dispatchEvent(rejectionEvent);

    // Wait a tick
    await new Promise(resolve => setTimeout(resolve, 10));

    assertEquals(rejectionCaught, true, 'Rejection listener should catch rejection');
    assertEquals(rejectionReason, 'Test rejection reason', 'Rejection reason should match');

    // Remove listener
    removeListener();
    rejectionCaught = false;

    const anotherEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: 'Another rejection',
    });
    dispatchEvent(anotherEvent);

    await new Promise(resolve => setTimeout(resolve, 10));
    assertEquals(rejectionCaught, false, 'Removed listener should not catch rejection');
});

Deno.test('addResizeListener and remove', () => {
    let resizeCaught = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const listener = (_: Event) => {
        resizeCaught = true;
    };

    const removeListener = addResizeListener(listener as any);

    // Trigger a resize event (use Event instead of UIEvent for Deno compatibility)
    const resizeEvent = new Event('resize');
    dispatchEvent(resizeEvent);

    assertEquals(resizeCaught, true, 'Resize listener should catch resize');

    // Remove listener and verify it doesn't fire
    removeListener();
    resizeCaught = false;
    dispatchEvent(new Event('resize'));
    assertEquals(resizeCaught, false, 'Removed listener should not catch resize');
});

Deno.test('multiple error listeners', () => {
    let listener1Called = false;
    let listener2Called = false;

    const listener1 = () => { listener1Called = true; };
    const listener2 = () => { listener2Called = true; };

    const remove1 = addErrorListener(listener1);
    const remove2 = addErrorListener(listener2);

    dispatchEvent(new ErrorEvent('error', { message: 'Test' }));

    assertEquals(listener1Called, true, 'First listener should be called');
    assertEquals(listener2Called, true, 'Second listener should be called');

    // Remove both
    remove1();
    remove2();
});
