import { Md5 } from './md5.ts';

export { Md5 } from './md5.ts';

/**
 * 计算字符串或者 buffer 的 MD5 值，结果用16进制字符串表示。
 * @param data - 需要计算 MD5 值的数据。
 * @returns 计算得到的 MD5 十六进制字符串。
 */
export function md5(data: string | BufferSource): string {
    return new Md5().update(data).toString();
}