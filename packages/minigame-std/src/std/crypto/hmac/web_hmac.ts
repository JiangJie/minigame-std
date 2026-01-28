/**
 * @internal
 * Web 平台的 HMAC 实现。
 */

import { tryAsyncResult, type AsyncIOResult } from 'happy-rusty';
import { dataSourceToBytes } from '../../codec/helpers.ts';
import { encodeHex } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { SHA } from '../crypto_defines.ts';

/**
 * 使用 Web Crypto API 创建 HMAC。
 * @param hash - SHA 哈希算法。
 * @param key - 密钥，可以是字符串或 BufferSource。
 * @param data - 需要计算 HMAC 的数据，可以是字符串或 BufferSource。
 * @returns HMAC 计算结果的十六进制字符串。
 */
export function createHMAC(hash: SHA, key: DataSource, data: DataSource): AsyncIOResult<string> {
    return tryAsyncResult(async () => {
        const encodedKey = dataSourceToBytes(key);
        const encodedData = dataSourceToBytes(data);

        // 导入密钥
        const cryptoKey = await crypto.subtle.importKey(
            'raw', // 密钥格式
            encodedKey, // 密钥数据
            { name: 'HMAC', hash: { name: hash } }, // 算法
            false, // 是否可导出
            ['sign'], // 用途
        );

        // 生成 HMAC
        const hashBuffer = await crypto.subtle.sign(
            'HMAC', // 算法
            cryptoKey, // 密钥
            encodedData, // 消息
        );

        return encodeHex(hashBuffer);
    });
}