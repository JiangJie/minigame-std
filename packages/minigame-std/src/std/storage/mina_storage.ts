/**
 * @internal
 * 小游戏平台的存储操作实现。
 */

import { RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { asyncIOResultify, syncIOResultify } from '../utils/mod.ts';

/**
 * 异步设置存储项。
 * @param key - 存储键名。
 * @param data - 要存储的字符串数据。
 * @returns 返回操作结果。
 */
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    const setRes = await asyncIOResultify(wx.setStorage)({
        key,
        data,
    });

    return setRes.and(RESULT_VOID);
}

/**
 * 异步获取存储项。
 * @param key - 存储键名。
 * @returns 返回存储的字符串数据。
 */
export async function getItem(key: string): AsyncIOResult<string> {
    const getRes = await asyncIOResultify(wx.getStorage<string>)({
        key,
    });

    return getRes.map(x => x.data);
}

/**
 * 异步移除存储项。
 * @param key - 要移除的存储键名。
 * @returns 返回操作结果。
 */
export async function removeItem(key: string): AsyncVoidIOResult {
    const removeRes = await asyncIOResultify(wx.removeStorage)({
        key,
    });

    return removeRes.and(RESULT_VOID);
}

/**
 * 异步清空所有存储数据。
 * @returns 返回操作结果。
 */
export async function clear(): AsyncVoidIOResult {
    const clearRes = await asyncIOResultify(wx.clearStorage)();

    return clearRes.and(RESULT_VOID);
}

/**
 * 异步获取存储项数量。
 * @returns 返回存储项的数量。
 */
export async function getLength(): AsyncIOResult<number> {
    const getRes = await getStorageKeys();

    return getRes.map(x => x.length);
}

/**
 * 异步检查存储项是否存在。
 * @param key - 要检查的存储键名。
 * @returns 返回是否存在的布尔值。
 */
export async function hasItem(key: string): AsyncIOResult<boolean> {
    const getRes = await getStorageKeys();

    return getRes.map(x => x.includes(key));
}

/**
 * 同步设置存储项。
 * @param key - 存储键名。
 * @param data - 要存储的字符串数据。
 * @returns 返回操作结果。
 */
export function setItemSync(key: string, data: string): VoidIOResult {
    return syncIOResultify(wx.setStorageSync)(key, data);
}

/**
 * 同步获取存储项。
 * @param key - 存储键名。
 * @returns 返回存储的字符串数据。
 */
export function getItemSync(key: string): IOResult<string> {
    return syncIOResultify(wx.getStorageSync<string>)(key);
}

/**
 * 同步移除存储项。
 * @param key - 要移除的存储键名。
 * @returns 返回操作结果。
 */
export function removeItemSync(key: string): VoidIOResult {
    return syncIOResultify(wx.removeStorageSync)(key);
}

/**
 * 同步清空所有存储数据。
 * @returns 返回操作结果。
 */
export function clearSync(): VoidIOResult {
    return syncIOResultify(wx.clearStorageSync)();
}

/**
 * 同步获取存储项数量。
 * @returns 返回存储项的数量。
 */
export function getLengthSync(): IOResult<number> {
    return getStorageKeysSync()
        .map(x => x.length);
}

/**
 * 同步检查存储项是否存在。
 * @param key - 要检查的存储键名。
 * @returns 返回是否存在的布尔值。
 */
export function hasItemSync(key: string): IOResult<boolean> {
    return getStorageKeysSync()
        .map(x => x.includes(key));
}

// #region Internal Functions

/**
 * 获取所有存储键名。
 * @returns 返回所有存储键名的数组。
 */
async function getStorageKeys(): AsyncIOResult<string[]> {
    const getRes = await asyncIOResultify(wx.getStorageInfo)();

    return getRes.map(x => x.keys);
}

/**
 * 同步获取所有存储键名。
 * @returns 返回所有存储键名的数组。
 */
function getStorageKeysSync(): IOResult<string[]> {
    return syncIOResultify(wx.getStorageInfoSync)()
        .map(x => x.keys);
}

// #endregion