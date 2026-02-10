/**
 * @internal
 * 内部使用的编解码辅助函数。
 */

import type { DataSource } from '../defines.ts';
import { bufferSourceToBytes } from '../internal/mod.ts';
import { encodeUtf8 } from './mod.ts';

/**
 * 将 DataSource 转换为 Uint8Array。
 * - 字符串：先 UTF-8 编码
 * - BufferSource：转换为 Uint8Array
 * @param data - 需要转换的数据。
 * @returns 转换后的 `Uint8Array`。
 */
export function dataSourceToBytes(data: DataSource): Uint8Array<ArrayBuffer> {
    return typeof data === 'string'
        ? encodeUtf8(data)
        : bufferSourceToBytes(data);
}
