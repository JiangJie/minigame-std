import { RESULT_VOID, type AsyncVoidIOResult } from 'happy-rusty';
import { assertSafeSocketUrl } from '../assert/assertions.ts';
import type { ISocket, SocketListenerMap } from './socket_define.ts';

/**
 * 创建并返回一个 WebSocket 连接。
 * @param url - WebSocket 服务器的 URL。
 * @param protocols - 子协议数组。
 * @returns 返回一个实现了 ISocket 接口的 WebSocket 对象。
 */
export function connectSocket(url: string, protocols?: string | string[]): ISocket {
    assertSafeSocketUrl(url);

    const socket = new WebSocket(url, protocols);
    // 考虑到小游戏只支持string和arraybuffer，二进制强制使用arraybuffer通信
    socket.binaryType = 'arraybuffer';

    return {
        get readyState(): number {
            return socket.readyState;
        },

        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): () => void {
            switch (type) {
                case 'open': {
                    const socketListener = listener as SocketListenerMap['open'];

                    socket.addEventListener('open', socketListener);

                    return (): void => {
                        socket.removeEventListener('open', socketListener);
                    };
                }
                case 'close': {
                    const socketListener = (ev: CloseEvent) => {
                        (listener as SocketListenerMap['close'])(ev.code, ev.reason);
                    };

                    socket.addEventListener('close', socketListener);

                    return (): void => {
                        socket.removeEventListener('close', socketListener);
                    };
                }
                case 'message': {
                    const socketListener = (ev: MessageEvent<string | ArrayBuffer>) => {
                        (listener as SocketListenerMap['message'])(ev.data);
                    };

                    socket.addEventListener('message', socketListener);

                    return (): void => {
                        socket.removeEventListener('message', socketListener);
                    };
                }
                case 'error': {
                    const socketListener = () => {
                        (listener as SocketListenerMap['error'])(new Error('WebSocket error'));
                    };

                    socket.addEventListener('error', socketListener);

                    return (): void => {
                        socket.removeEventListener('error', socketListener);
                    };
                }
                default: {
                    throw new Error(`Invalid socket event type: ${ type }`);
                }
            }
        },

        send(data: string | ArrayBuffer | ArrayBufferView): AsyncVoidIOResult {
            socket.send(data);
            return Promise.resolve(RESULT_VOID);
        },

        close: socket.close.bind(socket),
    };
}