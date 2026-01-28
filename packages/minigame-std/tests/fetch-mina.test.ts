/**
 * 测试小游戏环境下的 fetch/mod.ts
 */
import { beforeEach, expect, test, vi } from 'vitest';

// 创建 mock 的 request task
function createMockRequestTask() {
    let chunkCallback: ((res: { data: ArrayBuffer; }) => void) | null = null;

    return {
        abort: vi.fn(),
        onChunkReceived: vi.fn((callback: (res: { data: ArrayBuffer; }) => void) => {
            chunkCallback = callback;
        }),
        // 辅助方法：触发 chunk 事件
        _triggerChunk: (data: ArrayBuffer) => {
            chunkCallback?.({ data });
        },
    };
}

let mockTask: ReturnType<typeof createMockRequestTask>;
let lastRequestOptions: WechatMinigame.RequestOption | null = null;

// Mock wx.request
vi.stubGlobal('wx', {
    request: vi.fn((options: WechatMinigame.RequestOption) => {
        lastRequestOptions = options;
        mockTask = createMockRequestTask();
        return mockTask;
    }),
});

// 动态导入 mina_fetch，确保使用 mock 的 wx
const { minaFetch } = await import('../src/std/fetch/mina_fetch.ts');

beforeEach(() => {
    vi.clearAllMocks();
    lastRequestOptions = null;
});

test('mina fetch with text response type (default)', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    // 模拟成功响应
    lastRequestOptions?.success?.({
        data: 'Hello World',
        statusCode: 200,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('Hello World');
    expect(lastRequestOptions?.responseType).toBe(undefined);
    expect(lastRequestOptions?.dataType).toBe('其他');
});

test('mina fetch with explicit text response type', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url, { responseType: 'text' });

    lastRequestOptions?.success?.({
        data: 'Hello Text',
        statusCode: 200,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('Hello Text');
    expect(lastRequestOptions?.responseType).toBe('text');
    expect(lastRequestOptions?.dataType).toBe('其他');
});

test('mina fetch with arraybuffer response type', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url, { responseType: 'arraybuffer' });

    const buffer = new ArrayBuffer(8);
    lastRequestOptions?.success?.({
        data: buffer,
        statusCode: 200,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(buffer);
    expect(lastRequestOptions?.responseType).toBe('arraybuffer');
});

test('mina fetch with json response type', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url, { responseType: 'json' });

    const jsonData = { name: 'test', value: 123 };
    lastRequestOptions?.success?.({
        data: jsonData,
        statusCode: 200,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(jsonData);
    expect(lastRequestOptions?.dataType).toBe('json');
});

test('mina fetch with HTTP error status code', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    lastRequestOptions?.success?.({
        data: 'Not Found',
        statusCode: 404,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.message).toBe('request:ok');
});

test('mina fetch with abort error', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    lastRequestOptions?.fail?.({
        errMsg: 'request:fail abort',
        errno: 1,
        exception: { reasons: [], retryCount: 0 },
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.name).toBe('AbortError');
});

test('mina fetch with timeout error', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    lastRequestOptions?.fail?.({
        errMsg: 'request:fail timeout',
        errno: 1,
        exception: { reasons: [], retryCount: 0 },
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.name).toBe('TimeoutError');
});

test('mina fetch with general error', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    lastRequestOptions?.fail?.({
        errMsg: 'request:fail network error',
        errno: 1,
        exception: { reasons: [], retryCount: 0 },
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.message).toBe('request:fail network error');
});

test('mina fetch abort method', () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    expect(fetchTask.aborted).toBe(false);
    fetchTask.abort();
    expect(fetchTask.aborted).toBe(true);
    expect(mockTask.abort).toHaveBeenCalled();
});

test('mina fetch with onChunk callback', async () => {
    const url = 'https://example.com/api';
    const onChunk = vi.fn();
    const fetchTask = minaFetch(url, { onChunk });

    expect(mockTask.onChunkReceived).toHaveBeenCalled();

    // 触发 chunk 事件
    const chunkData = new ArrayBuffer(16);
    mockTask._triggerChunk(chunkData);

    expect(onChunk).toHaveBeenCalled();
    const receivedChunk = onChunk.mock.calls[0][0];
    expect(receivedChunk).toBeInstanceOf(Uint8Array);

    // 完成请求
    lastRequestOptions?.success?.({
        data: 'done',
        statusCode: 200,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
});

test('mina fetch with invalid url', async () => {
    const fetchTask = minaFetch('invalid-url');

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
});

test('mina fetch with custom headers and method', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url, {
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { key: 'value' },
    });

    expect(lastRequestOptions?.method).toBe('POST');
    expect(lastRequestOptions?.header).toEqual({ 'Content-Type': 'application/json' });
    expect(lastRequestOptions?.data).toEqual({ key: 'value' });

    lastRequestOptions?.success?.({
        data: 'ok',
        statusCode: 200,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
});

test('mina fetch 2xx status codes are successful', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    lastRequestOptions?.success?.({
        data: 'Created',
        statusCode: 201,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isOk()).toBe(true);
});

test('mina fetch 3xx status codes are errors', async () => {
    const url = 'https://example.com/api';
    const fetchTask = minaFetch(url);

    lastRequestOptions?.success?.({
        data: 'Redirect',
        statusCode: 301,
        header: {},
        cookies: [],
        errMsg: 'request:ok',
        exception: {
            reasons: [],
            retryCount: 0,
        },
        profile: {} as WechatMinigame.RequestProfile,
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
});

test.afterAll(() => {
    vi.unstubAllGlobals();
});
