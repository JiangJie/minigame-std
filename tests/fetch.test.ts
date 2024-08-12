// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { fetchT } from '../src/mod.ts';

Deno.test('fetch json', async () => {
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
        assert(data.name === 'minigame-std');
    }).inspectErr(err => {
        assert((err as Error).name === 'AbortError');
    });
});