/**
 * @internal
 * Web 平台的存储操作实现。
 */

import { Err, Ok, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { tryDOMSyncOp } from '../utils/mod.ts';

/**
 * 执行操作并包装为 IOResult。
 * @param op - 要执行的操作函数。
 * @returns 返回操作结果。
 */
function callOp<T>(op: () => T): IOResult<T> {
    const res = op();
    return Ok(res);
}

/**
 * 设置存储项。
 * @param key - 存储键名。
 * @param data - 要存储的字符串数据。
 * @returns 返回操作结果。
 */
export function setItem(key: string, data: string): VoidIOResult {
    assertString(key);
    assertString(data);

    return tryDOMSyncOp(() => {
        localStorage.setItem(key, data);
    });
}

/**
 * 获取存储项。
 * @param key - 存储键名。
 * @returns 返回存储的字符串数据，若不存在则返回错误。
 */
export function getItem(key: string): IOResult<string> {
    assertString(key);

    const data = localStorage.getItem(key);
    return data == null ? Err(new Error(`${ key } not exists`)) : Ok(data);
}

/**
 * 移除存储项。
 * @param key - 要移除的存储键名。
 * @returns 返回操作结果。
 */
export function removeItem(key: string): VoidIOResult {
    assertString(key);

    return callOp(() => {
        localStorage.removeItem(key);
    });
}

/**
 * 清空所有存储数据。
 * @returns 返回操作结果。
 */
export function clear(): VoidIOResult {
    return callOp(() => {
        localStorage.clear();
    });
}

/**
 * 获取存储项数量。
 * @returns 返回存储项的数量。
 */
export function getLength(): IOResult<number> {
    return callOp(() => {
        return localStorage.length;
    });
}

/**
 * 检查存储项是否存在。
 * @param key - 要检查的存储键名。
 * @returns 返回是否存在的布尔值。
 */
export function hasItem(key: string): IOResult<boolean> {
    assertString(key);

    return callOp(() => {
        return localStorage.getItem(key) != null;
    });
}