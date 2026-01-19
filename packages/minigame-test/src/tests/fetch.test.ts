import { assert } from '@std/assert';
import { fetchT } from 'minigame-std';

export async function testFetch(): Promise<void> {
    // 测试1：可中止的请求
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

    const res = await fetchTask.result;

    if (res.isErr()) {
        assert((res.unwrapErr() as Error).name === 'AbortError');
    } else {
        assert(res.unwrap().name === 'minigame-std');
    }

    // 测试2：超时请求
    const task = fetchT<{
        name: string;
    }>('https://jsr.io/@happy-js/minigame-std/meta.json', {
        responseType: 'json',
        timeout: 10,
    });

    const res2 = await task.result;

    if (res2.isErr()) {
        assert((res2.unwrapErr() as Error).name === 'TimeoutError');
    } else {
        assert(res2.unwrap().name === 'minigame-std');
    }
}
