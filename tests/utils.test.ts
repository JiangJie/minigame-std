import { expect, test } from 'vitest';
import {
    bufferSource2Ab,
    bufferSource2U8a,
    miniGameFailureToError,
    miniGameFailureToResult,
    tryDOMAsyncOp,
    tryDOMSyncOp,
    tryGeneralAsyncOp,
    tryGeneralSyncOp,
} from 'minigame-std';

// bufferSource2U8a tests
test('bufferSource2U8a returns same Uint8Array if input is Uint8Array', () => {
    const input = new Uint8Array([1, 2, 3]);
    const result = bufferSource2U8a(input);
    expect(result).toBe(input);
});

test('bufferSource2U8a converts ArrayBuffer to Uint8Array', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3]);
    
    const result = bufferSource2U8a(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a converts DataView to Uint8Array', () => {
    const buffer = new ArrayBuffer(5);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 1, 2, 3, 0]);
    
    const dataView = new DataView(buffer, 1, 3);
    const result = bufferSource2U8a(dataView);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a converts Int8Array to Uint8Array', () => {
    const int8 = new Int8Array([1, 2, 3]);
    const result = bufferSource2U8a(int8);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a handles TypedArray with offset', () => {
    const buffer = new ArrayBuffer(6);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 1, 2, 3, 0]);
    
    // Create a view with offset
    const offsetView = new Uint8Array(buffer, 2, 3);
    const result = bufferSource2U8a(offsetView);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a throws on invalid input', () => {
    expect(() => bufferSource2U8a({} as BufferSource)).toThrow('BufferSource is not ArrayBuffer or ArrayBufferView');
    expect(() => bufferSource2U8a(null as unknown as BufferSource)).toThrow();
});

// bufferSource2Ab tests
test('bufferSource2Ab returns same ArrayBuffer if input is ArrayBuffer', () => {
    const buffer = new ArrayBuffer(3);
    const result = bufferSource2Ab(buffer);
    expect(result).toBe(buffer);
});

test('bufferSource2Ab extracts ArrayBuffer from Uint8Array', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3]);
    
    const result = bufferSource2Ab(view);
    expect(result).toBe(buffer);
});

test('bufferSource2Ab handles TypedArray with offset', () => {
    const buffer = new ArrayBuffer(6);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 1, 2, 3, 0]);
    
    // Create a view with offset - should slice the buffer
    const offsetView = new Uint8Array(buffer, 2, 3);
    const result = bufferSource2Ab(offsetView);
    
    // Should be a sliced buffer, not the original
    expect(result.byteLength).toBe(3);
    expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2Ab throws on invalid input', () => {
    expect(() => bufferSource2Ab({} as BufferSource)).toThrow('BufferSource is not ArrayBuffer or ArrayBufferView');
});

// tryDOMSyncOp tests
test('tryDOMSyncOp returns Ok on success', () => {
    const result = tryDOMSyncOp(() => 'success');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('success');
});

test('tryDOMSyncOp returns Err on exception', () => {
    const error = new DOMException('Test error');
    const result = tryDOMSyncOp(() => {
        throw error;
    });
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe(error);
});

test('tryDOMSyncOp handles complex return types', () => {
    const result = tryDOMSyncOp(() => ({ key: 'value', num: 42 }));
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ key: 'value', num: 42 });
});

// tryDOMAsyncOp tests
test('tryDOMAsyncOp returns Ok on async success', async () => {
    const result = await tryDOMAsyncOp(async () => 'async success');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('async success');
});

test('tryDOMAsyncOp returns Err on async exception', async () => {
    const error = new DOMException('Async test error');
    const result = await tryDOMAsyncOp(async () => {
        throw error;
    });
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe(error);
});

test('tryDOMAsyncOp handles Promise rejection', async () => {
    const error = new DOMException('Rejected');
    const result = await tryDOMAsyncOp(() => Promise.reject(error));
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe(error);
});

