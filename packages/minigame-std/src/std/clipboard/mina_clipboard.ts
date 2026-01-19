/**
 * @internal
 * 小游戏平台的剪贴板操作实现。
 */

import { RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { miniGameFailureToError, promisifyWithResult } from '../utils/mod.ts';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
export async function writeText(data: string): AsyncVoidIOResult {
    assertString(data);

    return (await promisifyWithResult(wx.setClipboardData)({
        data,
    }))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export async function readText(): AsyncIOResult<string> {
    return (await promisifyWithResult(wx.getClipboardData)())
        .map(x => x.data)
        .mapErr(miniGameFailureToError);
}