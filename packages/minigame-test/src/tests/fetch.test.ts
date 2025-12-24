import { assert } from '@std/assert';
import { fetchT } from 'minigame-std';

(async () => {
    const fetchTask = fetchT<{
        name: string;
    }>('https://jsr.io/@happy-js/minigame-std/meta.json', {
        abortable: true,
        responseType: 'json',
        onChunk: (chunk) => {
            console.log('chunk', chunk);
        },
    });

    setTimeout(() => {
        fetchTask.abort();
    }, 1000);

    const res = await fetchTask.response;

    if (res.isErr()) {
        assert((res.unwrapErr() as Error).name === 'AbortError');
    } else {
        assert(res.unwrap().name === 'minigame-std');
    }
})();

(async () => {
    const task = fetchT<{
        name: string;
    }>('https://jsr.io/@happy-js/minigame-std/meta.json', {
        responseType: 'json',
        timeout: 10,
    });

    const res = await task.response;

    if (res.isErr()) {
        assert((res.unwrapErr() as Error).name === 'TimeoutError');
    } else {
        assert(res.unwrap().name === 'minigame-std');
    }
})();