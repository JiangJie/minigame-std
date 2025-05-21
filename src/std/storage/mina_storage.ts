import { type AsyncIOResult, type AsyncVoidIOResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { tryGeneralAsyncOp, tryGeneralSyncOp } from '../utils/mod.ts';

export async function setItem(key: string, data: string): AsyncVoidIOResult {
    assertString(key);
    assertString(data);

    return tryGeneralAsyncOp(async () => {
        await wx.setStorage({
            key,
            data,
        });
    });
}

export async function getItem(key: string): AsyncIOResult<string> {
    assertString(key);

    return tryGeneralAsyncOp(async () => {
        const res = await wx.getStorage<string>({
            key,
        });
        return res.data;
    });
}

export async function removeItem(key: string): AsyncVoidIOResult {
    assertString(key);

    return tryGeneralAsyncOp(async () => {
        await wx.removeStorage({
            key,
        });
    });
}

export async function clear(): AsyncVoidIOResult {
    return tryGeneralAsyncOp(async () => {
        await wx.clearStorage();
    });
}

export async function getLength(): AsyncIOResult<number> {
    return tryGeneralAsyncOp(async () => {
        const info = await wx.getStorageInfo();
        return info.keys.length;
    });
}

export async function hasItem(key: string): AsyncIOResult<boolean> {
    assertString(key);

    return tryGeneralAsyncOp(async () => {
        const info = await wx.getStorageInfo();
        return info.keys.includes(key);
    });
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