/**
 * 测试小游戏环境下的 storage/mod.ts（isMinaEnv = true 分支）
 */
import { beforeEach, expect, test, vi } from 'vitest';

// 模拟存储数据
const mockStorage = new Map<string, string>();

// Mock isMinaEnv 返回 true
vi.mock('../src/macros/env.ts', () => ({
    isMinaEnv: () => true,
}));

// Mock wx storage APIs
vi.stubGlobal('wx', {
    setStorage: vi.fn(({ key, data, success }) => {
        mockStorage.set(key, data);
        success?.({});
    }),
    getStorage: vi.fn(({ key, success, fail }) => {
        if (mockStorage.has(key)) {
            success?.({ data: mockStorage.get(key) });
        } else {
            fail?.({ errMsg: 'data not found' });
        }
    }),
    removeStorage: vi.fn(({ key, success }) => {
        mockStorage.delete(key);
        success?.({});
    }),
    clearStorage: vi.fn(({ success }) => {
        mockStorage.clear();
        success?.({});
    }),
    getStorageInfo: vi.fn(({ success }) => {
        success?.({ keys: Array.from(mockStorage.keys()) });
    }),
    setStorageSync: vi.fn((key: string, data: string) => {
        mockStorage.set(key, data);
    }),
    getStorageSync: vi.fn((key: string) => {
        if (!mockStorage.has(key)) {
            throw new Error('data not found');
        }
        return mockStorage.get(key);
    }),
    removeStorageSync: vi.fn((key: string) => {
        mockStorage.delete(key);
    }),
    clearStorageSync: vi.fn(() => {
        mockStorage.clear();
    }),
    getStorageInfoSync: vi.fn(() => {
        return { keys: Array.from(mockStorage.keys()) };
    }),
});

// 动态导入 mod.ts（会使用 mock 的 isMinaEnv）
const {
    setItem,
    getItem,
    removeItem,
    clear,
    getLength,
    hasItem,
    setItemSync,
    getItemSync,
    removeItemSync,
    clearSync,
    getLengthSync,
    hasItemSync,
} = await import('../src/std/storage/mod.ts');

beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
});

// ============ 异步 API 测试 ============

test('setItem and getItem use mina implementation when isMinaEnv returns true', async () => {
    const key = 'test-key';
    const value = 'test-value';

    const setResult = await setItem(key, value);
    expect(setResult.isOk()).toBe(true);
    expect(wx.setStorage).toHaveBeenCalled();

    const getResult = await getItem(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
    expect(wx.getStorage).toHaveBeenCalled();
});

test('removeItem uses mina implementation', async () => {
    await setItem('key', 'value');

    const result = await removeItem('key');
    expect(result.isOk()).toBe(true);
    expect(wx.removeStorage).toHaveBeenCalled();
});

test('clear uses mina implementation', async () => {
    await setItem('key1', 'value1');
    await setItem('key2', 'value2');

    const result = await clear();
    expect(result.isOk()).toBe(true);
    expect(wx.clearStorage).toHaveBeenCalled();

    const length = await getLength();
    expect(length.unwrap()).toBe(0);
});

test('getLength uses mina implementation', async () => {
    await setItem('key1', 'value1');
    await setItem('key2', 'value2');

    const result = await getLength();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(2);
    expect(wx.getStorageInfo).toHaveBeenCalled();
});

test('hasItem uses mina implementation', async () => {
    let result = await hasItem('non-existent');
    expect(result.unwrap()).toBe(false);

    await setItem('key', 'value');

    result = await hasItem('key');
    expect(result.unwrap()).toBe(true);
    expect(wx.getStorageInfo).toHaveBeenCalled();
});

// ============ 同步 API 测试 ============

test('setItemSync and getItemSync use mina implementation', () => {
    const key = 'sync-key';
    const value = 'sync-value';

    const setResult = setItemSync(key, value);
    expect(setResult.isOk()).toBe(true);
    expect(wx.setStorageSync).toHaveBeenCalledWith(key, value);

    const getResult = getItemSync(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
    expect(wx.getStorageSync).toHaveBeenCalledWith(key);
});

test('removeItemSync uses mina implementation', () => {
    setItemSync('key', 'value');

    const result = removeItemSync('key');
    expect(result.isOk()).toBe(true);
    expect(wx.removeStorageSync).toHaveBeenCalledWith('key');
});

test('clearSync uses mina implementation', () => {
    setItemSync('key1', 'value1');
    setItemSync('key2', 'value2');

    const result = clearSync();
    expect(result.isOk()).toBe(true);
    expect(wx.clearStorageSync).toHaveBeenCalled();

    const length = getLengthSync();
    expect(length.unwrap()).toBe(0);
});

test('getLengthSync uses mina implementation', () => {
    setItemSync('key1', 'value1');
    setItemSync('key2', 'value2');

    const result = getLengthSync();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(2);
    expect(wx.getStorageInfoSync).toHaveBeenCalled();
});

test('hasItemSync uses mina implementation', () => {
    let result = hasItemSync('non-existent');
    expect(result.unwrap()).toBe(false);

    setItemSync('key', 'value');

    result = hasItemSync('key');
    expect(result.unwrap()).toBe(true);
    expect(wx.getStorageInfoSync).toHaveBeenCalled();
});

// ============ 参数验证测试 ============

test('setItem validates key parameter', async () => {
    // @ts-expect-error =测试无效参数类型=
    const result = await setItem(123, 'value');
    expect(result.isErr()).toBe(true);
});

test('setItem validates data parameter', async () => {
    // @ts-expect-error =测试无效参数类型=
    const result = await setItem('key', 123);
    expect(result.isErr()).toBe(true);
});

test('getItem validates key parameter', async () => {
    // @ts-expect-error =测试无效参数类型=
    const result = await getItem(123);
    expect(result.isErr()).toBe(true);
});

test.afterAll(() => {
    vi.unstubAllGlobals();
});
