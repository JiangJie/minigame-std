import { promisifyWithResult } from 'minigame-std';
import { expect, test } from 'vitest';

interface CallbackParams<S, E> {
    success?: (res: S) => void;
    fail?: (err: E) => void;
}

test('promisifyWithResult converts callback API to async result - success', async () => {
    // Mock a callback-style API
    const mockApi = (params: CallbackParams<{ data: string }, { code: number }>) => {
        setTimeout(() => {
            params.success?.({ data: 'success data' });
        }, 10);
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ data: 'success data' });
});

test('promisifyWithResult converts callback API to async result - failure', async () => {
    const mockApi = (params: CallbackParams<{ data: string }, { code: number }>) => {
        setTimeout(() => {
            params.fail?.({ code: 500 });
        }, 10);
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified({});

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toEqual({ code: 500 });
});

test('promisifyWithResult preserves original success callback', async () => {
    let originalSuccessCalled = false;

    const mockApi = (params: CallbackParams<{ data: string }, { code: number }>) => {
        setTimeout(() => {
            params.success?.({ data: 'test' });
        }, 10);
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified({
        success: () => { originalSuccessCalled = true; },
    });

    expect(result.isOk()).toBe(true);
    expect(originalSuccessCalled).toBe(true);
});

test('promisifyWithResult preserves original fail callback', async () => {
    let originalFailCalled = false;

    const mockApi = (params: CallbackParams<{ data: string }, { code: number }>) => {
        setTimeout(() => {
            params.fail?.({ code: 500 });
        }, 10);
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified({
        fail: () => { originalFailCalled = true; },
    });

    expect(result.isErr()).toBe(true);
    expect(originalFailCalled).toBe(true);
});

test('promisifyWithResult handles API returning Promise', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockApi = async (_: CallbackParams<string, Error>) => {
        return 'async result';
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('async result');
});

test('promisifyWithResult handles API returning rejected Promise', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockApi = async (_: CallbackParams<string, Error>) => {
        throw new Error('async error');
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified({});

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
});

test('promisifyWithResult throws on invalid API return', () => {
    // API that returns something other than void/Promise
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockApi = (_: { success?: (res: string) => void }) => {
        return 'invalid return' as unknown as void; // Trick the type system
    };

    // Use type assertion to bypass the ValidAPI check
    const promisified = promisifyWithResult(mockApi) as (params: { success?: (res: string) => void }) => Promise<unknown>;

    expect(() => promisified({})).toThrow('API must return void or Promise');
});

test('promisifyWithResult handles undefined params', async () => {
    const mockApi = (params?: CallbackParams<{ data: string }, { code: number }>) => {
        setTimeout(() => {
            params?.success?.({ data: 'success' });
        }, 10);
    };

    const promisified = promisifyWithResult(mockApi);
    const result = await promisified(undefined);

    expect(result.isOk()).toBe(true);
});
