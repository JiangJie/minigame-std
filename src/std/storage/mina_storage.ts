import { Ok, RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { generalErrorToResult } from '../utils/mod.ts';

export async function setItem(key: string, data: string): AsyncVoidIOResult {
    assertString(key);
    assertString(data);

    try {
        await wx.setStorage({
            key,
            data,
        });
        return RESULT_VOID;
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export async function getItem(key: string): AsyncIOResult<string> {
    assertString(key);

    try {
        const res = await wx.getStorage<string>({
            key,
        });
        return Ok(res.data);
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export async function removeItem(key: string): AsyncVoidIOResult {
    assertString(key);

    try {
        await wx.removeStorage({
            key,
        });
        return RESULT_VOID;
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export async function clear(): AsyncVoidIOResult {
    try {
        await wx.clearStorage();
        return RESULT_VOID;
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export async function getLength(): AsyncIOResult<number> {
    try {
        const info = await wx.getStorageInfo();
        return Ok(info.keys.length);
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export function setItemSync(key: string, data: string): VoidIOResult {
    assertString(key);
    assertString(data);

    try {
        wx.setStorageSync(key, data);
        return RESULT_VOID;
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export function getItemSync(key: string): IOResult<string> {
    assertString(key);

    try {
        const data = wx.getStorageSync<string>(key);
        return Ok(data);
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export function removeItemSync(key: string): VoidIOResult {
    assertString(key);

    try {
        wx.removeStorageSync(key);
        return RESULT_VOID;
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export function clearSync(): VoidIOResult {
    try {
        wx.clearStorageSync();
        return RESULT_VOID;
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}

export function getLengthSync(): IOResult<number> {
    try {
        const info = wx.getStorageInfoSync();
        return Ok(info.keys.length);
    } catch (err) {
        return generalErrorToResult(err as WechatMinigame.GeneralCallbackResult);
    }
}