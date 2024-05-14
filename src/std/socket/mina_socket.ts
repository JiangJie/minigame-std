import { Err, Ok, type Result } from 'happy-rusty';
import { assertSafeSocketUrl } from '../assert/assertions.ts';
import type { ISocket, SocketListenerMap } from './socket_define.ts';

export function connectSocket(url: string): ISocket {
    assertSafeSocketUrl(url);

    const socket = wx.connectSocket({
        url,
    });

    return {
        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): void {
            switch (type) {
                case 'open': {
                    socket.onOpen(listener as SocketListenerMap['open']);
                    break;
                }
                case 'close': {
                    socket.onClose((res) => {
                        (listener as SocketListenerMap['close'])(res.code, res.reason);
                    });
                    break;
                }
                case 'message': {
                    socket.onMessage((res) => {
                        (listener as SocketListenerMap['message'])(res.data);
                    });
                    break;
                }
                case 'error': {
                    socket.onError((err) => {
                        (listener as SocketListenerMap['error'])(new Error(err.errMsg));
                    });
                    break;
                }
                default: {
                    console.error(`Invalid socket event type: ${ type }`);
                    break;
                }
            }
        },

        send(data: string | ArrayBuffer | ArrayBufferView): Promise<Result<boolean, Error>> {
            return new Promise(resolve => {
                let buffer = data;

                if (ArrayBuffer.isView(data)) {
                    // 可能存在offset
                    buffer = data.byteOffset === 0
                        ? data.buffer
                        : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                }

                socket.send({
                    data: buffer as string | ArrayBuffer,
                    success(): void {
                        resolve(Ok(true));
                    },
                    fail(err): void {
                        resolve(Err(new Error(err.errMsg)));
                    },
                });
            });
        },

        close(code?: number, reason?: string): void {
            socket.close({
                code,
                reason,
            });
        },
    };
}