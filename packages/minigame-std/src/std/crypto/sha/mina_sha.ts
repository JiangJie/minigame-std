/**
 * @internal
 * Mini-game platform implementation for SHA hashing.
 */

import { sha1 as SHA1, sha256 as SHA256, sha384 as SHA384, sha512 as SHA512 } from 'rsa-oaep-encryption';
import { toByteString } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';

/**
 * 计算 SHA-1 哈希值。
 * @param data - 要计算哈希的数据。
 * @returns 返回十六进制格式的哈希字符串。
 */
export function sha1(data: DataSource): string {
    return SHA1.create().update(toByteString(data)).digest().toHex();
}

/**
 * 计算 SHA-256 哈希值。
 * @param data - 要计算哈希的数据。
 * @returns 返回十六进制格式的哈希字符串。
 */
export function sha256(data: DataSource): string {
    return SHA256.create().update(toByteString(data)).digest().toHex();
}

/**
 * 计算 SHA-384 哈希值。
 * @param data - 要计算哈希的数据。
 * @returns 返回十六进制格式的哈希字符串。
 */
export function sha384(data: DataSource): string {
    return SHA384.create().update(toByteString(data)).digest().toHex();
}

/**
 * 计算 SHA-512 哈希值。
 * @param data - 要计算哈希的数据。
 * @returns 返回十六进制格式的哈希字符串。
 */
export function sha512(data: DataSource): string {
    return SHA512.create().update(toByteString(data)).digest().toHex();
}