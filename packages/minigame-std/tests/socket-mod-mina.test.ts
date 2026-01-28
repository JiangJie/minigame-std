/**
 * 测试小游戏环境下的 socket/mod.ts（isMinaEnv = true 分支）
 */
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
        send: vi.fn(({ success }: { data: string | ArrayBuffer; success?: () => void; }) => {
            success?.();
        }),
        close: vi.fn(),
        _triggerOpen: () => listeners.onOpen?.(),
        _triggerClose: (code: number, reason: string) => listeners.onClose?.({ code, reason }),
        _triggerMessage: (data: string | ArrayBuffer) => listeners.onMessage?.({ data }),
        _triggerError: (errMsg: string) => listeners.onError?.({ errMsg }),
    };
}

let mockSocketTask: ReturnType<typeof createMockSocketTask>;

// Mock isMinaEnv 返回 true
vi.mock('../src/macros/env.ts', () => ({
    isMinaEnv: () => true,
}));

// Mock wx.connectSocket
vi.stubGlobal('wx', {
    connectSocket: vi.fn(() => {
        mockSocketTask = createMockSocketTask();
        return mockSocketTask;
    }),
});

// 动态导入 mod.ts（会使用 mock 的 isMinaEnv）
const { connectSocket } = await import('../src/std/socket/mod.ts');

beforeEach(() => {
    vi.clearAllMocks();
});

test('connectSocket uses mina implementation when isMinaEnv returns true', () => {
    const result = connectSocket('wss://example.com/ws');

    expect(result.isOk()).toBe(true);
    expect(wx.connectSocket).toHaveBeenCalled();

    const socket = result.unwrap();
    expect(socket.readyState).toBe(0); // CONNECTING
});

test('connectSocket with options uses mina implementation', () => {
    const result = connectSocket('wss://example.com/ws', {
        header: { 'X-Test': 'value' },
        protocols: ['protocol1'],
    });

    expect(result.isOk()).toBe(true);
    expect(wx.connectSocket).toHaveBeenCalledWith({
        url: 'wss://example.com/ws',
        header: { 'X-Test': 'value' },
        protocols: ['protocol1'],
    });
});

test('connectSocket returns error for invalid url', () => {
    const result = connectSocket('http://example.com/ws');

    expect(result.isErr()).toBe(true);
});

test('socket events work correctly through mod.ts', () => {
    const result = connectSocket('wss://example.com/ws');
    const socket = result.unwrap();

    const openListener = vi.fn();
    const messageListener = vi.fn();
    const closeListener = vi.fn();

    socket.addEventListener('open', openListener);
    socket.addEventListener('message', messageListener);
    socket.addEventListener('close', closeListener);

    // 触发事件
    mockSocketTask._triggerOpen();
    expect(openListener).toHaveBeenCalled();
    expect(socket.readyState).toBe(1); // OPEN

    mockSocketTask._triggerMessage('test message');
    expect(messageListener).toHaveBeenCalledWith('test message');

    mockSocketTask._triggerClose(1000, 'Normal closure');
    expect(closeListener).toHaveBeenCalledWith(1000, 'Normal closure');
    expect(socket.readyState).toBe(3); // CLOSED
});

test('socket send works correctly through mod.ts', async () => {
    const result = connectSocket('wss://example.com/ws');
    const socket = result.unwrap();

    const sendResult = await socket.send('Hello');
    expect(sendResult.isOk()).toBe(true);
    expect(mockSocketTask.send).toHaveBeenCalled();
});

test('socket close works correctly through mod.ts', () => {
    const result = connectSocket('wss://example.com/ws');
    const socket = result.unwrap();

    socket.close(1000, 'Normal closure');
    expect(socket.readyState).toBe(2); // CLOSING
    expect(mockSocketTask.close).toHaveBeenCalledWith({
        code: 1000,
        reason: 'Normal closure',
    });
});

test.afterAll(() => {
    vi.unstubAllGlobals();
});
