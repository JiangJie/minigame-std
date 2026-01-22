import type { AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../../macros/env.ts';
import type { DataSource } from '../../defines.ts';
import type { SHA } from '../crypto_defines.ts';
import { createHMAC as pureCreateHMAC } from './hmac.ts';
import { createHMAC as webCreateHMAC } from './web_hmac.ts';

/**
 * 使用 SHA-1 算法计算 HMAC。
 * @param key - 密钥，可以是字符串或 BufferSource。
 * @param data - 需要计算 HMAC 的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的 HMAC 字符串。
 * @since 1.8.0
 * @example
 * ```ts
 * const hmac = await sha1HMAC('secret-key', 'Hello, World!');
 * console.log(hmac); // 十六进制 HMAC 字符串
 * ```
 */
export function sha1HMAC(key: DataSource, data: DataSource): AsyncIOResult<string> {
    return shaHMAC('SHA-1', key, data);
}

/**
 * 使用 SHA-256 算法计算 HMAC。
 * @param key - 密钥，可以是字符串或 BufferSource。
 * @param data - 需要计算 HMAC 的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的 HMAC 字符串。
 * @since 1.8.0
 * @example
 * ```ts
 * const hmac = await sha256HMAC('secret-key', 'Hello, World!');
 * console.log(hmac); // 十六进制 HMAC 字符串
 * ```
 */
export function sha256HMAC(key: DataSource, data: DataSource): AsyncIOResult<string> {
    return shaHMAC('SHA-256', key, data);
}

/**
 * 使用 SHA-384 算法计算 HMAC。
 * @param key - 密钥，可以是字符串或 BufferSource。
 * @param data - 需要计算 HMAC 的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的 HMAC 字符串。
 * @since 1.8.0
 * @example
 * ```ts
 * const hmac = await sha384HMAC('secret-key', 'Hello, World!');
 * console.log(hmac); // 十六进制 HMAC 字符串
 * ```
 */
export function sha384HMAC(key: DataSource, data: DataSource): AsyncIOResult<string> {
    return shaHMAC('SHA-384', key, data);
}

/**
 * 使用 SHA-512 算法计算 HMAC。
 * @param key - 密钥，可以是字符串或 BufferSource。
 * @param data - 需要计算 HMAC 的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的 HMAC 字符串。
 * @since 1.8.0
 * @example
 * ```ts
 * const hmac = await sha512HMAC('secret-key', 'Hello, World!');
 * console.log(hmac); // 十六进制 HMAC 字符串
 * ```
 */
export function sha512HMAC(key: DataSource, data: DataSource): AsyncIOResult<string> {
    return shaHMAC('SHA-512', key, data);
}

// #region Internal Functions

/**
 * 使用指定 SHA 算法计算 HMAC。
 */
function shaHMAC(sha: SHA, key: DataSource, data: DataSource): AsyncIOResult<string> {
    const createHMAC = isMinaEnv() ? pureCreateHMAC : webCreateHMAC;
    return createHMAC(sha, key, data);
}

// #endregion
