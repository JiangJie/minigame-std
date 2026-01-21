/**
 * @internal
 * 内部使用的编解码辅助函数。
 */

import type { DataSource } from '../defines.ts';
import { bufferSourceToBytes } from '../internal/mod.ts';
import { encodeUtf8 } from './utf8/mod.ts';

/**
 * 将 DataSource 转换为 Uint8Array。
 * - 字符串：先 UTF-8 编码
 * - BufferSource：转换为 Uint8Array
 * @param data - 需要转换的数据。
 * @returns 转换后的 `Uint8Array`。
 * @since 1.6.0
 * @example
 * ```ts
 * const bytes1 = dataSourceToBytes('hello');
 * const bytes2 = dataSourceToBytes(new Uint8Array([1, 2, 3]));
 * const bytes3 = dataSourceToBytes(new ArrayBuffer(8));
 * ```
 */
export function dataSourceToBytes(data: DataSource): Uint8Array<ArrayBuffer> {
    return typeof data === 'string'
        ? encodeUtf8(data)
        : bufferSourceToBytes(data);
}
