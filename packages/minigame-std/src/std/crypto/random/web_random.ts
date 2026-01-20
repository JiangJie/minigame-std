/**
 * @internal
 * Web 平台的随机数生成实现。
 */

import type { UUID } from './random_defines.ts';

/**
 * 生成指定长度的加密随机字节数组。
 * @param length - 要生成的随机字节数。
 * @returns 返回包含随机字节的 Uint8Array。
 */
export function getRandomValues(length: number): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    return bytes;
}

/**
 * 生成符合 RFC 4122 规范的 UUID v4。
 * @returns 返回生成的 UUID 字符串。
 */
export function randomUUID(): UUID {
    return crypto.randomUUID();
}