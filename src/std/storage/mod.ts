import type { Option } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { clear as minaClear, getItem as minaGetItem, removeItem as minaRemoveItem, setItem as minaSetItem } from './mina_storage.ts';
import { clear as webClear, getItem as webGetItem, removeItem as webRemoveItem, setItem as webSetItem } from './web_storage.ts';

/**
 * 将数据存储在本地缓存中。
 * @param key - 数据的键名。
 * @param data - 要存储的数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export function setItem(key: string, data: string): Promise<void> {
    return isMinaEnv() ? minaSetItem(key, data) : webSetItem(key, data);
}

/**
 * 从本地缓存中读取数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，解析为一个 Option 类型，包含读取到的数据或者在未找到数据时为 null。
 */
export function getItem(key: string): Promise<Option<string>> {
    return isMinaEnv() ? minaGetItem(key) : webGetItem(key);
}

/**
 * 从本地缓存中移除指定的数据。
 * @param key - 数据的键名。
 * @returns 返回一个 Promise，表示操作完成。
 */
export function removeItem(key: string): Promise<void> {
    return isMinaEnv() ? minaRemoveItem(key) : webRemoveItem(key);
}

/**
 * 清除所有的本地存储数据。
 * @returns 返回一个 Promise，表示操作完成。
 */
export function clear(): Promise<void> {
    return isMinaEnv() ? minaClear() : webClear();
}