import { Err } from 'happy-rusty';
import { expect, test } from 'vitest';
import { createFailedFetchTask } from '../src/std/internal/mod.ts';

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
