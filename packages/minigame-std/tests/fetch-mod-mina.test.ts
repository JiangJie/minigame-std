/**
 * 测试小游戏环境下的 fetch/mod.ts（isMinaEnv = true 分支）
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

// Mock isMinaEnv 返回 true
vi.mock('../src/macros/env.ts', () => ({
    isMinaEnv: () => true,
}));

// Mock wx.request
vi.stubGlobal('wx', {
    request: vi.fn((options: WechatMinigame.RequestOption) => {
        lastRequestOptions = options;
        mockTask = createMockRequestTask();
        return mockTask;
    }),
});

// 动态导入 mod.ts（会使用 mock 的 isMinaEnv）
const { fetchT } = await import('../src/std/fetch/mod.ts');

beforeEach(() => {
    vi.clearAllMocks();
    lastRequestOptions = null;
});

test('fetchT uses mina implementation when isMinaEnv returns true', async () => {
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
        header: { 'Content-Type': 'application/json' },
        data: { key: 'value' },
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

test.afterAll(() => {
    vi.unstubAllGlobals();
});
