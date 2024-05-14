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
        const res = await wx.getStorage({
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