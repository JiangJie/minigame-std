import { expect, test } from 'vitest';
import {
    bufferSourceToAb,
    bufferSourceToBytes,
    miniGameFailureToError,
} from '../src/std/internal/mod.ts';

// bufferSource2U8a tests
test('bufferSource2U8a returns same Uint8Array if input is Uint8Array', () => {
    const input = new Uint8Array([1, 2, 3]);
    const result = bufferSourceToBytes(input);
    expect(result).toBe(input);
});

test('bufferSource2U8a converts ArrayBuffer to Uint8Array', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3]);

    const result = bufferSourceToBytes(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a converts DataView to Uint8Array', () => {
    const buffer = new ArrayBuffer(5);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 1, 2, 3, 0]);

    const dataView = new DataView(buffer, 1, 3);
    const result = bufferSourceToBytes(dataView);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a converts Int8Array to Uint8Array', () => {
    const int8 = new Int8Array([1, 2, 3]);
    const result = bufferSourceToBytes(int8);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a handles TypedArray with offset', () => {
    const buffer = new ArrayBuffer(6);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 0, 1, 2, 3, 0]);

    // Create a view with offset
    const offsetView = new Uint8Array(buffer, 2, 3);
    const result = bufferSourceToBytes(offsetView);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
});

test('bufferSource2U8a throws on invalid input', () => {
    expect(() => bufferSourceToBytes({} as BufferSource)).toThrow('BufferSource is not ArrayBuffer or ArrayBufferView');
    expect(() => bufferSourceToBytes(null as unknown as BufferSource)).toThrow();
});

// bufferSource2Ab tests
test('bufferSource2Ab returns same ArrayBuffer if input is ArrayBuffer', () => {
    const buffer = new ArrayBuffer(3);
    const result = bufferSourceToAb(buffer);
    expect(result).toBe(buffer);
});

test('bufferSource2Ab extracts ArrayBuffer from Uint8Array', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3]);

    const result = bufferSourceToAb(view);
    expect(result).toBe(buffer);
});

test('bufferSource2Ab handles TypedArray with offset', () => {
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

test('bufferSource2Ab throws on invalid input', () => {
    expect(() => bufferSourceToAb({} as BufferSource)).toThrow('BufferSource is not ArrayBuffer or ArrayBufferView');
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

// Additional bufferSource2U8a edge cases
test('bufferSource2U8a handles empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);
    const result = bufferSourceToBytes(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
});

test('bufferSource2U8a handles Uint8Array with zero offset', () => {
    const buffer = new ArrayBuffer(3);
    const view = new Uint8Array(buffer, 0, 3);
    view.set([1, 2, 3]);
    const result = bufferSourceToBytes(view);
    // Should return same instance since offset is 0
    expect(result).toBe(view);
});

test('bufferSource2U8a handles Int16Array', () => {
    const int16 = new Int16Array([256, 512]);
    const result = bufferSourceToBytes(int16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4); // 2 int16 = 4 bytes
});

test('bufferSource2U8a handles Float32Array', () => {
    const float32 = new Float32Array([1.0]);
    const result = bufferSourceToBytes(float32);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4); // 1 float32 = 4 bytes
});

// Additional bufferSource2Ab edge cases
test('bufferSource2Ab handles empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);
    const result = bufferSourceToAb(buffer);
    expect(result).toBe(buffer);
    expect(result.byteLength).toBe(0);
});

test('bufferSource2Ab handles DataView', () => {
    const buffer = new ArrayBuffer(8);
    const fullView = new Uint8Array(buffer);
    fullView.set([0, 1, 2, 3, 4, 5, 6, 7]);

    const dataView = new DataView(buffer, 2, 4);
    const result = bufferSourceToAb(dataView);

    expect(result.byteLength).toBe(4);
    expect(new Uint8Array(result)).toEqual(new Uint8Array([2, 3, 4, 5]));
});

test('bufferSource2Ab handles DataView with zero offset', () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer, 0, 4);
    const result = bufferSourceToAb(dataView);

    // Should return original buffer since offset is 0
    expect(result).toBe(buffer);
});

test('bufferSource2Ab handles Float64Array', () => {
    const float64 = new Float64Array([1.0, 2.0]);
    const result = bufferSourceToAb(float64);
    expect(result.byteLength).toBe(16); // 2 float64 = 16 bytes
});
