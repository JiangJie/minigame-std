import { isMinaEnv } from '../../../macros/env.ts';
import type { DataSource } from '../../defines.ts';
import {
    sha1 as minaSHA1,
    sha256 as minaSHA256,
    sha384 as minaSHA384,
    sha512 as minaSHA512,
} from './mina_sha.ts';
import { sha as webSHA } from './web_sha.ts';

/**
 * 计算数据的 SHA-1 哈希值。
 * @param data - 需要计算哈希的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的哈希字符串。
 * @example
 * ```ts
 * const hash = await sha1('Hello, World!');
 * console.log(hash); // 十六进制哈希字符串
 * ```
 */
export function sha1(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA1(data))
        : webSHA(data, 'SHA-1');
}

/**
 * 计算数据的 SHA-256 哈希值。
 * @param data - 需要计算哈希的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的哈希字符串。
 * @example
 * ```ts
 * const hash = await sha256('Hello, World!');
 * console.log(hash); // 十六进制哈希字符串
 * ```
 */
export function sha256(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA256(data))
        : webSHA(data, 'SHA-256');
}

/**
 * 计算数据的 SHA-384 哈希值。
 * @param data - 需要计算哈希的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的哈希字符串。
 * @example
 * ```ts
 * const hash = await sha384('Hello, World!');
 * console.log(hash); // 十六进制哈希字符串
 * ```
 */
export function sha384(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA384(data))
        : webSHA(data, 'SHA-384');
}

/**
 * 计算数据的 SHA-512 哈希值。
 * @param data - 需要计算哈希的数据，可以是字符串或 BufferSource。
 * @returns 返回十六进制格式的哈希字符串。
 * @example
 * ```ts
 * const hash = await sha512('Hello, World!');
 * console.log(hash); // 十六进制哈希字符串
 * ```
 */
export function sha512(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA512(data))
        : webSHA(data, 'SHA-512');
}
