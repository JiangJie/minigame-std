// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assertEquals } from '@std/assert';
import { storage } from 'minigame-std';

Deno.test('storage setItemSync and getItemSync', () => {
    const key = 'test-key';
    const value = 'test-value';
    
    // Clear before test
    storage.clearSync();
    
    // Set item
    const setResult = storage.setItemSync(key, value);
    assertEquals(setResult.isOk(), true, 'setItemSync should succeed');
    
    // Get item
    const getResult = storage.getItemSync(key);
    assertEquals(getResult.isOk(), true, 'getItemSync should succeed');
    assertEquals(getResult.unwrap(), value, 'Retrieved value should match');
});

Deno.test('storage getItemSync non-existent item', () => {
    storage.clearSync();
    
    const getResult = storage.getItemSync('non-existent-key');
    assertEquals(getResult.isErr(), true, 'getItemSync should fail for non-existent key');
});

Deno.test('storage hasItemSync', () => {
    storage.clearSync();
    
    const key = 'test-has-key';
    
    // Check before setting
    let hasResult = storage.hasItemSync(key);
    assertEquals(hasResult.isOk(), true, 'hasItemSync should return Ok');
    assertEquals(hasResult.unwrap(), false, 'Key should not exist initially');
    
    // Set item
    storage.setItemSync(key, 'value');
    
    // Check after setting
    hasResult = storage.hasItemSync(key);
    assertEquals(hasResult.unwrap(), true, 'Key should exist after setting');
});

Deno.test('storage removeItemSync', () => {
    storage.clearSync();
    
    const key = 'test-remove-key';
    const value = 'test-value';
    
    // Set and verify
    storage.setItemSync(key, value);
    assertEquals(storage.hasItemSync(key).unwrap(), true);
    
    // Remove
    const removeResult = storage.removeItemSync(key);
    assertEquals(removeResult.isOk(), true, 'removeItemSync should succeed');
    
    // Verify removal
    assertEquals(storage.hasItemSync(key).unwrap(), false, 'Key should not exist after removal');
});

Deno.test('storage clearSync', () => {
    // Add multiple items
    storage.setItemSync('key1', 'value1');
    storage.setItemSync('key2', 'value2');
    storage.setItemSync('key3', 'value3');
    
    // Clear all
    const clearResult = storage.clearSync();
    assertEquals(clearResult.isOk(), true, 'clearSync should succeed');
    
    // Verify all cleared
    assertEquals(storage.hasItemSync('key1').unwrap(), false);
    assertEquals(storage.hasItemSync('key2').unwrap(), false);
    assertEquals(storage.hasItemSync('key3').unwrap(), false);
});

Deno.test('storage getLengthSync', () => {
    storage.clearSync();
    
    // Initial length should be 0
    let lengthResult = storage.getLengthSync();
    assertEquals(lengthResult.isOk(), true);
    assertEquals(lengthResult.unwrap(), 0, 'Initial length should be 0');
    
    // Add items
    storage.setItemSync('key1', 'value1');
    storage.setItemSync('key2', 'value2');
    
    // Length should be 2
    lengthResult = storage.getLengthSync();
    assertEquals(lengthResult.unwrap(), 2, 'Length should be 2 after adding 2 items');
});

Deno.test('storage special characters sync', () => {
    storage.clearSync();
    
    const key = '特殊-key-🔑';
    const value = 'Special value with 中文 and emoji 🚀';
    
    storage.setItemSync(key, value);
    
    const getResult = storage.getItemSync(key);
    assertEquals(getResult.isOk(), true);
    assertEquals(getResult.unwrap(), value, 'Special characters should be preserved');
});

Deno.test('storage overwrite existing key sync', () => {
    storage.clearSync();
    
    const key = 'overwrite-key';
    
    storage.setItemSync(key, 'original-value');
    assertEquals(storage.getItemSync(key).unwrap(), 'original-value');
    
    storage.setItemSync(key, 'new-value');
    assertEquals(storage.getItemSync(key).unwrap(), 'new-value', 'Value should be overwritten');
});

Deno.test('storage async setItem and getItem', async () => {
    const key = 'test-async-key';
    const value = 'test-async-value';
    
    await storage.clear();
    
    // Set item
    const setResult = await storage.setItem(key, value);
    assertEquals(setResult.isOk(), true, 'setItem should succeed');
    
    // Get item
    const getResult = await storage.getItem(key);
    assertEquals(getResult.isOk(), true, 'getItem should succeed');
    assertEquals(getResult.unwrap(), value, 'Retrieved value should match');
});

Deno.test('storage async removeItem', async () => {
    const key = 'test-async-remove';
    
    await storage.clear();
    await storage.setItem(key, 'value');
    
    const removeResult = await storage.removeItem(key);
    assertEquals(removeResult.isOk(), true, 'removeItem should succeed');
    
    const hasResult = await storage.hasItem(key);
    assertEquals(hasResult.unwrap(), false, 'Key should not exist after removal');
});

Deno.test('storage async clear', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    
    const clearResult = await storage.clear();
    assertEquals(clearResult.isOk(), true, 'clear should succeed');
    
    const hasResult1 = await storage.hasItem('key1');
    const hasResult2 = await storage.hasItem('key2');
    assertEquals(hasResult1.unwrap(), false);
    assertEquals(hasResult2.unwrap(), false);
});
