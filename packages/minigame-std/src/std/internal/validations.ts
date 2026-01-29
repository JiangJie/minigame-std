/**
 * @internal
 * 断言相关辅助函数。
 */

import { Err, RESULT_VOID, type VoidIOResult } from 'happy-rusty';

/**
 * 验证传入的值是否为字符串。
 * @param str - 需要验证的值。
 * @param name - 参数名称，用于错误信息。
 * @returns 验证结果，如果不是字符串则返回包含 TypeError 的 Err。
 */
export function validateString(str: string, name?: string): VoidIOResult {
    if (typeof str !== 'string') {
        return Err(new TypeError(`Param '${name || 'str'}' must be a string but received ${typeof str}`));
    }
    return RESULT_VOID;
}

/**
 * 验证传入的 URL 是否为 `https` 协议。
 * @param url - 需要验证的 URL 字符串。
 * @returns 验证结果，如果不是 https 协议则返回 Err。
 */
export function validateSafeUrl(url: string): VoidIOResult {
    return validateString(url, 'url')
        .andThen(() => {
            if (!url.startsWith('https://')) {
                return Err(new Error(`Param url must start with https:// but received ${url}`));
            }
            return RESULT_VOID;
        });
}

/**
 * 验证传入的 WebSocket URL 是否为 `wss` 协议。
 * @param socketUrl - 需要验证的 WebSocket URL 字符串。
 * @returns 验证结果，如果不是 wss 协议则返回 Err。
 */
export function validateSafeSocketUrl(socketUrl: string): VoidIOResult {
    return validateString(socketUrl, 'socketUrl')
        .andThen(() => {
            if (!socketUrl.startsWith('wss://')) {
                return Err(new Error(`Param socketUrl must start with wss:// but received ${socketUrl}`));
            }
            return RESULT_VOID;
        });
}