import { expect, test } from '@jest/globals';
import { connectSocket } from '../src/mod.ts';

test('socket echo', (done) => {
    const data = 'minigame-std';

    const socket = connectSocket('wss://echo.websocket.org/');

    let count = 0;

    const removeMessageListener = socket.addEventListener('message', (msg) => {
        count += 1;

        if (count === 1) {
            expect((msg as string).startsWith('Request served by')).toBe(true);
        } else if (count === 2) {
            expect(msg).toBe(data);
            socket.close();
        }
    });

    socket.addEventListener('error', (err) => {
        console.log('socket error', err);
    });

    socket.addEventListener('close', (code) => {
        removeMessageListener();
        expect(code).toBe(1000);
        done();
    });

    socket.addEventListener('open', () => {
        socket.send(data);
    });
});