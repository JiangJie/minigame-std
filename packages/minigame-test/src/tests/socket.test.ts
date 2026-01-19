import { assert } from '@std/assert';
import { connectSocket, platform } from 'minigame-std';

export function testSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
        const data = 'minigame-std';

        const socket = connectSocket('wss://echo.websocket.org/');

        let count = 0;
        socket.addEventListener('message', (msg) => {
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
            reject(err);
        });

        socket.addEventListener('close', (code) => {
            // 开发者工具有差异
            assert(code === (platform.isMiniGameDevtools() ? 1005 : 1000));
            resolve();
        });

        socket.addEventListener('open', () => {
            socket.send(data);
        });
    });
}