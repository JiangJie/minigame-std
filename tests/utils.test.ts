import { expect, test } from 'vitest';
import {
    bufferSource2Ab,
    bufferSource2U8a,
    tryDOMAsyncOp,
    tryDOMSyncOp,
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
        () => new Promise<number>((resolve) => setTimeout(() => resolve(123), 10))
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(123);
});
