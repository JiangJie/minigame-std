import type { FsRequestInit, UploadRequestInit, ZipFromUrlRequestInit } from 'happy-opfs';
import type { DataSource } from '../defines.ts';
import type { DownloadFileOptions, UploadFileOptions } from './mina_fs_define.ts';

/**
 * 异步写入文件的内容类型，支持 `ArrayBuffer` `TypedArray` `string`。
 * 小游戏不支持 `Blob` 和 `ReadableStream`，因此直接使用 `DataSource`。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fs, type WriteFileContent } from 'minigame-std';
 *
 * const content: WriteFileContent = '文本内容';
 * await fs.writeFile('/path/to/file.txt', content);
 * ```
 */
export type WriteFileContent = DataSource;

/**
 * 读取文件的内容类型，支持 `Uint8Array<ArrayBuffer>` `string`。
 * 小游戏不支持 `Blob`、`File` 和 `ReadableStream`。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { ReadFileContent } from 'minigame-std';
 *
 * // ReadFileContent 可以是 Uint8Array<ArrayBuffer> 或 string
 * const content: ReadFileContent = new Uint8Array(8);
 * ```
 */
export type ReadFileContent = Uint8Array<ArrayBuffer> | string;

/**
 * 指定编码读取文件的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { ReadOptions } from 'minigame-std';
 *
 * const options: ReadOptions = { encoding: 'utf8' };
 * ```
 */
export interface ReadOptions {
    /**
     * 读取文件的编码类型，支持 `bytes(Uint8Array)` `utf8(string)`。
     *
     * @defaultValue `'bytes'`
     */
    encoding?: FileEncoding;
}

/**
 * 支持的文件编码格式。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { FileEncoding } from 'minigame-std';
 *
 * const encoding: FileEncoding = 'utf8';
 * ```
 */
export type FileEncoding = 'bytes' | 'utf8';

/**
 * 统一下载请求的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { UnionDownloadFileOptions } from 'minigame-std';
 *
 * const options: UnionDownloadFileOptions = {
 *     headers: { 'Authorization': 'Bearer token' },
 *     timeout: 30000,
 *     onProgress: (p) => console.log(p.progress),
 * };
 * ```
 */
export interface UnionDownloadFileOptions extends Omit<FsRequestInit & DownloadFileOptions, 'headers'> {
    headers?: Record<string, string>;
}

/**
 * 统一上传请求的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { UnionUploadFileOptions } from 'minigame-std';
 *
 * const options: UnionUploadFileOptions = {
 *     name: 'file',
 *     headers: { 'Authorization': 'Bearer token' },
 *     formData: { key: 'value' },
 * };
 * ```
 */
export interface UnionUploadFileOptions extends Omit<UploadRequestInit & UploadFileOptions, 'headers'> {
    headers?: Record<string, string>;
}

/**
 * stat 操作的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fs, type StatOptions } from 'minigame-std';
 *
 * const options: StatOptions = { recursive: true };
 * const result = await fs.stat('/path/to/dir', options);
 * ```
 */
export interface StatOptions {
    /**
     * 是否递归读取目录内容。
     */
    recursive: boolean;
}

/**
 * `unzipFromUrl` 的统一选项。
 * @since 1.4.0
 * @example
 * ```ts
 * import { fs, type ZipFromUrlOptions } from 'minigame-std';
 *
 * const options: ZipFromUrlOptions = {
 *     headers: { 'Authorization': 'Bearer token' },
 *     onProgress: (p) => console.log(p.progress),
 * };
 * await fs.unzipFromUrl('https://example.com/archive.zip', '/path/to/output', options);
 * ```
 */
export interface ZipFromUrlOptions extends Omit<DownloadFileOptions & ZipFromUrlRequestInit, 'headers'> {
    headers?: Record<string, string>;
}
