import { isMinaEnv } from '../../macros/env.ts';
import { textEncode } from '../codec/mod.ts';
import { hexFromBuffer } from '../utils/mod.ts';
import { Md5 } from './md5.ts';
import { Sha1 } from './sha1.ts';

export { Md5 } from './md5.ts';
export * as rsa from './rsa.ts';

/**
 * 计算字符串或者 buffer 的 MD5 值，结果用16进制字符串表示。
 * @param data - 需要计算 MD5 值的数据。
 * @returns 计算得到的 MD5 十六进制字符串。
 */
export function md5(data: string | BufferSource): string {
    return new Md5().update(data).toString();
}

/**
 * 计算字符串的 SHA-1 哈希值，结果用16进制字符串表示。
 * @param data - 需要计算 SHA-1 哈希值的数据。
 * @returns 计算得到的 SHA-1 十六进制字符串。
 */
export async function sha1(data: string): Promise<string> {
    if (isMinaEnv()) {
        return Promise.resolve(new Sha1().update(data).toString());
    }

    const encodedData = textEncode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-1', encodedData);
    return hexFromBuffer(hashBuffer);
}