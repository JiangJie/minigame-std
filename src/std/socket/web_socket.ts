import { Ok, type Result } from '@happy-js/happy-rusty';
import { assertSafeSocketUrl } from '../assert/assertions.ts';
import type { ISocket, SocketListenerMap } from './socket_define.ts';

export function connectSocket(url: string): ISocket {
    assertSafeSocketUrl(url);

    const socket = new WebSocket(url);
    // 二进制通信
    socket.binaryType = 'arraybuffer';

    return {
        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): void {
            switch (type) {
                case 'open': {
                    socket.addEventListener('open', listener as SocketListenerMap['open']);
                    break;
                }
                case 'close': {
                    socket.addEventListener('close', (ev) => {
                        (listener as SocketListenerMap['close'])(ev.code, ev.reason);
                    });
                    break;
                }
                case 'message': {
                    socket.addEventListener('message', (ev) => {
                        (listener as SocketListenerMap['message'])(ev.data);
                    });
                    break;
                }
                case 'error': {
                    socket.addEventListener('error', () => {
                        (listener as SocketListenerMap['error'])(new Error('WebSocket error'));
                    });
                    break;
                }
                default: {
                    throw new Error(`Invalid socket event type: ${ type }`);
                }
            }
        },

        send(data: string | ArrayBuffer | ArrayBufferView): Promise<Result<boolean, Error>> {
            socket.send(data);
            return Promise.resolve(Ok(true));
        },

        close: socket.close.bind(socket),
    };
}