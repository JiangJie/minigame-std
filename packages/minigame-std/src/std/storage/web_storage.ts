/**
 * @internal
 * Web 平台的存储操作实现。
 */

import { Err, Ok, RESULT_VOID, tryResult, type IOResult, type VoidIOResult } from 'happy-rusty';

/**
 * 设置存储项。
 * @param key - 存储键名。
 * @param data - 要存储的字符串数据。
 * @returns 返回操作结果。
 */
export function setItem(key: string, data: string): VoidIOResult {
    return tryResult(() => {
        // 可能会抛出异常，例如存储空间不足等情况
        localStorage.setItem(key, data);
    });
}

/**
 * 获取存储项。
 * @param key - 存储键名。
 * @returns 返回存储的字符串数据，若不存在则返回错误。
 */
export function getItem(key: string): IOResult<string> {
    const data = localStorage.getItem(key);
    return data == null ? Err(new Error(`Key '${key}' does not exist`)) : Ok(data);
}

/**
 * 移除存储项。
 * @param key - 要移除的存储键名。
 * @returns 返回操作结果。
 */
export function removeItem(key: string): VoidIOResult {
    localStorage.removeItem(key);
    return RESULT_VOID;
}

/**
 * 清空所有存储数据。
 * @returns 返回操作结果。
 */
export function clear(): VoidIOResult {
    localStorage.clear();
    return RESULT_VOID;
}

/**
 * 获取存储项数量。
 * @returns 返回存储项的数量。
 */
export function getLength(): IOResult<number> {
    return Ok(localStorage.length);
}

/**
 * 检查存储项是否存在。
 * @param key - 要检查的存储键名。
 * @returns 返回是否存在的布尔值。
 */
export function hasItem(key: string): IOResult<boolean> {
    return Ok(localStorage.getItem(key) != null);
}
