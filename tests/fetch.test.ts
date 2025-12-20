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
