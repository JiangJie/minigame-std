import type { AsyncIOResult, AsyncVoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { tryGeneralAsyncOp } from '../utils/mod.ts';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
export async function writeText(data: string): AsyncVoidIOResult {
    assertString(data);

    return tryGeneralAsyncOp(async () => {
        await wx.setClipboardData({
            data,
        });
    });
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export async function readText(): AsyncIOResult<string> {
    return tryGeneralAsyncOp(async () => {
        const res = await wx.getClipboardData();
        return res.data;
    });
}