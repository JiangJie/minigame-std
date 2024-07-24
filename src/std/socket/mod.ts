import { isMinaEnv } from '../../macros/env.ts';
import { connectSocket as minaConnectSocket } from './mina_socket.ts';
import type { ISocket } from './socket_define.ts';
import { connectSocket as webConnectSocket } from './web_socket.ts';

export * from './socket_define.ts';

/**
 * 创建并返回一个 WebSocket 连接。
 * @param url - WebSocket 服务器的 URL。
 * @returns 返回一个实现了 ISocket 接口的 WebSocket 对象。
 */
export function connectSocket(url: string): ISocket {
    return isMinaEnv() ? minaConnectSocket(url) : webConnectSocket(url);
}