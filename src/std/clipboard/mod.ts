import type { AsyncResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { readText as minaReadText, writeText as minaWriteText } from './mina_clipboard.ts';
import { readText as webReadText, writeText as webWriteText } from './web_clipboard.ts';

export type WriteResult = AsyncResult<boolean, DOMException | WechatMinigame.GeneralCallbackResult>;
export type ReadResult = AsyncResult<string, DOMException | WechatMinigame.GeneralCallbackResult>;

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
export function writeText(data: string): WriteResult {
    return isMinaEnv() ? minaWriteText(data) as WriteResult : webWriteText(data) as WriteResult;
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export function readText(): ReadResult {
    return isMinaEnv() ? minaReadText() as ReadResult : webReadText() as ReadResult;
}