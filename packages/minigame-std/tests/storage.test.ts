import { expect, test } from 'vitest';
import { storage } from '../src/mod.ts';

test('storage setItemSync and getItemSync', () => {
    const key = 'test-key';
    const value = 'test-value';

    // Clear before test
    storage.clearSync();

    // Set item
    const setResult = storage.setItemSync(key, value);
    expect(setResult.isOk()).toBe(true);

    // Get item
    const getResult = storage.getItemSync(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
});

test('storage getItemSync non-existent item', () => {
    storage.clearSync();

    const getResult = storage.getItemSync('non-existent-key');
    expect(getResult.isErr()).toBe(true);
});

test('storage hasItemSync', () => {
    storage.clearSync();

    const key = 'test-has-key';

    // Check before setting
    let hasResult = storage.hasItemSync(key);
    expect(hasResult.isOk()).toBe(true);
    expect(hasResult.unwrap()).toBe(false);

    // Set item
    storage.setItemSync(key, 'value');

    // Check after setting
    hasResult = storage.hasItemSync(key);
    expect(hasResult.unwrap()).toBe(true);
});

test('storage removeItemSync', () => {
    storage.clearSync();

    const key = 'test-remove-key';
    const value = 'test-value';

    // Set and verify
    storage.setItemSync(key, value);
    expect(storage.hasItemSync(key).unwrap()).toBe(true);

    // Remove
    const removeResult = storage.removeItemSync(key);
    expect(removeResult.isOk()).toBe(true);

    // Verify removal
    expect(storage.hasItemSync(key).unwrap()).toBe(false);
});

test('storage clearSync', () => {
    // Add multiple items
    storage.setItemSync('key1', 'value1');
    storage.setItemSync('key2', 'value2');
    storage.setItemSync('key3', 'value3');

    // Clear all
    const clearResult = storage.clearSync();
    expect(clearResult.isOk()).toBe(true);

    // Verify all cleared
    expect(storage.hasItemSync('key1').unwrap()).toBe(false);
    expect(storage.hasItemSync('key2').unwrap()).toBe(false);
    expect(storage.hasItemSync('key3').unwrap()).toBe(false);
});

test('storage getLengthSync', () => {
    storage.clearSync();

    // Initial length should be 0
    let lengthResult = storage.getLengthSync();
    expect(lengthResult.isOk()).toBe(true);
    expect(lengthResult.unwrap()).toBe(0);

    // Add items
    storage.setItemSync('key1', 'value1');
    storage.setItemSync('key2', 'value2');

    // Length should be 2
    lengthResult = storage.getLengthSync();
    expect(lengthResult.unwrap()).toBe(2);
});

test('storage special characters sync', () => {
    storage.clearSync();

    const key = '特殊-key-🔑';
    const value = 'Special value with 中文 and emoji 🚀';

    storage.setItemSync(key, value);

    const getResult = storage.getItemSync(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
});

test('storage overwrite existing key sync', () => {
    storage.clearSync();

    const key = 'overwrite-key';

    storage.setItemSync(key, 'original-value');
    expect(storage.getItemSync(key).unwrap()).toBe('original-value');

    storage.setItemSync(key, 'new-value');
    expect(storage.getItemSync(key).unwrap()).toBe('new-value');
});

test('storage async setItem and getItem', async () => {
    const key = 'test-async-key';
    const value = 'test-async-value';

    await storage.clear();

    // Set item
    const setResult = await storage.setItem(key, value);
    expect(setResult.isOk()).toBe(true);

    // Get item
    const getResult = await storage.getItem(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
});

test('storage async removeItem', async () => {
    const key = 'test-async-remove';

    await storage.clear();
    await storage.setItem(key, 'value');

    const removeResult = await storage.removeItem(key);
    expect(removeResult.isOk()).toBe(true);

    const hasResult = await storage.hasItem(key);
    expect(hasResult.unwrap()).toBe(false);
});

test('storage async clear', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');

    const clearResult = await storage.clear();
    expect(clearResult.isOk()).toBe(true);

    const hasResult1 = await storage.hasItem('key1');
    const hasResult2 = await storage.hasItem('key2');
    expect(hasResult1.unwrap()).toBe(false);
    expect(hasResult2.unwrap()).toBe(false);
});

test('storage async getLength', async () => {
    await storage.clear();

    // Initial length should be 0
    let lengthResult = await storage.getLength();
    expect(lengthResult.isOk()).toBe(true);
    expect(lengthResult.unwrap()).toBe(0);

    // Add items
    await storage.setItem('async-key1', 'value1');
    await storage.setItem('async-key2', 'value2');
    await storage.setItem('async-key3', 'value3');

    // Length should be 3
    lengthResult = await storage.getLength();
    expect(lengthResult.isOk()).toBe(true);
    expect(lengthResult.unwrap()).toBe(3);

    // Remove one item
    await storage.removeItem('async-key2');

    // Length should be 2
    lengthResult = await storage.getLength();
    expect(lengthResult.unwrap()).toBe(2);

    // Clear all
    await storage.clear();

    // Length should be 0 again
    lengthResult = await storage.getLength();
    expect(lengthResult.unwrap()).toBe(0);
});

test('storage getLength and getLengthSync consistency', async () => {
    await storage.clear();

    // Add items
    storage.setItemSync('sync-key1', 'value1');
    await storage.setItem('async-key2', 'value2');

    // Both sync and async getLength should return same value
    const syncLength = storage.getLengthSync();
    const asyncLength = await storage.getLength();

    expect(syncLength.isOk()).toBe(true);
    expect(asyncLength.isOk()).toBe(true);
    expect(syncLength.unwrap()).toBe(asyncLength.unwrap());
    expect(syncLength.unwrap()).toBe(2);
});

// ============ 验证失败的测试用例 ============

test('setItemSync should fail with invalid key', () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = storage.setItemSync(null, 'value');
    expect(result.isErr()).toBe(true);
});

test('setItemSync should fail with invalid data', () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = storage.setItemSync('key', null);
    expect(result.isErr()).toBe(true);
});

test('getItemSync should fail with invalid key', () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = storage.getItemSync(undefined);
    expect(result.isErr()).toBe(true);
});

test('removeItemSync should fail with invalid key', () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = storage.removeItemSync(123);
    expect(result.isErr()).toBe(true);
});

test('hasItemSync should fail with invalid key', () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = storage.hasItemSync({});
    expect(result.isErr()).toBe(true);
});

test('async setItem should fail with invalid key', async () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = await storage.setItem(null, 'value');
    expect(result.isErr()).toBe(true);
});

test('async setItem should fail with invalid data', async () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = await storage.setItem('key', undefined);
    expect(result.isErr()).toBe(true);
});

test('async getItem should fail with invalid key', async () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = await storage.getItem(12345);
    expect(result.isErr()).toBe(true);
});

test('async removeItem should fail with invalid key', async () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = await storage.removeItem([]);
    expect(result.isErr()).toBe(true);
});

test('async hasItem should fail with invalid key', async () => {
    // @ts-expect-error 测试无效参数, 应该返回 Err
    const result = await storage.hasItem(false);
    expect(result.isErr()).toBe(true);
});
