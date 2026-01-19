import { expect, test } from 'vitest';
import { asyncResultify } from '../src/mod.ts';

interface CallbackParams<S, E> {
    success?: (res: S) => void;
    fail?: (err: E) => void;
}

test('asyncResultify converts callback API to async result - success', async () => {
    // Mock a callback-style API
    const mockApi = (params: CallbackParams<{ data: string; }, { code: number; }>) => {
        setTimeout(() => {
            params.success?.({ data: 'success data' });
        }, 10);
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ data: 'success data' });
});

test('asyncResultify converts callback API to async result - failure', async () => {
    const mockApi = (params: CallbackParams<{ data: string; }, { code: number; }>) => {
        setTimeout(() => {
            params.fail?.({ code: 500 });
        }, 10);
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified({});

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toEqual({ code: 500 });
});

test('asyncResultify preserves original success callback', async () => {
    let originalSuccessCalled = false;

    const mockApi = (params: CallbackParams<{ data: string; }, { code: number; }>) => {
        setTimeout(() => {
            params.success?.({ data: 'test' });
        }, 10);
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified({
        success: () => { originalSuccessCalled = true; },
    });

    expect(result.isOk()).toBe(true);
    expect(originalSuccessCalled).toBe(true);
});

test('asyncResultify preserves original fail callback', async () => {
    let originalFailCalled = false;

    const mockApi = (params: CallbackParams<{ data: string; }, { code: number; }>) => {
        setTimeout(() => {
            params.fail?.({ code: 500 });
        }, 10);
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified({
        fail: () => { originalFailCalled = true; },
    });

    expect(result.isErr()).toBe(true);
    expect(originalFailCalled).toBe(true);
});

test('asyncResultify handles API returning Promise', async () => {

    const mockApi = async (_: CallbackParams<string, Error>) => {
        return 'async result';
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('async result');
});

test('asyncResultify handles API returning rejected Promise', async () => {

    const mockApi = async (_: CallbackParams<string, Error>) => {
        throw new Error('async error');
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified({});

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
});

test('asyncResultify throws on invalid API return', () => {
    // API that returns something other than void/Promise

    const mockApi = (_: { success?: (res: string) => void; }) => {
        return 'invalid return' as unknown as void; // Trick the type system
    };

    // Use type assertion to bypass the ValidAPI check
    const promisified = asyncResultify(mockApi) as (params: { success?: (res: string) => void; }) => Promise<unknown>;

    expect(() => promisified({})).toThrow('API must return void or Promise');
});

test('asyncResultify handles undefined params', async () => {
    const mockApi = (params?: CallbackParams<{ data: string; }, { code: number; }>) => {
        setTimeout(() => {
            params?.success?.({ data: 'success' });
        }, 10);
    };

    const promisified = asyncResultify(mockApi);
    const result = await promisified(undefined);

    expect(result.isOk()).toBe(true);
});
