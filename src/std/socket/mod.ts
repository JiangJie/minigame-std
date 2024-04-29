import { isMinaEnv } from '../../macros/env.ts' with { type: 'macros' };
import { connectSocket as minaConnectSocket } from './mina_socket.ts';
import type { ISocket } from './socket_define.ts';
import { connectSocket as webConnectSocket } from './web_socket.ts';

export function connectSocket(url: string): ISocket {
    return isMinaEnv() ? minaConnectSocket(url) : webConnectSocket(url);
}