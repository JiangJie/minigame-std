import { Err, Ok, type AsyncResult } from '@happy-js/happy-rusty';
import { assertString } from '../assert/assertions.ts';

export async function writeText(data: string): AsyncResult<boolean, WechatMinigame.GeneralCallbackResult> {
    assertString(data);

    try {
        await wx.setClipboardData({
            data,
        });
        return Ok(true);
    } catch (err) {
        return Err(err as WechatMinigame.GeneralCallbackResult);
    }
}

export async function readText(): AsyncResult<string, WechatMinigame.GeneralCallbackResult> {
    try {
        const res = await wx.getClipboardData();
        return Ok(res.data);
    } catch (err) {
        return Err(err as WechatMinigame.GeneralCallbackResult);
    }
}