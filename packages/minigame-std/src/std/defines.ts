/**
 * 数据源类型，可以是字符串或者 BufferSource。
 * @since 1.8.0
 * @example
 * ```ts
 * // 字符串类型
 * const strData: DataSource = 'Hello, World!';
 *
 * // ArrayBuffer 类型
 * const bufferData: DataSource = new ArrayBuffer(8);
 *
 * // Uint8Array 类型
 * const u8aData: DataSource = new Uint8Array([1, 2, 3]);
 * ```
 */
export type DataSource = string | BufferSource;