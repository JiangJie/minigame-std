import { beforeEach, expect, test, vi } from 'vitest';

// 创建一个模拟的 SocketTask 对象
function createMockSocketTask() {
    const listeners: {
        onOpen?: () => void;
        onClose?: (res: { code: number; reason: string; }) => void;
        onMessage?: (res: { data: string | ArrayBuffer; }) => void;
        onError?: (err: { errMsg: string; }) => void;
    } = {};

    return {
        onOpen: vi.fn((callback: () => void) => {
            listeners.onOpen = callback;
        }),
        onClose: vi.fn((callback: (res: { code: number; reason: string; }) => void) => {
            listeners.onClose = callback;
        }),
        onMessage: vi.fn((callback: (res: { data: string | ArrayBuffer; }) => void) => {
            listeners.onMessage = callback;
        }),
        onError: vi.fn((callback: (err: { errMsg: string; }) => void) => {
            listeners.onError = callback;
        }),
        send: vi.fn(({ data: _data, success, fail: _fail }: { data: string | ArrayBuffer; success?: () => void; fail?: (err: { errMsg: string; }) => void; }) => {
            // 模拟发送成功
            success?.();
        }),
        close: vi.fn(({ code: _code, reason: _reason }: { code?: number; reason?: string; }) => {
            // 模拟关闭
        }),
        // 触发事件的辅助方法
        _triggerOpen: () => listeners.onOpen?.(),
        _triggerClose: (code: number, reason: string) => listeners.onClose?.({ code, reason }),
        _triggerMessage: (data: string | ArrayBuffer) => listeners.onMessage?.({ data }),
        _triggerError: (errMsg: string) => listeners.onError?.({ errMsg }),
    };
}

let mockSocketTask: ReturnType<typeof createMockSocketTask>;

// Mock wx.connectSocket
vi.stubGlobal('wx', {
    connectSocket: vi.fn((_options: { url: string; }) => {
        mockSocketTask = createMockSocketTask();
        return mockSocketTask;
    }),
});

// 动态导入 mina_socket，确保使用 mock 的 wx
const { connectSocket } = await import('../src/std/socket/mina_socket.ts');

beforeEach(() => {
    vi.clearAllMocks();
});

test('mina connectSocket creates socket with correct url', () => {
    const url = 'wss://example.com/ws';
    const socket = connectSocket(url, { header: { 'X-Test': 'value' } });

    expect(wx.connectSocket).toHaveBeenCalledWith({
        url,
        header: { 'X-Test': 'value' },
    });
    expect(socket.readyState).toBe(0); // CONNECTING
});

test('mina socket open event changes readyState', () => {
    const socket = connectSocket('wss://example.com/ws');
    const openListener = vi.fn();

    socket.addEventListener('open', openListener);
    expect(socket.readyState).toBe(0); // CONNECTING

    // 触发 open 事件
    mockSocketTask._triggerOpen();

    expect(openListener).toHaveBeenCalled();
    expect(socket.readyState).toBe(1); // OPEN
});

test('mina socket close event changes readyState', () => {
    const socket = connectSocket('wss://example.com/ws');
    const closeListener = vi.fn();

    socket.addEventListener('close', closeListener);

    // 触发 close 事件
    mockSocketTask._triggerClose(1000, 'Normal closure');

    expect(closeListener).toHaveBeenCalledWith(1000, 'Normal closure');
    expect(socket.readyState).toBe(3); // CLOSED
});

test('mina socket message event', () => {
    const socket = connectSocket('wss://example.com/ws');
    const messageListener = vi.fn();

    socket.addEventListener('message', messageListener);

    // 触发 message 事件
    mockSocketTask._triggerMessage('Hello World');

    expect(messageListener).toHaveBeenCalledWith('Hello World');
});

test('mina socket error event', () => {
    const socket = connectSocket('wss://example.com/ws');
    const errorListener = vi.fn();

    socket.addEventListener('error', errorListener);

    // 触发 error 事件
    mockSocketTask._triggerError('Connection failed');

    expect(errorListener).toHaveBeenCalled();
    const error = errorListener.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Connection failed');
});

test('mina socket invalid event type throws error', () => {
    const socket = connectSocket('wss://example.com/ws');

    expect(() => {
        // @ts-expect-error =测试无效事件类型=
        socket.addEventListener('invalid', () => {});
    }).toThrow(TypeError);
});

test('mina socket send string data', async () => {
    const socket = connectSocket('wss://example.com/ws');

    const result = await socket.send('Hello');

    expect(result.isOk()).toBe(true);
    expect(mockSocketTask.send).toHaveBeenCalled();
});

test('mina socket send ArrayBuffer data', async () => {
    const socket = connectSocket('wss://example.com/ws');
    const buffer = new ArrayBuffer(8);

    const result = await socket.send(buffer);

    expect(result.isOk()).toBe(true);
    expect(mockSocketTask.send).toHaveBeenCalled();
});

test('mina socket send Uint8Array data', async () => {
    const socket = connectSocket('wss://example.com/ws');
    const data = new Uint8Array([1, 2, 3, 4]);

    const result = await socket.send(data);

    expect(result.isOk()).toBe(true);
    expect(mockSocketTask.send).toHaveBeenCalled();
});

test('mina socket close', () => {
    const socket = connectSocket('wss://example.com/ws');

    socket.close(1000, 'Normal closure');

    expect(socket.readyState).toBe(2); // CLOSING
    expect(mockSocketTask.close).toHaveBeenCalledWith({
        code: 1000,
        reason: 'Normal closure',
    });
});

test('mina socket send fail', async () => {
    const socket = connectSocket('wss://example.com/ws');

    // 在创建 socket 之后修改 mock 行为使其失败
    mockSocketTask.send = vi.fn(({ fail }: { fail?: (err: { errMsg: string; }) => void; }) => {
        fail?.({ errMsg: 'Send failed' });
    });

    const result = await socket.send('test');

    expect(result.isErr()).toBe(true);
});

test('mina socket send invalid data type', async () => {
    const socket = connectSocket('wss://example.com/ws');

    // 传入无效数据类型
    // @ts-expect-error =测试无效数据类型=
    const result = await socket.send(123);

    expect(result.isErr()).toBe(true);
});

test('mina socket addEventListener returns cleanup function', () => {
    const socket = connectSocket('wss://example.com/ws');

    const cleanupOpen = socket.addEventListener('open', () => {});
    const cleanupClose = socket.addEventListener('close', () => {});
    const cleanupMessage = socket.addEventListener('message', () => {});
    const cleanupError = socket.addEventListener('error', () => {});

    // 清理函数应该存在（虽然小游戏没有实现）
    expect(typeof cleanupOpen).toBe('function');
    expect(typeof cleanupClose).toBe('function');
    expect(typeof cleanupMessage).toBe('function');
    expect(typeof cleanupError).toBe('function');

    // 调用清理函数不应该抛出错误
    cleanupOpen();
    cleanupClose();
    cleanupMessage();
    cleanupError();
});

test.afterAll(() => {
    vi.unstubAllGlobals();
});
