import { expect, test } from '@jest/globals';
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

    if (res.isErr()) {
        expect((res.unwrapErr() as Error).name).toBe('AbortError');
    } else {
        clearTimeout(timer);
        expect(res.unwrap().name).toBe('minigame-std');
    }
});