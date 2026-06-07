/**
 * @internal
 * 小游戏平台的 WebSocket 实现。
 */

import { RESULT_VOID, tryResult, type AsyncVoidIOResult } from 'happy-rusty';
import type { DataSource } from '../defines.ts';
import { bufferSourceToAb, miniGameFailureToError } from '../internal/mod.ts';
import { asyncIOResultify } from '../utils/mod.ts';
import { type ISocket, type SocketListenerMap, type SocketOptions } from './socket_define.ts';

/**
 * 创建并返回一个 WebSocket 连接。
 * @param url - WebSocket 服务器的 URL。
 * @param options - 透传给`wx.connectSocket`。
 * @returns 返回一个实现了 ISocket 接口的 WebSocket 对象。
 */
export function connectSocket(url: string, options?: SocketOptions): ISocket {
    const { headers, ...rest } = options ?? {};
    const socket = wx.connectSocket({
        ...rest,
        url,
        header: headers,
    });

    return {
        get readyState(): number {
            // 小游戏 SocketTask 实际已支持 readyState，但 api typings 尚未更新
            return (socket as typeof socket & { readyState: number; })['readyState'];
        },

        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): () => void {
            switch (type) {
                case 'open': {
                    socket.onOpen(() => {
                        (listener as SocketListenerMap['open'])();
                    });

                    return (): void => {
                        // 小游戏没有实现移除监听
                    };
                }
                case 'close': {
                    socket.onClose((res) => {
                        (listener as SocketListenerMap['close'])(res.code, res.reason);
                    });


                    return (): void => {
                        // 小游戏没有实现移除监听
                    };
                }
                case 'message': {
                    socket.onMessage((res) => {
                        (listener as SocketListenerMap['message'])(res.data);
                    });

                    return (): void => {
                        // 小游戏没有实现移除监听
                    };
                }
                case 'error': {
                    socket.onError((err) => {
                        (listener as SocketListenerMap['error'])(miniGameFailureToError(err));
                    });

                    return (): void => {
                        // 小游戏没有实现移除监听
                    };
                }
                default: {
                    throw new TypeError(`Invalid socket event type: ${type}`);
                }
            }
        },

        async send(data: DataSource): AsyncVoidIOResult {
            const sendDataRes = tryResult(() => typeof data === 'string'
                ? data
                : bufferSourceToAb(data));
            if (sendDataRes.isErr()) return sendDataRes.asErr();

            const result = await asyncIOResultify(socket.send)({
                data: sendDataRes.unwrap(),
            });

            return result.and(RESULT_VOID);
        },

        close(code?: number, reason?: string): void {
            socket.close({
                code,
                reason,
            });
        },
    };
}