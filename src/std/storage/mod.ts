import type { Option } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { clear as minaClear, clearSync as minaClearSync, getItem as minaGetItem, getItemSync as minaGetItemSync, removeItem as minaRemoveItem, removeItemSync as minaRemoveItemSync, setItem as minaSetItem, setItemSync as minaSetItemSync } from './mina_storage.ts';
import { clear as webClear, getItem as webGetItem, removeItem as webRemoveItem, setItem as webSetItem } from './web_storage.ts';

/**
 * 将数据存储在本地缓存中。
 * @param key - 数据的键名。
 * @param data - 要存储的数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function setItem(key: string, data: string): Promise<void> {
    if (isMinaEnv()) {
        await minaSetItem(key, data);
    } else {
        webSetItem(key, data);
    }
}

/**
 * 从本地缓存中读取数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，解析为一个 Option 类型，包含读取到的数据或者在未找到数据时为 null。
 */
export async function getItem(key: string): Promise<Option<string>> {
    return isMinaEnv() ? minaGetItem(key) : Promise.resolve(webGetItem(key));
}

/**
 * 从本地缓存中移除指定的数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function removeItem(key: string): Promise<void> {
    if (isMinaEnv()) {
        await minaRemoveItem(key);
    } else {
        webRemoveItem(key);
    }
}

/**
 * 清除所有的本地存储数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export async function clear(): Promise<void> {
    if (isMinaEnv()) {
        await minaClear();
    } else {
        webClear();
    }
}

/**
 * setItem 的同步版本。
 */
export function setItemSync(key: string, data: string): void {
    if (isMinaEnv()) {
        minaSetItemSync(key, data);
    } else {
        webSetItem(key, data);
    }
}

/**
 * getItem 的同步版本。
 */
export function getItemSync(key: string): Option<string> {
    return isMinaEnv() ? minaGetItemSync(key) : webGetItem(key);
}

/**
 * removeItem 的同步版本。
 */
export function removeItemSync(key: string): void {
    if (isMinaEnv()) {
        minaRemoveItemSync(key);
    } else {
        webRemoveItem(key);
    }
}

/**
 * clear 的同步版本。
 */
export function clearSync(): void {
    if (isMinaEnv()) {
        minaClearSync();
    } else {
        webClear();
    }
}