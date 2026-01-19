/**
 * @internal
 * 小游戏平台的存储操作实现。
 */

import { RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { miniGameFailureToError, promisifyWithResult, tryGeneralSyncOp } from '../utils/mod.ts';

/**
 * 异步设置存储项。
 * @param key - 存储键名。
 * @param data - 要存储的字符串数据。
 * @returns 返回操作结果。
 */
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    assertString(key);
    assertString(data);

    return (await promisifyWithResult(wx.setStorage)({
        key,
        data,
    }))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

/**
 * 异步获取存储项。
 * @param key - 存储键名。
 * @returns 返回存储的字符串数据。
 */
export async function getItem(key: string): AsyncIOResult<string> {
    assertString(key);

    return (await promisifyWithResult(wx.getStorage<string>)({
        key,
    }))
        .map(x => x.data)
        .mapErr(miniGameFailureToError);
}

/**
 * 异步移除存储项。
 * @param key - 要移除的存储键名。
 * @returns 返回操作结果。
 */
export async function removeItem(key: string): AsyncVoidIOResult {
    assertString(key);

    return (await promisifyWithResult(wx.removeStorage)({
        key,
    }))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

/**
 * 异步清空所有存储数据。
 * @returns 返回操作结果。
 */
export async function clear(): AsyncVoidIOResult {
    return (await promisifyWithResult(wx.clearStorage)({}))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

/**
 * 异步获取存储项数量。
 * @returns 返回存储项的数量。
 */
export async function getLength(): AsyncIOResult<number> {
    return (await promisifyWithResult(wx.getStorageInfo)({}))
        .map(x => x.keys.length)
        .mapErr(miniGameFailureToError);
}

/**
 * 异步检查存储项是否存在。
 * @param key - 要检查的存储键名。
 * @returns 返回是否存在的布尔值。
 */
export async function hasItem(key: string): AsyncIOResult<boolean> {
    assertString(key);

    return (await promisifyWithResult(wx.getStorageInfo)({}))
        .map(x => x.keys.includes(key))
        .mapErr(miniGameFailureToError);
}

/**
 * 同步设置存储项。
 * @param key - 存储键名。
 * @param data - 要存储的字符串数据。
 * @returns 返回操作结果。
 */
export function setItemSync(key: string, data: string): VoidIOResult {
    assertString(key);
    assertString(data);

    return tryGeneralSyncOp(() => {
        wx.setStorageSync(key, data);
    });
}

/**
 * 同步获取存储项。
 * @param key - 存储键名。
 * @returns 返回存储的字符串数据。
 */
export function getItemSync(key: string): IOResult<string> {
    assertString(key);

    return tryGeneralSyncOp(() => {
        return wx.getStorageSync<string>(key);
    });
}

/**
 * 同步移除存储项。
 * @param key - 要移除的存储键名。
 * @returns 返回操作结果。
 */
export function removeItemSync(key: string): VoidIOResult {
    assertString(key);

    return tryGeneralSyncOp(() => {
        wx.removeStorageSync(key);
    });
}

/**
 * 同步清空所有存储数据。
 * @returns 返回操作结果。
 */
export function clearSync(): VoidIOResult {
    return tryGeneralSyncOp(() => {
        wx.clearStorageSync();
    });
}

/**
 * 同步获取存储项数量。
 * @returns 返回存储项的数量。
 */
export function getLengthSync(): IOResult<number> {
    return tryGeneralSyncOp(() => {
        const info = wx.getStorageInfoSync();
        return info.keys.length;
    });
}

/**
 * 同步检查存储项是否存在。
 * @param key - 要检查的存储键名。
 * @returns 返回是否存在的布尔值。
 */
export function hasItemSync(key: string): IOResult<boolean> {
    assertString(key);

    return tryGeneralSyncOp(() => {
        const info = wx.getStorageInfoSync();
        return info.keys.includes(key);
    });
}