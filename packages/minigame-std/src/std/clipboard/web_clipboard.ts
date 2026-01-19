/**
 * @internal
 * Web 平台的剪贴板操作实现。
 */

import { tryAsyncResult, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
export function writeText(data: string): AsyncVoidIOResult {
    return tryAsyncResult(navigator.clipboard.writeText(data));
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export async function readText(): AsyncIOResult<string> {
    return tryAsyncResult(navigator.clipboard.readText());
}