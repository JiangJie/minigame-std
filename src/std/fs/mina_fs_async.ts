import type { FetchTask } from '@happy-ts/fetch-t';
import { basename, dirname, join } from '@std/path/posix';
import { type ExistsOptions, type WriteOptions } from 'happy-opfs';
import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { assertSafeUrl } from '../assert/assertions.ts';
import type { DownloadFileOptions, ReadFileContent, ReadOptions, StatOptions, UploadFileOptions, WriteFileContent } from './fs_define.ts';
import { getAbsolutePath, getFs, isNotFoundError, toErr } from './fs_helpers.ts';
import { errToMkdirResult, errToRemoveResult, getExistsResult, getReadFileEncoding, getWriteFileContents } from './mina_fs_shared.ts';

const fs = getFs();

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 需要创建的目录路径。
 * @returns 创建结果的异步操作，成功时返回 true。
 */
export function mkdir(dirPath: string): AsyncIOResult<boolean> {
    const absPath = getAbsolutePath(dirPath);

    return new Promise((resolve) => {
        fs.mkdir({
            dirPath: absPath,
            recursive: true,
            success(): void {
                resolve(Ok(true));
            },
            fail(err): void {
                resolve(errToMkdirResult(err));
            },
        });
    });
}

/**
 * 读取目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 包含目录内容的字符串数组的异步操作。
 */
export function readDir(dirPath: string): AsyncIOResult<string[]> {
    const absPath = getAbsolutePath(dirPath);

    return new Promise((resolve) => {
        fs.readdir({
            dirPath: absPath,
            success(res): void {
                resolve(Ok(res.files));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
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

    return new Promise((resolve) => {
        fs.readFile({
            filePath: absPath,
            encoding,
            success(res): void {
                resolve(Ok(res.data as T));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
}

/**
 * 删除指定路径的文件或目录。
 * @param path - 需要删除的文件或目录的路径。
 * @returns 删除操作的异步结果，成功时返回 true。
 */
export async function remove(path: string): AsyncIOResult<boolean> {
    const res = await stat(path);

    if (res.isErr()) {
        return res.asErr();
    }

    const absPath = getAbsolutePath(path);

    return new Promise((resolve) => {
        // 文件夹还是文件
        if (res.unwrap().isDirectory()) {
            fs.rmdir({
                dirPath: absPath,
                recursive: true,
                success(): void {
                    resolve(Ok(true));
                },
                fail(err): void {
                    resolve(errToRemoveResult(err));
                },
            });
        } else {
            fs.unlink({
                filePath: absPath,
                success(): void {
                    resolve(Ok(true));
                },
                fail(err): void {
                    resolve(errToRemoveResult(err));
                },
            });
        }
    });
}

/**
 * 重命名文件或目录。
 * @param oldPath - 原路径。
 * @param newPath - 新路径。
 * @returns 重命名操作的异步结果，成功时返回 true。
 */
export function rename(oldPath: string, newPath: string): AsyncIOResult<boolean> {
    const absOldPath = getAbsolutePath(oldPath);
    const absNewPath = getAbsolutePath(newPath);

    return new Promise((resolve) => {
        fs.rename({
            oldPath: absOldPath,
            newPath: absNewPath,
            success(): void {
                resolve(Ok(true));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
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
    const absPath = getAbsolutePath(path);

    return new Promise((resolve) => {
        fs.stat({
            path: absPath,
            recursive: options?.recursive ?? false,
            success(res): void {
                resolve(Ok(res.stats));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
}

/**
 * 将内容写入文件。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @param options - 可选的写入选项。
 * @returns 写入操作的异步结果，成功时返回 true。
 */
export async function writeFile(filePath: string, contents: WriteFileContent, options?: WriteOptions): AsyncIOResult<boolean> {
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

    return new Promise((resolve) => {
        (append ? fs.appendFile : fs.writeFile)({
            filePath: absPath,
            data,
            encoding,
            success(): void {
                resolve(Ok(true));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加操作的异步结果，成功时返回 true。
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncIOResult<boolean> {
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
export async function emptyDir(dirPath: string): AsyncIOResult<boolean> {
    type T = boolean;

    const res = await readDir(dirPath);
    if (res.isErr()) {
        // 不存在则创建
        return isNotFoundError(res.unwrapErr()) ? mkdir(dirPath) : res.asErr();
    }

    const items: AsyncIOResult<T>[] = [];

    for await (const name of res.unwrap()) {
        items.push(remove(join(dirPath, name)));
    }

    const success: IOResult<T> = await Promise.all(items).then((x) => {
        let err: IOResult<T> | null = null;

        const success = x.every(y => {
            if (y.isErr()) {
                err = y;
                return false;
            }

            return y.unwrap();
        });

        return err ?? Ok(success);
    });

    return success;
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
    assertSafeUrl(fileUrl);
    const absPath = getAbsolutePath(filePath);

    let aborted = false;

    let task: WechatMinigame.DownloadTask;

    return {
        abort(): void {
            aborted = true;
            task?.abort();
        },

        aborted,

        response: new Promise<IOResult<WechatMinigame.DownloadFileSuccessCallbackResult>>((resolve) => {
            task = wx.downloadFile({
                ...options,
                url: fileUrl,
                filePath: absPath,
                success(res): void {
                    resolve(Ok(res));
                },
                fail(err): void {
                    resolve(toErr(err));
                },
            });
        }).catch(err => {
            const errMsg: string = err?.message ?? `downloadFile error ${ err }`;
            return Err(new Error(errMsg));
        }),
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
    assertSafeUrl(fileUrl);
    const absPath = getAbsolutePath(filePath);

    let aborted = false;

    let task: WechatMinigame.UploadTask;

    return {
        abort(): void {
            aborted = true;
            task?.abort();
        },

        aborted,

        response: new Promise<IOResult<WechatMinigame.UploadFileSuccessCallbackResult>>((resolve) => {
            task = wx.uploadFile({
                name: basename(filePath),
                ...options,
                url: fileUrl,
                filePath: absPath,
                success(res): void {
                    resolve(Ok(res));
                },
                fail(err): void {
                    resolve(toErr(err));
                },
            });
        }).catch(err => {
            const errMsg: string = err?.message ?? `downloadFile error ${ err }`;
            return Err(new Error(errMsg));
        }),
    };
}