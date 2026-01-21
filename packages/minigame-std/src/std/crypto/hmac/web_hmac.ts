/**
 * @internal
 * Web 平台的 HMAC 实现。
 */

import { tryAsyncResult, type AsyncIOResult } from 'happy-rusty';
import { encodeUtf8, hexFromBuffer } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { SHA } from '../crypto_defines.ts';

export function createHMAC(hash: SHA, key: DataSource, data: DataSource): AsyncIOResult<string> {
    return tryAsyncResult(async () => {
        const encodedKey = typeof key === 'string'
            ? encodeUtf8(key)
            : key;

        const encodedData = typeof data === 'string'
            ? encodeUtf8(data)
            : data;

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

        return hexFromBuffer(hashBuffer);
    });
}