import type { Result } from '@happy-js/happy-rusty';

export interface SocketListenerMap {
    open(): void;
    close(code: number, reason: string): void;
    message(data: string | ArrayBuffer): void;
    error(err: Error): void;
}

export interface ISocket {
    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): void;
    send(data: string | ArrayBuffer | ArrayBufferView): Promise<Result<boolean, Error>>;
    close(code?: number, reason?: string): void;
}