import { expect, test, vi } from 'vitest';

// 模拟存储数据
const mockStorage = new Map<string, string>();

// Mock wx storage APIs
vi.stubGlobal('wx', {
    setStorage: vi.fn(({ key, data, success, fail }) => {
        try {
            mockStorage.set(key, data);
            success?.({});
        } catch (err) {
            fail?.(err);
        }
    }),
    getStorage: vi.fn(({ key, success, fail }) => {
        if (mockStorage.has(key)) {
            success?.({ data: mockStorage.get(key) });
        } else {
            fail?.({ errMsg: 'data not found' });
        }
    }),
    removeStorage: vi.fn(({ key, success, fail }) => {
        try {
            mockStorage.delete(key);
            success?.({});
        } catch (err) {
            fail?.(err);
        }
    }),
    clearStorage: vi.fn(({ success, fail }) => {
        try {
            mockStorage.clear();
            success?.({});
        } catch (err) {
            fail?.(err);
        }
    }),
    getStorageInfo: vi.fn(({ success, fail }) => {
        try {
            success?.({ keys: Array.from(mockStorage.keys()) });
        } catch (err) {
            fail?.(err);
        }
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

// 动态导入 mina_storage，确保使用 mock 的 wx
const { setItem, getItem, removeItem, clear, getLength, hasItem, setItemSync, getItemSync, removeItemSync, clearSync, getLengthSync, hasItemSync } = await import('../src/std/storage/mina_storage.ts');

test.beforeEach(() => {
    mockStorage.clear();
});

// ============ 异步 API 测试 ============

test('mina setItem and getItem', async () => {
    const key = 'test-key';
    const value = 'test-value';

    const setResult = await setItem(key, value);
    expect(setResult.isOk()).toBe(true);

    const getResult = await getItem(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
});

test('mina getItem non-existent key', async () => {
    const getResult = await getItem('non-existent');
    expect(getResult.isErr()).toBe(true);
});

test('mina removeItem', async () => {
    const key = 'test-remove';
    await setItem(key, 'value');

    const removeResult = await removeItem(key);
    expect(removeResult.isOk()).toBe(true);

    const getResult = await getItem(key);
    expect(getResult.isErr()).toBe(true);
});

test('mina clear', async () => {
    await setItem('key1', 'value1');
    await setItem('key2', 'value2');

    const clearResult = await clear();
    expect(clearResult.isOk()).toBe(true);

    const length = await getLength();
    expect(length.unwrap()).toBe(0);
});

test('mina getLength', async () => {
    let lengthResult = await getLength();
    expect(lengthResult.unwrap()).toBe(0);

    await setItem('key1', 'value1');
    await setItem('key2', 'value2');

    lengthResult = await getLength();
    expect(lengthResult.unwrap()).toBe(2);
});

test('mina hasItem', async () => {
    const key = 'test-has';

    let hasResult = await hasItem(key);
    expect(hasResult.unwrap()).toBe(false);

    await setItem(key, 'value');

    hasResult = await hasItem(key);
    expect(hasResult.unwrap()).toBe(true);
});

// ============ 同步 API 测试 ============

test('mina setItemSync and getItemSync', () => {
    const key = 'sync-key';
    const value = 'sync-value';

    const setResult = setItemSync(key, value);
    expect(setResult.isOk()).toBe(true);

    const getResult = getItemSync(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
});

test('mina getItemSync non-existent key', () => {
    const getResult = getItemSync('non-existent');
    expect(getResult.isErr()).toBe(true);
});

test('mina removeItemSync', () => {
    const key = 'sync-remove';
    setItemSync(key, 'value');

    const removeResult = removeItemSync(key);
    expect(removeResult.isOk()).toBe(true);

    const getResult = getItemSync(key);
    expect(getResult.isErr()).toBe(true);
});

test('mina clearSync', () => {
    setItemSync('key1', 'value1');
    setItemSync('key2', 'value2');

    const clearResult = clearSync();
    expect(clearResult.isOk()).toBe(true);

    const length = getLengthSync();
    expect(length.unwrap()).toBe(0);
});

test('mina getLengthSync', () => {
    let lengthResult = getLengthSync();
    expect(lengthResult.unwrap()).toBe(0);

    setItemSync('key1', 'value1');
    setItemSync('key2', 'value2');

    lengthResult = getLengthSync();
    expect(lengthResult.unwrap()).toBe(2);
});

test('mina hasItemSync', () => {
    const key = 'sync-has';

    let hasResult = hasItemSync(key);
    expect(hasResult.unwrap()).toBe(false);

    setItemSync(key, 'value');

    hasResult = hasItemSync(key);
    expect(hasResult.unwrap()).toBe(true);
});

test.afterAll(() => {
    vi.unstubAllGlobals();
});
