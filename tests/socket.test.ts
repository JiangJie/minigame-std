// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { Future } from 'tiny-future';
import { connectSocket } from '../src/mod.ts';

Deno.test('socket echo', () => {
    const future = new Future<void>();

    const data = 'minigame-std';

    const socket = connectSocket('wss://echo.websocket.org/');

    let count = 0;

    const removeMessageListener = socket.addEventListener('message', (msg) => {
        count += 1;

        if (count === 1) {
            assert((msg as string).startsWith('Request served by'));
        } else if (count === 2) {
            assert(msg === data);
            socket.close();
        }
    });

    socket.addEventListener('error', (err) => {
        console.log('socket error', err);
    });

    socket.addEventListener('close', (code) => {
        removeMessageListener();
        assert(code === 1005);

        future.resolve();
    });

    socket.addEventListener('open', () => {
        socket.send(data);
    });

    return future.promise;
});