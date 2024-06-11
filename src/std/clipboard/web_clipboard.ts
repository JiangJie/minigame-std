import { Err, Ok, type AsyncResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';

/**
 * 异步写入文本数据到剪贴板。
 * @param data - 需要写入的文本数据。
 * @returns 写入操作的结果。
 */
export async function writeText(data: string): AsyncResult<boolean, DOMException> {
    assertString(data);

    try {
        await navigator.clipboard.writeText(data);
        return Ok(true);
    } catch (err) {
        return Err(err as DOMException);
    }
}

/**
 * 异步读取剪贴板文本数据。
 * @returns 读取操作的结果。
 */
export async function readText(): AsyncResult<string, DOMException> {
    try {
        const data = await navigator.clipboard.readText();
        return Ok(data);
    } catch (err) {
        return Err(err as DOMException);
    }
}