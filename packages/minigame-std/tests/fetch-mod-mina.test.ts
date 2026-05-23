/**
 * 测试小游戏环境下的 fetch/mod.ts（IS_MINA = true 分支）
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
        _triggerChunk: (data: ArrayBuffer) => {
            chunkCallback?.({ data });
        },
    };
}

let mockTask: ReturnType<typeof createMockRequestTask>;
let lastRequestOptions: WechatMinigame.RequestOption | null = null;

// Mock IS_MINA 为 true
vi.mock('../src/macros/env.ts', () => ({
    IS_MINA: true,
}));

// Mock wx.request
vi.stubGlobal('wx', {
    request: vi.fn((options: WechatMinigame.RequestOption) => {
        lastRequestOptions = options;
        mockTask = createMockRequestTask();
        return mockTask;
    }),
});

// 动态导入 mod.ts（会使用 mock 的 IS_MINA）
const { fetchT } = await import('../src/std/fetch/mod.ts');

beforeEach(() => {
    vi.clearAllMocks();
    lastRequestOptions = null;
});

test('fetchT uses mina implementation when IS_MINA is true', async () => {
    const url = 'https://example.com/api';
    const fetchTask = fetchT(url);

    expect(wx.request).toHaveBeenCalled();

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
});

test('fetchT returns text response in minigame environment', async () => {
    const fetchTask = fetchT('https://example.com/api', { responseType: 'text' });

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
});

test('fetchT returns arraybuffer response in minigame environment', async () => {
    const fetchTask = fetchT('https://example.com/api', { responseType: 'arraybuffer' });

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

test('fetchT returns json response in minigame environment', async () => {
    const fetchTask = fetchT<{ name: string; }>('https://example.com/api', { responseType: 'json' });

    const jsonData = { name: 'test' };
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

test('fetchT handles HTTP error status codes', async () => {
    const fetchTask = fetchT('https://example.com/api');

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
});

test('fetchT handles abort error', async () => {
    const fetchTask = fetchT('https://example.com/api');

    lastRequestOptions?.fail?.({
        errMsg: 'request:fail abort',
        errno: 0,
        exception: {
            reasons: [],
            retryCount: 0,
        },
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.name).toBe('AbortError');
});

test('fetchT handles timeout error', async () => {
    const fetchTask = fetchT('https://example.com/api');

    lastRequestOptions?.fail?.({
        errMsg: 'request:fail timeout',
        errno: 0,
        exception: {
            reasons: [],
            retryCount: 0,
        },
        useHttpDNS: false,
    });

    const result = await fetchTask.result;
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.name).toBe('TimeoutError');
});

test('fetchT abort method works', () => {
    const fetchTask = fetchT('https://example.com/api');

    expect(fetchTask.aborted).toBe(false);
    fetchTask.abort();
    expect(fetchTask.aborted).toBe(true);
    expect(mockTask.abort).toHaveBeenCalled();
});

test('fetchT with custom headers and method', async () => {
    const fetchTask = fetchT('https://example.com/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { key: 'value' },
        responseType: 'json',
    });

    expect(lastRequestOptions?.method).toBe('POST');
    expect(lastRequestOptions?.header).toEqual({ 'Content-Type': 'application/json' });
    expect(lastRequestOptions?.data).toEqual({ key: 'value' });

    lastRequestOptions?.success?.({
        data: { success: true },
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

test('fetchT without init parameter uses default text responseType', async () => {
    const fetchTask = fetchT('https://example.com/api');

    expect(lastRequestOptions?.dataType).toBe('其他');

    lastRequestOptions?.success?.({
        data: 'response',
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

test('fetchT maps body to data in mina environment', async () => {
    const fetchTask = fetchT('https://example.com/api', {
        method: 'POST',
        body: { key: 'value' },
        responseType: 'json',
    });

    expect(lastRequestOptions?.method).toBe('POST');
    expect(lastRequestOptions?.data).toEqual({ key: 'value' });

    lastRequestOptions?.success?.({
        data: { success: true },
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
    expect(result.unwrap()).toEqual({ success: true });
});

test('fetchT maps string body to data in mina environment', async () => {
    const fetchTask = fetchT('https://example.com/api', {
        method: 'POST',
        body: 'raw string data',
        responseType: 'text',
    });

    expect(lastRequestOptions?.data).toBe('raw string data');

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

test('fetchT converts ArrayBuffer body to data in mina environment', async () => {
    const buffer = new ArrayBuffer(8);
    const fetchTask = fetchT('https://example.com/api', {
        method: 'POST',
        body: buffer,
        responseType: 'arraybuffer',
    });

    // ArrayBuffer passes through directly
    expect(lastRequestOptions?.data).toBe(buffer);

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
});

test('fetchT converts Uint8Array body to ArrayBuffer data in mina environment', async () => {
    const uint8 = new Uint8Array([1, 2, 3, 4]);
    const fetchTask = fetchT('https://example.com/api', {
        method: 'POST',
        body: uint8,
        responseType: 'arraybuffer',
    });

    // Uint8Array with no offset → data should be its underlying buffer
    const data = lastRequestOptions?.data as ArrayBuffer;
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(data.byteLength).toBe(4);

    lastRequestOptions?.success?.({
        data,
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

test('fetchT converts Uint8Array with offset body to sliced ArrayBuffer in mina environment', async () => {
    const buffer = new ArrayBuffer(16);
    // Create a view with offset=4, length=8
    const view = new Uint8Array(buffer, 4, 8);
    view.set([10, 20, 30, 40, 50, 60, 70, 80]);

    const fetchTask = fetchT('https://example.com/api', {
        method: 'POST',
        body: view,
        responseType: 'arraybuffer',
    });

    // Should be a sliced copy, not the original 16-byte buffer
    const data = lastRequestOptions?.data as ArrayBuffer;
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(data.byteLength).toBe(8);
    expect(new Uint8Array(data)).toEqual(new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]));

    lastRequestOptions?.success?.({
        data,
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

test.afterAll(() => {
    vi.unstubAllGlobals();
});
