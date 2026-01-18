import type { FetchInit } from '@happy-ts/fetch-t';
import type { FsRequestInit, ReadFileContent as OPFSReadFileContent, WriteFileContent as OPFSWriteFileContent, WriteSyncFileContent as OPFSWriteSyncFileContent, UploadRequestInit, ZipOptions } from 'happy-opfs';

/**
 * File content type for async write, support `ArrayBuffer` `TypedArray` `string` `ReadableStream`.
 * @since 1.0.0
 */
export type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;

/**
 * File content type for sync write, support `ArrayBuffer` `TypedArray` `string`.
 * Excludes `Blob` and `ReadableStream` as they require async operations.
 * @since 1.1.0
 */
export type WriteSyncFileContent = Exclude<OPFSWriteSyncFileContent, Blob>;

/**
 * File content type for read result, support `ArrayBuffer` `string`.
 * @since 1.0.0
 */
export type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;

/**
 * Options for reading files with specified encoding.
 * @since 1.0.0
 */
export interface ReadOptions {
    /**
     * Read file encoding type, support `binary(ArrayBuffer)` `utf8(string)` `blob(Blob)`
     *
     * @defaultValue `'binary'`
     */
    encoding?: FileEncoding;
}

/**
 * Supported file encodings for reading and writing files.
 * @since 1.0.0
 */
export type FileEncoding = 'binary' | 'utf8';

/**
 * Options for downloading files.
 * @since 1.0.0
 */
export interface DownloadFileOptions extends Omit<WechatMinigame.DownloadFileOption, 'url' | 'filePath' | 'success' | 'fail'> {
    onProgress?: FetchInit['onProgress'];
}

/**
 * Options for uploading files.
 * @since 1.0.0
 */
export interface UploadFileOptions extends Omit<WechatMinigame.UploadFileOption, 'url' | 'filePath' | 'name' | 'success' | 'fail'> {
    /**
     * Optional file name.
     */
    name?: string;
}

/**
 * Options for union requests.
 * @since 1.0.0
 */
export type UnionDownloadFileOptions = FsRequestInit & DownloadFileOptions;

/**
 * Options for union requests.
 * @since 1.0.0
 */
export type UnionUploadFileOptions = UploadRequestInit & UploadFileOptions;

/**
 * Options for stat operations.
 * @since 1.0.0
 */
export interface StatOptions {
    /**
     * Whether to recursively read the contents of directories.
     */
    recursive: boolean;
}

/**
 * Union options for `unzipFromUrl`.
 * @since 1.4.0
 */
export type ZipFromUrlOptions = (DownloadFileOptions & ZipOptions) & FsRequestInit;