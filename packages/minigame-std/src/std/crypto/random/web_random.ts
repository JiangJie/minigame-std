/**
 * @internal
 * Web platform implementation for random number generation.
 */

import type { UUID } from './random_defines.ts';

/**
 * 生成指定长度的加密随机字节数组。
 * @param length - 要生成的随机字节数。
 * @returns 返回包含随机字节的 Uint8Array。
 */
export function getRandomValues(length: number): Uint8Array {
    const u8a = new Uint8Array(length);
    crypto.getRandomValues(u8a);

    return u8a;
}

/**
 * 生成符合 RFC 4122 规范的 UUID v4。
 * @returns 返回生成的 UUID 字符串。
 */
export function randomUUID(): UUID {
    return crypto.randomUUID();
}