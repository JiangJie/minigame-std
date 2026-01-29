/**
 * 本地存储模块，提供同步和异步的键值对存储功能。
 * @module storage
 */
import type { AsyncIOResult, AsyncVoidIOResult, IOResult, VoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { validateString } from '../internal/mod.ts';
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
 * @returns 存储操作的异步结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await setItem('username', 'john');
 * if (result.isOk()) {
 *     console.log('存储成功');
 * }
 * ```
 */
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes;

    const dataRes = validateString(data);
    if (dataRes.isErr()) return dataRes;

    return isMinaEnv()
        ? minaSetItem(key, data)
        : webSetItem(key, data);
}

/**
 * 从本地缓存中读取数据。
 * @param key - 数据的键名。
 * @returns 包含数据的异步结果，如果不存在则返回空字符串。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await getItem('username');
 * if (result.isOk()) {
 *     console.log('用户名:', result.unwrap());
 * }
 * ```
 */
export async function getItem(key: string): AsyncIOResult<string> {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes.asErr();

    return isMinaEnv()
        ? minaGetItem(key)
        : webGetItem(key);
}

/**
 * 从本地缓存中移除指定的数据。
 * @param key - 数据的键名。
 * @returns 移除操作的异步结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await removeItem('username');
 * if (result.isOk()) {
 *     console.log('移除成功');
 * }
 * ```
 */
export async function removeItem(key: string): AsyncVoidIOResult {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes;

    return isMinaEnv()
        ? minaRemoveItem(key)
        : webRemoveItem(key);
}

/**
 * 清除所有的本地存储数据。
 * @returns 清除操作的异步结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await clear();
 * if (result.isOk()) {
 *     console.log('所有数据已清除');
 * }
 * ```
 */
export function clear(): AsyncVoidIOResult {
    return isMinaEnv()
        ? minaClear()
        : Promise.resolve(webClear());
}

/**
 * 获取本地存储数据的项数。
 * @returns 包含存储项数的异步结果。
 * @since 1.2.0
 * @example
 * ```ts
 * const result = await getLength();
 * if (result.isOk()) {
 *     console.log('存储项数:', result.unwrap());
 * }
 * ```
 */
export function getLength(): AsyncIOResult<number> {
    return isMinaEnv()
        ? minaGetLength()
        : Promise.resolve(webGetLength());
}

/**
 * 检查本地存储中是否存在指定的数据。
 * @param key - 数据的键名。
 * @returns 包含是否存在的布尔值的异步结果。
 * @since 1.9.3
 * @example
 * ```ts
 * const result = await hasItem('username');
 * if (result.isOk() && result.unwrap()) {
 *     console.log('键存在');
 * }
 * ```
 */
export async function hasItem(key: string): AsyncIOResult<boolean> {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes.asErr();

    return isMinaEnv()
        ? minaHasItem(key)
        : webHasItem(key);
}

/**
 * `setItem` 的同步版本，将数据存储在本地缓存中。
 * @param key - 数据的键名。
 * @param data - 要存储的数据。
 * @returns 存储操作的结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = setItemSync('username', 'john');
 * if (result.isOk()) {
 *     console.log('存储成功');
 * }
 * ```
 */
export function setItemSync(key: string, data: string): VoidIOResult {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes;

    const dataRes = validateString(data);
    if (dataRes.isErr()) return dataRes;

    return (isMinaEnv() ? minaSetItemSync : webSetItem)(key, data);
}

/**
 * `getItem` 的同步版本，从本地缓存中读取数据。
 * @param key - 数据的键名。
 * @returns 包含数据的操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = getItemSync('username');
 * if (result.isOk()) {
 *     console.log('用户名:', result.unwrap());
 * }
 * ```
 */
export function getItemSync(key: string): IOResult<string> {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes.asErr();

    return (isMinaEnv() ? minaGetItemSync : webGetItem)(key);
}

/**
 * `removeItem` 的同步版本，从本地缓存中移除指定的数据。
 * @param key - 数据的键名。
 * @returns 移除操作的结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = removeItemSync('username');
 * if (result.isOk()) {
 *     console.log('移除成功');
 * }
 * ```
 */
export function removeItemSync(key: string): VoidIOResult {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes;

    return (isMinaEnv() ? minaRemoveItemSync : webRemoveItem)(key);
}

/**
 * `clear` 的同步版本，清除所有的本地存储数据。
 * @returns 清除操作的结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = clearSync();
 * if (result.isOk()) {
 *     console.log('所有数据已清除');
 * }
 * ```
 */
export function clearSync(): VoidIOResult {
    return (isMinaEnv() ? minaClearSync : webClear)();
}

/**
 * `getLength` 的同步版本，获取本地存储数据的项数。
 * @returns 包含存储项数的操作结果。
 * @since 1.2.0
 * @example
 * ```ts
 * const result = getLengthSync();
 * if (result.isOk()) {
 *     console.log('存储项数:', result.unwrap());
 * }
 * ```
 */
export function getLengthSync(): IOResult<number> {
    return (isMinaEnv() ? minaGetLengthSync : webGetLength)();
}

/**
 * `hasItem` 的同步版本，检查本地存储中是否存在指定的数据。
 * @param key - 数据的键名。
 * @returns 包含是否存在的布尔值的操作结果。
 * @since 1.9.3
 * @example
 * ```ts
 * const result = hasItemSync('username');
 * if (result.isOk() && result.unwrap()) {
 *     console.log('键存在');
 * }
 * ```
 */
export function hasItemSync(key: string): IOResult<boolean> {
    const keyRes = validateString(key);
    if (keyRes.isErr()) return keyRes.asErr();

    return (isMinaEnv() ? minaHasItemSync : webHasItem)(key);
}
