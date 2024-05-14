import type { ReadFileContent as OPFSReadFileContent, WriteFileContent as OPFSWriteFileContent } from 'happy-opfs';

/**
 * file content type for write, support `ArrayBuffer` `TypedArray` `string`.
 */
export type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;

/**
 * file content type for read result, support `ArrayBuffer` `string`.
 */
export type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;

export interface ReadOptions {
    /**
     * read file encoding type, support `binary(ArrayBuffer)` `utf8(string)` `blob(Blob)`
     *
     * @default {FileEncoding.binary}
     */
    encoding?: FileEncoding;
}

export type FileEncoding = 'binary' | 'utf8';