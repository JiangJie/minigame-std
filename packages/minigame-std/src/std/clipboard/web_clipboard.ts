/**
 * @internal
 * Web 平台的剪贴板操作实现。
 */

import type { AsyncIOResult, AsyncVoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { tryDOMAsyncOp } from '../utils/mod.ts';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
export async function writeText(data: string): AsyncVoidIOResult {
    assertString(data);

    return tryDOMAsyncOp(async () => {
        await navigator.clipboard.writeText(data);
    });
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export async function readText(): AsyncIOResult<string> {
    return tryDOMAsyncOp(async () => {
        const data = await navigator.clipboard.readText();
        return data;
    });
}