import type { FetchInit } from '@happy-ts/fetch-t';
import type { FsRequestInit, ReadFileContent as OPFSReadFileContent, WriteFileContent as OPFSWriteFileContent, WriteSyncFileContent as OPFSWriteSyncFileContent, UploadRequestInit, ZipFromUrlRequestInit } from 'happy-opfs';

/**
 * 异步写入文件的内容类型，支持 `ArrayBuffer` `TypedArray` `string` `ReadableStream`。
 * @since 1.0.0
 */
export type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;

/**
 * 小游戏写入内容类型，排除 ReadableStream 因为小游戏不支持。
 */
export type MinaWriteFileContent = Exclude<WriteFileContent, ReadableStream<Uint8Array<ArrayBuffer>>>;

/**
 * 同步写入文件的内容类型，支持 `ArrayBuffer` `TypedArray` `string`。
 * 排除了 `Blob` 和 `ReadableStream`，因为它们需要异步操作。
 * @since 1.1.0
 */
export type WriteSyncFileContent = Exclude<OPFSWriteSyncFileContent, Blob>;

/**
 * 读取文件的内容类型，支持 `ArrayBuffer` `string`。
 * @since 1.0.0
 */
export type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;

/**
 * 指定编码读取文件的选项。
 * @since 1.0.0
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
 */
export type FileEncoding = 'binary' | 'utf8';

/**
 * 下载文件的选项。
 * @since 1.0.0
 */
export interface DownloadFileOptions extends Omit<WechatMinigame.DownloadFileOption, 'url' | 'filePath' | 'success' | 'fail'> {
    onProgress?: FetchInit['onProgress'];
}

/**
 * 上传文件的选项。
 * @since 1.0.0
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
 */
export type UnionDownloadFileOptions = FsRequestInit & DownloadFileOptions;

/**
 * 统一上传请求的选项。
 * @since 1.0.0
 */
export type UnionUploadFileOptions = UploadRequestInit & UploadFileOptions;

/**
 * stat 操作的选项。
 * @since 1.0.0
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
 */
export type ZipFromUrlOptions = DownloadFileOptions & ZipFromUrlRequestInit;
