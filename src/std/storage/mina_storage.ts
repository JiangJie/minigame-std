import { None, Some, type Option } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';

export async function setItem(key: string, data: string): Promise<void> {
    assertString(key);
    assertString(data);

    try {
        await wx.setStorage({
            key,
            data,
        });
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
    }
}

export async function getItem(key: string): Promise<Option<string>> {
    assertString(key);

    try {
        const res = await wx.getStorage<string>({
            key,
        });
        return Some(res.data);
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
        return None;
    }
}

export async function removeItem(key: string): Promise<void> {
    assertString(key);

    try {
        await wx.removeStorage({
            key,
        });
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
    }
}

export async function clear(): Promise<void> {
    try {
        await wx.clearStorage();
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
    }
}

export function setItemSync(key: string, data: string): void {
    assertString(key);
    assertString(data);

    try {
        wx.setStorageSync(key, data);
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
    }
}

export function getItemSync(key: string): Option<string> {
    assertString(key);

    try {
        const data = wx.getStorageSync<string>(key);
        return Some(data);
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
        return None;
    }
}

export function removeItemSync(key: string): void {
    assertString(key);

    try {
        wx.removeStorageSync(key);
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
    }
}

export function clearSync(): void {
    try {
        wx.clearStorageSync();
    } catch (err) {
        console.error((err as WechatMinigame.GeneralCallbackResult)?.errMsg);
    }
}