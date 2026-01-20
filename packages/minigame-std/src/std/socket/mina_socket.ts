/**
 * @internal
 * 小游戏平台的 WebSocket 实现。
 */

import { RESULT_VOID, type AsyncVoidIOResult } from 'happy-rusty';
import type { DataSource } from '../defines.ts';
import { bufferSourceToAb, miniGameFailureToError } from '../internal/mod.ts';
import { asyncResultify } from '../utils/mod.ts';
import { SocketReadyState, type ISocket, type SocketListenerMap, type SocketOptions } from './socket_define.ts';

/**
 * 创建并返回一个 WebSocket 连接。
 * @param url - WebSocket 服务器的 URL。
 * @param options - 透传给`wx.connectSocket`。
 * @returns 返回一个实现了 ISocket 接口的 WebSocket 对象。
 */
export function connectSocket(url: string, options?: SocketOptions): ISocket {
    const socket = wx.connectSocket({
        ...options,
        url,
    });

    // mock WebSocket readyState
    let readyState: number = SocketReadyState.CONNECTING;

    return {
        get readyState(): number {
            return readyState;
        },

        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): () => void {
            switch (type) {
                case 'open': {
                    socket.onOpen(() => {
                        readyState = SocketReadyState.OPEN;
                        (listener as SocketListenerMap['open'])();
                    });

                    return (): void => {
                        // 小游戏没有实现
                    };
                }
                case 'close': {
                    socket.onClose((res) => {
                        readyState = SocketReadyState.CLOSED;
                        (listener as SocketListenerMap['close'])(res.code, res.reason);
                    });


                    return (): void => {
                        // 小游戏没有实现
                    };
                }
                case 'message': {
                    socket.onMessage((res) => {
                        (listener as SocketListenerMap['message'])(res.data);
                    });

                    return (): void => {
                        // 小游戏没有实现
                    };
                }
                case 'error': {
                    socket.onError((err) => {
                        (listener as SocketListenerMap['error'])(miniGameFailureToError(err));
                    });

                    return (): void => {
                        // 小游戏没有实现
                    };
                }
                default: {
                    throw new TypeError(`Invalid socket event type: ${ type }`);
                }
            }
        },

        async send(data: DataSource): AsyncVoidIOResult {
            const sendData = typeof data === 'string'
                ? data
                : bufferSourceToAb(data);

            return (await asyncResultify(socket.send)({
                data: sendData,
            }))
                .and(RESULT_VOID)
                .mapErr(miniGameFailureToError);
        },

        close(code?: number, reason?: string): void {
            readyState = SocketReadyState.CLOSING;
            socket.close({
                code,
                reason,
            });
        },
    };
}