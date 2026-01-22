import type { FetchInit } from '@happy-ts/fetch-t';
import type { FsRequestInit, UploadRequestInit, ZipFromUrlRequestInit } from 'happy-opfs';
import type { DataSource } from '../defines.ts';

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
 * 读取文件的内容类型，支持 `ArrayBuffer` `string`。
 * 小游戏不支持 `Blob`、`File` 和 `ReadableStream`。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { ReadFileContent } from 'minigame-std';
 *
 * // ReadFileContent 可以是 ArrayBuffer 或 string
 * const content: ReadFileContent = new ArrayBuffer(8);
 * ```
 */
export type ReadFileContent = ArrayBuffer | string;

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
     * 读取文件的编码类型，支持 `binary(ArrayBuffer)` `utf8(string)` `blob(Blob)`。
     *
     * @defaultValue `'binary'`
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
export type FileEncoding = 'binary' | 'utf8';

/**
 * 下载文件的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fs, type DownloadFileOptions } from 'minigame-std';
 *
 * const options: DownloadFileOptions = {
 *     onProgress: (progress) => console.log(`下载进度: ${progress.progress}%`),
 * };
 * const task = fs.downloadFile('https://example.com/file.zip', '/path/to/save.zip', options);
 * ```
 */
export interface DownloadFileOptions extends Omit<WechatMinigame.DownloadFileOption, 'url' | 'filePath' | 'success' | 'fail'> {
    onProgress?: FetchInit['onProgress'];
}

/**
 * 上传文件的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import { fs, type UploadFileOptions } from 'minigame-std';
 *
 * const options: UploadFileOptions = {
 *     name: 'file',
 *     formData: { key: 'value' },
 * };
 * const task = fs.uploadFile('/path/to/file.txt', 'https://example.com/upload', options);
 * ```
 */
export interface UploadFileOptions extends Omit<WechatMinigame.UploadFileOption, 'url' | 'filePath' | 'name' | 'success' | 'fail'> {
    /**
     * 可选的文件名称。
     */
    name?: string;
}

/**
 * 统一下载请求的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { UnionDownloadFileOptions } from 'minigame-std';
 *
 * const options: UnionDownloadFileOptions = {
 *     timeout: 30000,
 *     onProgress: (p) => console.log(p.progress),
 * };
 * ```
 */
export type UnionDownloadFileOptions = FsRequestInit & DownloadFileOptions;

/**
 * 统一上传请求的选项。
 * @since 1.0.0
 * @example
 * ```ts
 * import type { UnionUploadFileOptions } from 'minigame-std';
 *
 * const options: UnionUploadFileOptions = {
 *     name: 'file',
 *     formData: { key: 'value' },
 * };
 * ```
 */
export type UnionUploadFileOptions = UploadRequestInit & UploadFileOptions;

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
 *     onProgress: (p) => console.log(p.progress),
 * };
 * await fs.unzipFromUrl('https://example.com/archive.zip', '/path/to/output', options);
 * ```
 */
export type ZipFromUrlOptions = DownloadFileOptions & ZipFromUrlRequestInit;
