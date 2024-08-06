import type { FetchResponse, FetchTask } from '@happy-ts/fetch-t';
import { basename, dirname, join } from '@std/path/posix';
import * as fflate from 'fflate/browser';
import { type ExistsOptions, type WriteOptions, type ZipOptions } from 'happy-opfs';
import { Err, Ok, RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import { Future } from 'tiny-future';
import { assertSafeUrl } from '../assert/assertions.ts';
import { generalErrorToResult } from '../utils/mod.ts';
import type { DownloadFileOptions, ReadFileContent, ReadOptions, StatOptions, UploadFileOptions, WriteFileContent } from './fs_define.ts';
import { errToMkdirResult, errToRemoveResult, fileErrorToResult, getAbsolutePath, getExistsResult, getFs, getReadFileEncoding, getWriteFileContents, isNotFoundError } from './mina_fs_shared.ts';

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 需要创建的目录路径。
 * @returns 创建结果的异步操作，成功时返回 true。
 */
export function mkdir(dirPath: string): AsyncVoidIOResult {
    const absPath = getAbsolutePath(dirPath);

    const future = new Future<VoidIOResult>();

    getFs().mkdir({
        dirPath: absPath,
        recursive: true,
        success(): void {
            future.resolve(RESULT_VOID);
        },
        fail(err): void {
            future.resolve(errToMkdirResult(err));
        },
    });

    return future.promise;
}

/**
 * 读取目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 包含目录内容的字符串数组的异步操作。
 */
export function readDir(dirPath: string): AsyncIOResult<string[]> {
    const absPath = getAbsolutePath(dirPath);

    const future = new Future<IOResult<string[]>>();

    getFs().readdir({
        dirPath: absPath,
        success(res): void {
            future.resolve(Ok(res.files));
        },
        fail(err): void {
            future.resolve(fileErrorToResult(err));
        },
    });

    return future.promise;
}

/**
 * 以 UTF-8 格式读取文件。
 * @param filePath - 文件路径。
 * @param options - 读取选项，指定编码为 'utf8'。
 * @returns 包含文件内容的字符串的异步操作。
 */
export function readFile(filePath: string, options: ReadOptions & {
    encoding: 'utf8',
}): AsyncIOResult<string>;

/**
 * 以二进制格式读取文件。
 * @param filePath - 文件路径。
 * @param options - 读取选项，指定编码为 'binary'。
 * @returns 包含文件内容的 ArrayBuffer 的异步操作。
 */
export function readFile(filePath: string, options?: ReadOptions & {
    encoding: 'binary',
}): AsyncIOResult<ArrayBuffer>;

/**
 * 读取文件内容，可选地指定编码和返回类型。
 * @template T - 返回内容的类型。
 * @param filePath - 文件路径。
 * @param options - 可选的读取选项。
 * @returns 包含文件内容的异步操作。
 */
export function readFile<T extends ReadFileContent>(filePath: string, options?: ReadOptions): AsyncIOResult<T> {
    const absPath = getAbsolutePath(filePath);
    const encoding = getReadFileEncoding(options);

    const future = new Future<IOResult<T>>();

    getFs().readFile({
        filePath: absPath,
        encoding,
        success(res): void {
            future.resolve(Ok(res.data as T));
        },
        fail(err): void {
            future.resolve(fileErrorToResult(err));
        },
    });

    return future.promise;
}

/**
 * 删除指定路径的文件或目录。
 * @param path - 需要删除的文件或目录的路径。
 * @returns 删除操作的异步结果，成功时返回 true。
 */
export async function remove(path: string): AsyncVoidIOResult {
    const statRes = await stat(path);

    if (statRes.isErr()) {
        // 不存在当做成功
        return isNotFoundError(statRes.unwrapErr()) ? RESULT_VOID : statRes.asErr();
    }

    const absPath = getAbsolutePath(path);

    const future = new Future<VoidIOResult>();

    // 文件夹还是文件
    if (statRes.unwrap().isDirectory()) {
        getFs().rmdir({
            dirPath: absPath,
            recursive: true,
            success(): void {
                future.resolve(RESULT_VOID);
            },
            fail(err): void {
                future.resolve(errToRemoveResult(err));
            },
        });
    } else {
        getFs().unlink({
            filePath: absPath,
            success(): void {
                future.resolve(RESULT_VOID);
            },
            fail(err): void {
                future.resolve(errToRemoveResult(err));
            },
        });
    }

    return future.promise;
}

/**
 * 重命名文件或目录。
 * @param oldPath - 原路径。
 * @param newPath - 新路径。
 * @returns 重命名操作的异步结果，成功时返回 true。
 */
export function rename(oldPath: string, newPath: string): AsyncVoidIOResult {
    const absOldPath = getAbsolutePath(oldPath);
    const absNewPath = getAbsolutePath(newPath);

    const future = new Future<VoidIOResult>();

    getFs().rename({
        oldPath: absOldPath,
        newPath: absNewPath,
        success(): void {
            future.resolve(RESULT_VOID);
        },
        fail(err): void {
            future.resolve(fileErrorToResult(err));
        },
    });

    return future.promise;
}

/**
 * 获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @param options - 可选选项。
 * @returns 包含状态信息的异步操作。
 */
export function stat(path: string): AsyncIOResult<WechatMinigame.Stats>;
export function stat(path: string, options: StatOptions & {
    recursive: true;
}): AsyncIOResult<WechatMinigame.FileStats[]>;
export function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
export function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    type T = WechatMinigame.Stats | WechatMinigame.FileStats[];

    const absPath = getAbsolutePath(path);

    const future = new Future<IOResult<T>>();

    getFs().stat({
        path: absPath,
        recursive: options?.recursive ?? false,
        success(res): void {
            future.resolve(Ok(res.stats));
        },
        fail(err): void {
            future.resolve(fileErrorToResult(err));
        },
    });

    return future.promise;
}

