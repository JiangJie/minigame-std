import type { FetchInit } from '@happy-ts/fetch-t';
import type { FsRequestInit, ReadFileContent as OPFSReadFileContent, WriteFileContent as OPFSWriteFileContent, WriteSyncFileContent as OPFSWriteSyncFileContent, UploadRequestInit, ZipOptions } from 'happy-opfs';

/**
 * File content type for async write, support `ArrayBuffer` `TypedArray` `string` `ReadableStream`.
 */
export type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;

/**
 * File content type for sync write, support `ArrayBuffer` `TypedArray` `string`.
 * Excludes `Blob` and `ReadableStream` as they require async operations.
 */
export type WriteSyncFileContent = Exclude<OPFSWriteSyncFileContent, Blob>;

/**
 * File content type for read result, support `ArrayBuffer` `string`.
 */
export type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;

/**
 * Options for reading files with specified encoding.
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
 */
export type FileEncoding = 'binary' | 'utf8';

/**
 * Options for downloading files.
 */
export interface DownloadFileOptions extends Omit<WechatMinigame.DownloadFileOption, 'url' | 'filePath' | 'success' | 'fail'> {
    onProgress?: FetchInit['onProgress'];
}

/**
 * Options for uploading files.
 */
export interface UploadFileOptions extends Omit<WechatMinigame.UploadFileOption, 'url' | 'filePath' | 'name' | 'success' | 'fail'> {
    /**
     * Optional file name.
     */
    name?: string;
}

/**
 * Options for union requests.
 */
export type UnionDownloadFileOptions = FsRequestInit & DownloadFileOptions;

/**
 * Options for union requests.
 */
export type UnionUploadFileOptions = UploadRequestInit & UploadFileOptions;

/**
 * Options for stat operations.
 */
export interface StatOptions {
    /**
     * Whether to recursively read the contents of directories.
     */
    recursive: boolean;
}

/**
 * Union options for `unzipFromUrl`.
 */
export type ZipFromUrlOptions = (DownloadFileOptions & ZipOptions) & FsRequestInit;