import type { Result } from 'happy-rusty';

/**
 * WebSocket 事件监听器映射接口，定义了与 WebSocket 事件对应的回调函数类型。
 */
export interface SocketListenerMap {
    /**
     * 当 WebSocket 连接成功打开时触发。
     */
    open(): void;

    /**
     * 当 WebSocket 连接关闭时触发。
     * @param code - 表示关闭连接的状态码。
     * @param reason - 表示关闭连接的原因。
     */
    close(code: number, reason: string): void;

    /**
     * 当 WebSocket 接收到消息时触发。
     * @param data - 接收到的消息数据，可以是字符串或者 ArrayBuffer。
     */
    message(data: string | ArrayBuffer): void;

    /**
     * 当 WebSocket 连接发生错误时触发。
     * @param err - 发生的错误对象。
     */
    error(err: Error): void;
}

/**
 * WebSocket 接口定义，描述了 WebSocket 的基本操作方法。
 */
export interface ISocket {
    /**
     * 添加事件监听器到 WebSocket 对象。
     * @typeParam K - 限定为 WebSocketEventMap 的键类型。
     * @param type - 事件类型，如 'open', 'close', 'message', 'error'。
     * @param listener - 对应事件的监听器回调函数。
     */
    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: SocketListenerMap[K]): void;

    /**
     * 发送数据到 WebSocket 服务器。
     * @param data - 要发送的数据，可以是字符串、ArrayBuffer 或 ArrayBufferView。
     * @returns 返回一个 Promise，其解析为发送结果，成功时返回 true，失败时返回 Error。
     */
    send(data: string | ArrayBuffer | ArrayBufferView): Promise<Result<boolean, Error>>;

    /**
     * 关闭 WebSocket 连接。
     * @param code - 可选的状态码，表示关闭连接的原因。
     * @param reason - 可选的字符串，解释为什么要关闭连接。
     */
    close(code?: number, reason?: string): void;
}