/**
 * 将内容写入文件。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @param options - 可选的写入选项。
 * @returns 写入操作的异步结果，成功时返回 true。
 */
export async function writeFile(filePath: string, contents: WriteFileContent, options?: WriteOptions): AsyncVoidIOResult {
    const absPath = getAbsolutePath(filePath);

    // 默认创建
    const { append = false, create = true } = options ?? {};

    if (create) {
        const res = await mkdir(dirname(absPath));
        if (res.isErr()) {
            return res;
        }
    }

    const { data, encoding } = getWriteFileContents(contents);

    const future = new Future<VoidIOResult>();

    (append ? getFs().appendFile : getFs().writeFile)({
        filePath: absPath,
        data,
        encoding,
        success(): void {
            future.resolve(RESULT_VOID);
        },
        fail(err): void {
            future.resolve(fileErrorToResult(err));
        },
    });

    return future.promise;
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加操作的异步结果，成功时返回 true。
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncVoidIOResult {
    return writeFile(filePath, contents, {
        append: true,
    });
}

/**
 * 检查指定路径的文件或目录是否存在。
 * @param path - 文件或目录的路径。
 * @param options - 可选的检查选项。
 * @returns 检查存在性的异步结果，存在时返回 true。
 */
export async function exists(path: string, options?: ExistsOptions): AsyncIOResult<boolean> {
    const res = await stat(path);
    return getExistsResult(res, options);
}

/**
 * 清空目录中的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 清空操作的异步结果，成功时返回 true。
 */
export async function emptyDir(dirPath: string): AsyncVoidIOResult {
    const res = await readDir(dirPath);
    if (res.isErr()) {
        // 不存在则创建
        return isNotFoundError(res.unwrapErr()) ? mkdir(dirPath) : res.asErr();
    }

    const tasks = res.unwrap().map(name => remove(join(dirPath, name)));

    const allRes = await Promise.all(tasks);
    // anyone failed?
    const fail = allRes.find(x => x.isErr());

    return fail ?? RESULT_VOID;
}

/**
 * 读取文本文件的内容。
 * @param filePath - 文件路径。
 * @returns 包含文件文本内容的异步操作。
 */
export function readTextFile(filePath: string): AsyncIOResult<string> {
    return readFile(filePath, {
        encoding: 'utf8',
    });
}

/**
 * 下载文件。
 * @param fileUrl - 文件的网络 URL。
 * @param filePath - 下载后文件存储的路径。
 * @param options - 可选参数。
 * @returns 下载操作的异步结果，成功时返回 true。
 */
export function downloadFile(fileUrl: string, filePath: string, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult> {
    type T = WechatMinigame.DownloadFileSuccessCallbackResult;

    assertSafeUrl(fileUrl);
    const absPath = getAbsolutePath(filePath);

    let aborted = false;

    const future = new Future<IOResult<T>>();

    const task = wx.downloadFile({
        ...options,
        url: fileUrl,
        filePath: absPath,
        success(res): void {
            future.resolve(Ok(res));
        },
        fail(err): void {
            future.resolve(generalErrorToResult(err));
        },
    });

    return {
        abort(): void {
            aborted = true;
            task?.abort();
        },

        get aborted(): boolean {
            return aborted;
        },

        get response(): FetchResponse<T> {
            return future.promise;
        },
    };
}

/**
 * 文件上传。
 * @param filePath - 需要上传的文件路径。
 * @param fileUrl - 目标网络 URL。
 * @param options - 可选参数。
 * @returns 上传操作的异步结果，成功时返回 true。
 */
export function uploadFile(filePath: string, fileUrl: string, options?: UploadFileOptions): FetchTask<WechatMinigame.UploadFileSuccessCallbackResult> {
    type T = WechatMinigame.UploadFileSuccessCallbackResult;

    assertSafeUrl(fileUrl);
    const absPath = getAbsolutePath(filePath);

    let aborted = false;

    const future = new Future<IOResult<T>>();

    const task = wx.uploadFile({
        name: basename(filePath),
        ...options,
        url: fileUrl,
        filePath: absPath,
        success(res): void {
            future.resolve(Ok(res));
        },
        fail(err): void {
            future.resolve(generalErrorToResult(err));
        },
    });

    return {
        abort(): void {
            aborted = true;
            task?.abort();
        },

        get aborted(): boolean {
            return aborted;
        },

        get response(): FetchResponse<T> {
            return future.promise;
        },
    };
}

/**
 * 解压 zip 文件。
 * @param zipFilePath - 要解压的 zip 文件路径。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @returns 解压操作的异步结果。
 */
export function unzip(zipFilePath: string, targetPath: string): AsyncVoidIOResult {
    const absZipPath = getAbsolutePath(zipFilePath);
    const absTargetPath = getAbsolutePath(targetPath);

    const future = new Future<VoidIOResult>();

    getFs().unzip({
        zipFilePath: absZipPath,
        targetPath: absTargetPath,
        success(): void {
            future.resolve(RESULT_VOID);
        },
        fail(err): void {
            future.resolve(fileErrorToResult(err));
        },
    });

    return future.promise;
}

/**
 * 压缩文件。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export async function zip(sourcePath: string, zipFilePath: string, options?: ZipOptions): AsyncVoidIOResult {
    const absSourcePath = getAbsolutePath(sourcePath);
    const absZipPath = getAbsolutePath(zipFilePath);

    const statRes = await stat(absSourcePath);
    if (statRes.isErr()) {
        return statRes.asErr();
    }

    const zipped: fflate.AsyncZippable = {};

    const sourceName = basename(absSourcePath);
    const stats = statRes.unwrap();

    if (stats.isFile()) {
        // file
        const res = await readFile(absSourcePath);
        if (res.isErr()) {
            return res.asErr();
        }

        zipped[sourceName] = new Uint8Array(res.unwrap());
    } else {
        // directory
        const res = await stat(absSourcePath, {
            recursive: true,
        });
        if (res.isErr()) {
            return res.asErr();
        }

        // default to preserve root
        const preserveRoot = options?.preserveRoot ?? true;

        for (const { path, stats } of res.unwrap()) {
            if (stats.isFile()) {
                const entryName = preserveRoot ? join(sourceName, path) : path;
                // 不能用 json，否则 http://usr 会变成 http:/usr
                const res = await readFile(absSourcePath + path);
                if (res.isErr()) {
                    return res.asErr();
                }

                zipped[entryName] = new Uint8Array(res.unwrap());
            }
        }
    }

    const future = new Future<VoidIOResult>();

    fflate.zip(zipped, {
        consume: true,
    }, async (err, u8a) => {
        if (err) {
            future.resolve(Err(err));
            return;
        }

        const res = await writeFile(absZipPath, u8a);
        future.resolve(res);
    });

    return await future.promise;
}