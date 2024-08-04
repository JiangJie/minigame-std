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

    if (res.isErr()) {
        assert((res.unwrapErr() as Error).name === 'AbortError');
    } else {
        clearTimeout(timer);
        assert(res.unwrap().name === 'minigame-std');
    }
});