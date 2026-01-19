/**
 * @internal
 * Web 平台的 SHA 哈希实现。
 */

import { hexFromBuffer, textEncode } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { SHA } from '../crypto_defines.ts';

/**
 * 根据不同 SHA 算法计算字符串或者 buffer 的哈希值，结果用16进制字符串表示。
 * @param data - 需要计算哈希值的数据。
 * @param hash - SHA 算法。
 * @returns 计算得到的哈希值。
 */
export async function sha(data: DataSource, hash: SHA): Promise<string> {
    const encodedData = typeof data === 'string'
        ? textEncode(data)
        : data;
    const hashBuffer = await crypto.subtle.digest(hash, encodedData);

    return hexFromBuffer(hashBuffer);
}