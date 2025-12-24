import type { DataSource } from '../../defines.ts';
import { Md5 } from './md5.ts';

export { Md5 } from './md5.ts';

/**
 * 计算字符串或 Buffer 的 MD5 值。
 * @param data - 需要计算 MD5 值的数据，可以是字符串或 BufferSource。
 * @returns 计算得到的 MD5 十六进制字符串（32 位）。
 * @example
 * ```ts
 * const hash = md5('Hello, World!');
 * console.log(hash); // '65a8e27d8879283831b664bd8b7f0ad4'
 * ```
 */
export function md5(data: DataSource): string {
    return new Md5().update(data).toString();
}