test('tryDOMAsyncOp handles delayed async operations', async () => {
    const result = await tryDOMAsyncOp(
        () => new Promise<number>((resolve) => setTimeout(() => resolve(123), 10)),
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(123);
});

// miniGameFailureToError tests
test('miniGameFailureToError converts GeneralCallbackResult to Error', () => {
    const callbackResult = { errMsg: 'Test error message' };
    const error = miniGameFailureToError(callbackResult);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error message');
});

test('miniGameFailureToError converts Error-like object to Error', () => {
    const originalError = new Error('Original error');
    const error = miniGameFailureToError(originalError);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Original error');
});

test('miniGameFailureToError handles empty errMsg', () => {
    const callbackResult = { errMsg: '' };
    const error = miniGameFailureToError(callbackResult);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('');
});

test('miniGameFailureToError prefers errMsg over message', () => {
    // Object with both errMsg and message
    const mixedObject = { errMsg: 'errMsg value', message: 'message value' } as unknown as WechatMinigame.GeneralCallbackResult;
    const error = miniGameFailureToError(mixedObject);
    
    expect(error.message).toBe('errMsg value');
});

// miniGameFailureToResult tests
test('miniGameFailureToResult returns Err result', () => {
    const callbackResult = { errMsg: 'API failed' };
    const result = miniGameFailureToResult<string>(callbackResult);
    
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(result.unwrapErr().message).toBe('API failed');
});

test('miniGameFailureToResult preserves error message', () => {
    const callbackResult = { errMsg: 'setStorage:fail permission denied' };
    const result = miniGameFailureToResult<void>(callbackResult);
    
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('setStorage:fail permission denied');
});

// tryGeneralSyncOp tests
test('tryGeneralSyncOp returns Ok on success', () => {
    const result = tryGeneralSyncOp(() => 42);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
});

test('tryGeneralSyncOp returns Ok with complex return type', () => {
    const result = tryGeneralSyncOp(() => ({ data: [1, 2, 3], status: 'ok' }));
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ data: [1, 2, 3], status: 'ok' });
});

test('tryGeneralSyncOp returns Err on exception with errMsg', () => {
    const result = tryGeneralSyncOp(() => {
        throw { errMsg: 'sync operation failed' };
    });
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('sync operation failed');
});

test('tryGeneralSyncOp returns Err on Error exception', () => {
    const result = tryGeneralSyncOp(() => {
        throw new Error('standard error');
    });
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('standard error');
});

test('tryGeneralSyncOp handles void return', () => {
    let sideEffect = false;
    const result = tryGeneralSyncOp(() => {
        sideEffect = true;
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
    expect(sideEffect).toBe(true);
});

// tryGeneralAsyncOp tests
test('tryGeneralAsyncOp returns Ok on async success', async () => {
    const result = await tryGeneralAsyncOp(async () => 'async result');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('async result');
});

test('tryGeneralAsyncOp returns Ok with complex async return type', async () => {
    const result = await tryGeneralAsyncOp(async () => {
        return { items: ['a', 'b'], count: 2 };
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ items: ['a', 'b'], count: 2 });
});

test('tryGeneralAsyncOp returns Err on async exception with errMsg', async () => {
    const result = await tryGeneralAsyncOp(async () => {
        throw { errMsg: 'async operation failed' };
    });
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('async operation failed');
});

test('tryGeneralAsyncOp returns Err on Promise rejection', async () => {
    const result = await tryGeneralAsyncOp(() => 
        Promise.reject({ errMsg: 'promise rejected' }),
    );
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('promise rejected');
});

test('tryGeneralAsyncOp handles delayed async operations', async () => {
    const result = await tryGeneralAsyncOp(
        () => new Promise<string>((resolve) => setTimeout(() => resolve('delayed'), 10)),
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('delayed');
});

test('tryGeneralAsyncOp handles delayed rejection', async () => {
    const result = await tryGeneralAsyncOp(
        () => new Promise<string>((_, reject) => 
            setTimeout(() => reject({ errMsg: 'delayed failure' }), 10),
        ),
    );
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('delayed failure');
});

// Additional bufferSource2U8a edge cases
test('bufferSource2U8a handles empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);
    const result = bufferSource2U8a(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
});

test('bufferSource2U8a handles Uint8Array with zero offset', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer, 0, 3);
    view.set([1, 2, 3]);
    const result = bufferSource2U8a(view);
    // Should return same instance since offset is 0
    expect(result).toBe(view);
});

test('bufferSource2U8a handles Int16Array', () => {
    const int16 = new Int16Array([256, 512]);
    const result = bufferSource2U8a(int16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4); // 2 int16 = 4 bytes
});

test('bufferSource2U8a handles Float32Array', () => {
    const float32 = new Float32Array([1.0]);
    const result = bufferSource2U8a(float32);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4); // 1 float32 = 4 bytes
});

// Additional bufferSource2Ab edge cases
test('bufferSource2Ab handles empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);
    const result = bufferSource2Ab(buffer);
    expect(result).toBe(buffer);
    expect(result.byteLength).toBe(0);
});

test('bufferSource2Ab handles DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 1, 2, 3, 4, 5, 6, 7]);
    
    const dataView = new DataView(buffer, 2, 4);
    const result = bufferSource2Ab(dataView);
    
    expect(result.byteLength).toBe(4);
    expect(new Uint8Array(result)).toEqual(new Uint8Array([2, 3, 4, 5]));
});

test('bufferSource2Ab handles DataView with zero offset', () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer, 0, 4);
    const result = bufferSource2Ab(dataView);
    
    // Should return original buffer since offset is 0
    expect(result).toBe(buffer);
});

test('bufferSource2Ab handles Float64Array', () => {
    const float64 = new Float64Array([1.0, 2.0]);
    const result = bufferSource2Ab(float64);
    expect(result.byteLength).toBe(16); // 2 float64 = 16 bytes
});
