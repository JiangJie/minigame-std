import { expect, test } from 'vitest';
import { fetchT } from '../src/mod.ts';

test('fetch json', async () => {
    const fetchTask = fetchT<{
        name: string;
    }>('https://jsr.io/@happy-js/minigame-std/meta.json', {
        abortable: true,
        responseType: 'json',
    });

    const timer = setTimeout(() => {
        fetchTask.abort();
    }, 100);

    const res = await fetchTask.response;

    res.inspect(data => {
        clearTimeout(timer);
        expect(data.name).toBe('minigame-std');
    }).inspectErr(err => {
        expect((err as Error).name).toBe('AbortError');
    });
});

test('fetch with default responseType (text)', async () => {
    // Test without responseType - should default to 'text'
    const fetchTask = fetchT('https://jsr.io/@happy-js/minigame-std/meta.json', {
        abortable: true,
    });

    const timer = setTimeout(() => {
        fetchTask.abort();
    }, 100);

    const res = await fetchTask.response;

    res.inspect(data => {
        clearTimeout(timer);
        expect(typeof data).toBe('string');
        expect(data).toContain('minigame-std');
    }).inspectErr(err => {
        expect((err as Error).name).toBe('AbortError');
    });
});

test('fetch without init parameter', async () => {
    // Test without init parameter - should use default {}
    const fetchTask = fetchT('https://jsr.io/@happy-js/minigame-std/meta.json');

    const timer = setTimeout(() => {
        fetchTask.abort();
    }, 100);

    const res = await fetchTask.response;

    res.inspect(data => {
        clearTimeout(timer);
        expect(typeof data).toBe('string');
        expect(data).toContain('minigame-std');
    }).inspectErr(err => {
        expect((err as Error).name).toBe('AbortError');
    });
});
