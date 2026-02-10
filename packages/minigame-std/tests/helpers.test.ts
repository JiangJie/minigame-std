import { Err } from 'happy-rusty';
import { expect, test } from 'vitest';
import {
    bufferSourceToAb,
    bufferSourceToBytes,
    createFailedFetchTask,
    miniGameFailureToError,
} from '../src/std/internal/mod.ts';

// createFailedFetchTask tests
test('createFailedFetchTask returns failed FetchTask', async () => {
    const errResult = Err<string, Error>(new Error('test error'));
    const task = createFailedFetchTask<string>(errResult);

    const result = await task.result;

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(result.unwrapErr().message).toBe('test error');
});

test('createFailedFetchTask aborted is always false', () => {
    const errResult = Err(new Error('test error'));
    const task = createFailedFetchTask(errResult);

    expect(task.aborted).toBe(false);
});

test('createFailedFetchTask abort is noop', () => {
    const errResult = Err(new Error('test error'));
    const task = createFailedFetchTask(errResult);

    // abort should not throw
    expect(() => task.abort()).not.toThrow();
    // aborted should still be false after calling abort
    expect(task.aborted).toBe(false);
});

test('createFailedFetchTask preserves error type', async () => {
    const customError = new Error('Server error');
    const errResult = Err(customError);
    const task = createFailedFetchTask<{ data: string; }>(errResult);

    const result = await task.result;

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toEqual(customError);
});

// miniGameFailureToError tests
test('miniGameFailureToError returns same Error instance when input is Error', () => {
    const error = new Error('test error');
    const result = miniGameFailureToError(error);

    expect(result).toBe(error);
    expect(result.message).toBe('test error');
});

test('miniGameFailureToError converts GeneralCallbackResult with errMsg to Error', () => {
    const callbackResult: WechatMinigame.GeneralCallbackResult = {
        errMsg: 'readFile:fail file not found',
    };
    const result = miniGameFailureToError(callbackResult);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('readFile:fail file not found');
});

test('miniGameFailureToError converts Error-like object with message to Error', () => {
    // 模拟一个长得像 Error 但不是 Error 实例的对象
    // 例如: "statSync:fail no such file or directory" 这种情况
    const errorLike = {
        message: 'statSync:fail no such file or directory',
    } as unknown as WechatMinigame.GeneralCallbackResult;

    const result = miniGameFailureToError(errorLike);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('statSync:fail no such file or directory');
});

test('miniGameFailureToError prioritizes errMsg over message', () => {
    const mixedError = {
        errMsg: 'primary error message',
        message: 'secondary error message',
    } as unknown as WechatMinigame.GeneralCallbackResult;

    const result = miniGameFailureToError(mixedError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('primary error message');
});

test('miniGameFailureToError handles empty errMsg', () => {
    const callbackResult = { errMsg: '' };
    const error = miniGameFailureToError(callbackResult);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('');
});

// bufferSourceToBytes tests
test('bufferSourceToBytes returns same Uint8Array if input is Uint8Array', () => {
    const input = new Uint8Array([1, 2, 3]);
    const result = bufferSourceToBytes(input);
    expect(result).toBe(input);
});

test('bufferSourceToBytes converts ArrayBuffer to Uint8Array', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3]);

    const result = bufferSourceToBytes(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSourceToBytes converts DataView to Uint8Array', () => {
    const buffer = new ArrayBuffer(5);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 1, 2, 3, 0]);

    const dataView = new DataView(buffer, 1, 3);
    const result = bufferSourceToBytes(dataView);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSourceToBytes converts Int8Array to Uint8Array', () => {
    const int8 = new Int8Array([1, 2, 3]);
    const result = bufferSourceToBytes(int8);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSourceToBytes handles TypedArray with offset', () => {
    const buffer = new ArrayBuffer(6);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 1, 2, 3, 0]);

    // Create a view with offset
    const offsetView = new Uint8Array(buffer, 2, 3);
    const result = bufferSourceToBytes(offsetView);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSourceToBytes throws on invalid input', () => {
    expect(() => bufferSourceToBytes({} as BufferSource)).toThrow('Input argument must be an ArrayBuffer or ArrayBufferView');
    expect(() => bufferSourceToBytes(null as unknown as BufferSource)).toThrow();
});

test('bufferSourceToBytes handles empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);
    const result = bufferSourceToBytes(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
});

test('bufferSourceToBytes handles Uint8Array with zero offset', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer, 0, 3);
    view.set([1, 2, 3]);
    const result = bufferSourceToBytes(view);
    // Should return same instance since offset is 0
    expect(result).toBe(view);
});

test('bufferSourceToBytes handles Int16Array', () => {
    const int16 = new Int16Array([256, 512]);
    const result = bufferSourceToBytes(int16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4); // 2 int16 = 4 bytes
});

test('bufferSourceToBytes handles Float32Array', () => {
    const float32 = new Float32Array([1.0]);
    const result = bufferSourceToBytes(float32);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4); // 1 float32 = 4 bytes
});

// bufferSourceToAb tests
test('bufferSourceToAb returns same ArrayBuffer if input is ArrayBuffer', () => {
    const buffer = new ArrayBuffer(3);
    const result = bufferSourceToAb(buffer);
    expect(result).toBe(buffer);
});

test('bufferSourceToAb extracts ArrayBuffer from Uint8Array', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3]);

    const result = bufferSourceToAb(view);
    expect(result).toBe(buffer);
});

test('bufferSourceToAb handles TypedArray with offset', () => {
    const buffer = new ArrayBuffer(6);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 1, 2, 3, 0]);

    // Create a view with offset - should slice the buffer
    const offsetView = new Uint8Array(buffer, 2, 3);
    const result = bufferSourceToAb(offsetView);

    // Should be a sliced buffer, not the original
    expect(result.byteLength).toBe(3);
    expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSourceToAb throws on invalid input', () => {
    expect(() => bufferSourceToAb({} as BufferSource)).toThrow('Input argument must be an ArrayBuffer or ArrayBufferView');
});

test('bufferSourceToAb handles empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);
    const result = bufferSourceToAb(buffer);
    expect(result).toBe(buffer);
    expect(result.byteLength).toBe(0);
});

test('bufferSourceToAb handles DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 1, 2, 3, 4, 5, 6, 7]);

    const dataView = new DataView(buffer, 2, 4);
    const result = bufferSourceToAb(dataView);

    expect(result.byteLength).toBe(4);
    expect(new Uint8Array(result)).toEqual(new Uint8Array([2, 3, 4, 5]));
});

test('bufferSourceToAb handles DataView with zero offset', () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer, 0, 4);
    const result = bufferSourceToAb(dataView);

    // Should return original buffer since offset is 0
    expect(result).toBe(buffer);
});

test('bufferSourceToAb handles Float64Array', () => {
    const float64 = new Float64Array([1.0, 2.0]);
    const result = bufferSourceToAb(float64);
    expect(result.byteLength).toBe(16); // 2 float64 = 16 bytes
});
