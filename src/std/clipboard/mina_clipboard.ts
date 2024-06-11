import { Err, Ok, type AsyncResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
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

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export async function readText(): AsyncResult<string, WechatMinigame.GeneralCallbackResult> {
    try {
        const res = await wx.getClipboardData();
        return Ok(res.data);
    } catch (err) {
        return Err(err as WechatMinigame.GeneralCallbackResult);
    }
}