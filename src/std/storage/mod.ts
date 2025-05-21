import type { AsyncIOResult, AsyncVoidIOResult, IOResult, VoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import {
    clear as minaClear,
    clearSync as minaClearSync,
    getItem as minaGetItem,
    getItemSync as minaGetItemSync,
    getLength as minaGetLength,
    getLengthSync as minaGetLengthSync,
    hasItem as minaHasItem,
    hasItemSync as minaHasItemSync,
    removeItem as minaRemoveItem,
    removeItemSync as minaRemoveItemSync,
    setItem as minaSetItem,
    setItemSync as minaSetItemSync,
} from './mina_storage.ts';
import {
    clear as webClear,
    getItem as webGetItem,
    getLength as webGetLength,
    hasItem as webHasItem,
    removeItem as webRemoveItem,
    setItem as webSetItem,
} from './web_storage.ts';

/**
 * 将数据存储在本地缓存中。
 * @param key - 数据的键名。
 * @param data - 要存储的数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    return isMinaEnv()
        ? await minaSetItem(key, data)
        : Promise.resolve(webSetItem(key, data));
}

/**
 * 从本地缓存中读取数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function getItem(key: string): AsyncIOResult<string> {
    return isMinaEnv()
        ? minaGetItem(key)
        : Promise.resolve(webGetItem(key));
}

/**
 * 从本地缓存中移除指定的数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function removeItem(key: string): AsyncVoidIOResult {
    return isMinaEnv()
        ? await minaRemoveItem(key)
        : Promise.resolve(webRemoveItem(key));
}

/**
 * 清除所有的本地存储数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function clear(): AsyncVoidIOResult {
    return isMinaEnv()
        ? await minaClear()
        : Promise.resolve(webClear());
}

/**
 * 获取本地存储数据的长度。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function getLength(): AsyncIOResult<number> {
    return isMinaEnv()
        ? await minaGetLength()
        : Promise.resolve(getLength());
}

/**
 * 检查本地存储中是否存在指定的数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function hasItem(key: string): AsyncIOResult<boolean> {
    return isMinaEnv()
        ? await minaHasItem(key)
        : Promise.resolve(webHasItem(key));
}

/**
 * `setItem` 的同步版本。
 */
export function setItemSync(key: string, data: string): VoidIOResult {
    return (isMinaEnv() ? minaSetItemSync : webSetItem)(key, data);
}

/**
 * `getItem` 的同步版本。
 */
export function getItemSync(key: string): IOResult<string> {
    return (isMinaEnv() ? minaGetItemSync : webGetItem)(key);
}

/**
 * `removeItem` 的同步版本。
 */
export function removeItemSync(key: string): VoidIOResult {
    return (isMinaEnv() ? minaRemoveItemSync : webRemoveItem)(key);
}

/**
 * `clear` 的同步版本。
 */
export function clearSync(): VoidIOResult {
    return (isMinaEnv() ? minaClearSync : webClear)();
}

/**
 * `getLength` 的同步版本。
 */
export function getLengthSync(): IOResult<number> {
    return (isMinaEnv() ? minaGetLengthSync : webGetLength)();
}

/**
 * `hasItem` 的同步版本。
 * @param key - 数据的键名。
 */
export function hasItemSync(key: string): IOResult<boolean> {
    return (isMinaEnv() ? minaHasItemSync : webHasItem)(key);
}