import type { AsyncIOResult, AsyncVoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { readText as minaReadText, writeText as minaWriteText } from './mina_clipboard.ts';
import { readText as webReadText, writeText as webWriteText } from './web_clipboard.ts';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await writeText('Hello, World!');
 * if (result.isOk()) {
 *     console.log('文本已复制到剪贴板');
 * } else {
 *     console.error('复制失败:', result.unwrapErr());
 * }
 * ```
 */
export function writeText(data: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaWriteText : webWriteText)(data);
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await readText();
 * if (result.isOk()) {
 *     console.log('剪贴板内容:', result.unwrap());
 * } else {
 *     console.error('读取失败:', result.unwrapErr());
 * }
 * ```
 */
export function readText(): AsyncIOResult<string> {
    return (isMinaEnv() ? minaReadText : webReadText)();
}