import { isMinaEnv } from '../../macros/env.ts';
import { connectSocket as minaConnectSocket } from './mina_socket.ts';
import type { ISocket, SocketOptions } from './socket_define.ts';
import { connectSocket as webConnectSocket } from './web_socket.ts';

export * from './socket_define.ts';

/**
 * 创建并返回一个 WebSocket 连接。
 * @param url - WebSocket 服务器的 URL。
 * @param options - 可选的参数。
 * @returns 返回一个实现了 ISocket 接口的 WebSocket 对象。
 * @since 1.0.0
 * @example
 * ```ts
 * const socket = connectSocket('wss://echo.websocket.org');
 *
 * socket.addEventListener('open', () => {
 *     console.log('连接已建立');
 *     socket.send('Hello, Server!');
 * });
 *
 * socket.addEventListener('message', (data) => {
 *     console.log('收到消息:', data);
 * });
 *
 * socket.addEventListener('close', (code, reason) => {
 *     console.log('连接已关闭:', code, reason);
 * });
 *
 * socket.addEventListener('error', (error) => {
 *     console.error('连接错误:', error);
 * });
 *
 * // 关闭连接
 * socket.close();
 * ```
 */
export function connectSocket(url: string, options?: SocketOptions): ISocket {
    return isMinaEnv()
        ? minaConnectSocket(url, options)
        : webConnectSocket(url, options?.protocols);
}