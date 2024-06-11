import type { ReadFileContent as OPFSReadFileContent, WriteFileContent as OPFSWriteFileContent } from 'happy-opfs';

/**
 * File content type for write, support `ArrayBuffer` `TypedArray` `string`.
 */
export type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;

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