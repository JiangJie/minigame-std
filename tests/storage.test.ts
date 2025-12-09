import { expect, test } from 'vitest';
import { storage } from 'minigame-std';

// localStorage in jsdom is not fully implemented, so we skip these tests in jsdom environment
const isJsdom = typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.clear !== 'function';

test.skipIf(isJsdom)('storage setItemSync and getItemSync', () => {
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

test.skipIf(isJsdom)('storage getItemSync non-existent item', () => {
    storage.clearSync();
    
    const getResult = storage.getItemSync('non-existent-key');
    expect(getResult.isErr()).toBe(true);
});

test.skipIf(isJsdom)('storage hasItemSync', () => {
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

test.skipIf(isJsdom)('storage removeItemSync', () => {
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

test.skipIf(isJsdom)('storage clearSync', () => {
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

test.skipIf(isJsdom)('storage getLengthSync', () => {
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

test.skipIf(isJsdom)('storage special characters sync', () => {
    storage.clearSync();
    
    const key = '特殊-key-🔑';
    const value = 'Special value with 中文 and emoji 🚀';
    
    storage.setItemSync(key, value);
    
    const getResult = storage.getItemSync(key);
    expect(getResult.isOk()).toBe(true);
    expect(getResult.unwrap()).toBe(value);
});

test.skipIf(isJsdom)('storage overwrite existing key sync', () => {
    storage.clearSync();
    
    const key = 'overwrite-key';
    
    storage.setItemSync(key, 'original-value');
    expect(storage.getItemSync(key).unwrap()).toBe('original-value');
    
    storage.setItemSync(key, 'new-value');
    expect(storage.getItemSync(key).unwrap()).toBe('new-value');
});

test.skipIf(isJsdom)('storage async setItem and getItem', async () => {
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

test.skipIf(isJsdom)('storage async removeItem', async () => {
    const key = 'test-async-remove';
    
    await storage.clear();
    await storage.setItem(key, 'value');
    
    const removeResult = await storage.removeItem(key);
    expect(removeResult.isOk()).toBe(true);
    
    const hasResult = await storage.hasItem(key);
    expect(hasResult.unwrap()).toBe(false);
});

test.skipIf(isJsdom)('storage async clear', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    
    const clearResult = await storage.clear();
    expect(clearResult.isOk()).toBe(true);
    
    const hasResult1 = await storage.hasItem('key1');
    const hasResult2 = await storage.hasItem('key2');
    expect(hasResult1.unwrap()).toBe(false);
    expect(hasResult2.unwrap()).toBe(false);
});
