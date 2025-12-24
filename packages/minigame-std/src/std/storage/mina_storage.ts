/**
 * @internal
 * Mini-game platform implementation for storage operations.
 */

import { RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { miniGameFailureToError, promisifyWithResult, tryGeneralSyncOp } from '../utils/mod.ts';

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

export async function getItem(key: string): AsyncIOResult<string> {
    assertString(key);

    return (await promisifyWithResult(wx.getStorage<string>)({
        key,
    }))
        .map(x => x.data)
        .mapErr(miniGameFailureToError);
}

export async function removeItem(key: string): AsyncVoidIOResult {
    assertString(key);

    return (await promisifyWithResult(wx.removeStorage)({
        key,
    }))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

export async function clear(): AsyncVoidIOResult {
    return (await promisifyWithResult(wx.clearStorage)({}))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

export async function getLength(): AsyncIOResult<number> {
    return (await promisifyWithResult(wx.getStorageInfo)({}))
        .map(x => x.keys.length)
        .mapErr(miniGameFailureToError);
}

export async function hasItem(key: string): AsyncIOResult<boolean> {
    assertString(key);

    return (await promisifyWithResult(wx.getStorageInfo)({}))
        .map(x => x.keys.includes(key))
        .mapErr(miniGameFailureToError);
}

export function setItemSync(key: string, data: string): VoidIOResult {
    assertString(key);
    assertString(data);

    return tryGeneralSyncOp(() => {
        wx.setStorageSync(key, data);
    });
}

export function getItemSync(key: string): IOResult<string> {
    assertString(key);

    return tryGeneralSyncOp(() => {
        return wx.getStorageSync<string>(key);
    });
}

export function removeItemSync(key: string): VoidIOResult {
    assertString(key);

    return tryGeneralSyncOp(() => {
        wx.removeStorageSync(key);
    });
}

export function clearSync(): VoidIOResult {
    return tryGeneralSyncOp(() => {
        wx.clearStorageSync();
    });
}

export function getLengthSync(): IOResult<number> {
    return tryGeneralSyncOp(() => {
        const info = wx.getStorageInfoSync();
        return info.keys.length;
    });
}

export function hasItemSync(key: string): IOResult<boolean> {
    assertString(key);

    return tryGeneralSyncOp(() => {
        const info = wx.getStorageInfoSync();
        return info.keys.includes(key);
    });
}