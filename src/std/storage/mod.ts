import type { AsyncIOResult, AsyncVoidIOResult, IOResult, VoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { clear as minaClear, clearSync as minaClearSync, getItem as minaGetItem, getItemSync as minaGetItemSync, removeItem as minaRemoveItem, removeItemSync as minaRemoveItemSync, setItem as minaSetItem, setItemSync as minaSetItemSync } from './mina_storage.ts';
import { clear as webClear, getItem as webGetItem, removeItem as webRemoveItem, setItem as webSetItem } from './web_storage.ts';

/**
 * 将数据存储在本地缓存中。
 * @param key - 数据的键名。
 * @param data - 要存储的数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    return isMinaEnv() ? await minaSetItem(key, data) : Promise.resolve(webSetItem(key, data));
}

/**
 * 从本地缓存中读取数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function getItem(key: string): AsyncIOResult<string> {
    return isMinaEnv() ? minaGetItem(key) : Promise.resolve(webGetItem(key));
}

/**
 * 从本地缓存中移除指定的数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function removeItem(key: string): AsyncVoidIOResult {
    return isMinaEnv() ? await minaRemoveItem(key) : Promise.resolve(webRemoveItem(key));
}

/**
 * 清除所有的本地存储数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function clear(): AsyncVoidIOResult {
    return isMinaEnv() ? await minaClear() : Promise.resolve(webClear());
}

/**
 * setItem 的同步版本。
 */
export function setItemSync(key: string, data: string): VoidIOResult {
    return isMinaEnv() ? minaSetItemSync(key, data) : webSetItem(key, data);
}

/**
 * getItem 的同步版本。
 */
export function getItemSync(key: string): IOResult<string> {
    return isMinaEnv() ? minaGetItemSync(key) : webGetItem(key);
}

/**
 * removeItem 的同步版本。
 */
export function removeItemSync(key: string): VoidIOResult {
    return isMinaEnv() ? minaRemoveItemSync(key) : webRemoveItem(key);
}

/**
 * clear 的同步版本。
 */
export function clearSync(): VoidIOResult {
    return isMinaEnv() ? minaClearSync() : webClear();
}