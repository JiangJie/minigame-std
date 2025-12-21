import type { FetchResponse, FetchTask } from '@happy-ts/fetch-t';
import { basename, dirname, join } from '@std/path/posix';
import * as fflate from 'fflate/browser';
import type { ExistsOptions, WriteOptions, ZipOptions } from 'happy-opfs';
import { Err, Ok, RESULT_VOID, type AsyncIOResult, type AsyncVoidIOResult, type IOResult } from 'happy-rusty';
import { Future } from 'tiny-future';
import { assertSafeUrl } from '../assert/assertions.ts';
import { miniGameFailureToResult, promisifyWithResult } from '../utils/mod.ts';
import type { DownloadFileOptions, ReadFileContent, ReadOptions, StatOptions, UploadFileOptions, WriteFileContent } from './fs_define.ts';
import { createAbortError } from './fs_helpers.ts';
import { errToMkdirResult, errToRemoveResult, fileErrorToResult, getAbsolutePath, getExistsResult, getFs, getReadFileEncoding, getRootUsrPath, getWriteFileContents, isNotFoundError } from './mina_fs_shared.ts';

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 需要创建的目录路径。
 * @returns 创建结果的异步操作，成功时返回 true。
 */
export async function mkdir(dirPath: string): AsyncVoidIOResult {
    const absPath = getAbsolutePath(dirPath);

    // 根目录无需创建
    if (absPath === getRootUsrPath()) {
        return RESULT_VOID;
    }

    const statRes = await stat(absPath);

    if (statRes.isOk()) {
        // 存在则不创建
        return RESULT_VOID;
    }

    return (await promisifyWithResult(getFs().mkdir)({
        dirPath: absPath,
        recursive: true,
    }))
        .and(RESULT_VOID)
        .orElse(errToMkdirResult);
}

/**
 * 重命名文件或目录。
 * @param srcPath - 原路径。
 * @param destPath - 新路径。
 * @returns 重命名操作的异步结果，成功时返回 true。
 */
export async function move(srcPath: string, destPath: string): AsyncVoidIOResult {
    const absSrcPath = getAbsolutePath(srcPath);
    const absDestPath = getAbsolutePath(destPath);

    return (await promisifyWithResult(getFs().rename)({
        oldPath: absSrcPath,
        newPath: absDestPath,
    }))
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
}

/**
 * 读取目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 包含目录内容的字符串数组的异步操作。
 */
export async function readDir(dirPath: string): AsyncIOResult<string[]> {
    const absPath = getAbsolutePath(dirPath);

    return (await promisifyWithResult(getFs().readdir)({
        dirPath: absPath,
    }))
        .map(x => x.files)
        .orElse(fileErrorToResult);
}

/**
 * 以 UTF-8 格式读取文件。
 * @param filePath - 文件路径。
 * @param options - 读取选项，指定编码为 'utf8'。
 * @returns 包含文件内容的字符串的异步操作。
 */
export function readFile(filePath: string, options: ReadOptions & {
    encoding: 'utf8';
}): AsyncIOResult<string>;

/**
 * 以二进制格式读取文件。
 * @param filePath - 文件路径。
 * @param options - 读取选项，指定编码为 'binary'。
 * @returns 包含文件内容的 ArrayBuffer 的异步操作。
 */
export function readFile(filePath: string, options?: ReadOptions & {
    encoding: 'binary';
}): AsyncIOResult<ArrayBuffer>;

/**
 * 读取文件内容，可选地指定编码和返回类型。
 * @template T - 返回内容的类型。
 * @param filePath - 文件路径。
 * @param options - 可选的读取选项。
 * @returns 包含文件内容的异步操作。
 */
export async function readFile<T extends ReadFileContent>(filePath: string, options?: ReadOptions): AsyncIOResult<T> {
    const absPath = getAbsolutePath(filePath);
    const encoding = getReadFileEncoding(options);

    return (await promisifyWithResult(getFs().readFile)({
        filePath: absPath,
        encoding,
    }))
        .map(x => x.data as T)
        .orElse(fileErrorToResult);
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

    // 文件夹还是文件
    const res = statRes.unwrap().isDirectory()
        ? promisifyWithResult(getFs().rmdir)({
            dirPath: absPath,
            recursive: true,
        })
        : promisifyWithResult(getFs().unlink)({
            filePath: absPath,
        });

    return (await res)
        .and(RESULT_VOID)
        .orElse(errToRemoveResult);
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
export async function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const absPath = getAbsolutePath(path);

    return (await promisifyWithResult(getFs().stat)({
        path: absPath,
        recursive: options?.recursive ?? false,
    }))
        .map(x => x.stats)
        .orElse(fileErrorToResult);
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

    const fs = getFs();
    let method: typeof fs.appendFile | typeof fs.writeFile = fs.writeFile;

    if (append) {
        // append先判断文件是否存在
        const res = await exists(absPath);
        if (res.isErr()) {
            return res.asErr();
        }

        if (res.unwrap()) {
            // 文件存在才能使用appendFile
            method = fs.appendFile;
        }
    }

    const { data, encoding } = getWriteFileContents(contents);

    return (await promisifyWithResult(method)({
        filePath: absPath,
        data,
        encoding,
    }))
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
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

async function copyFile(srcPath: string, destPath: string): AsyncVoidIOResult {
    return (await promisifyWithResult(getFs().copyFile)({
        srcPath,
        destPath,
    }))
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
}

/**
 * 复制文件或文件夹。
 *
 * @param srcPath - 源文件或文件夹路径。
 * @param destPath - 目标文件或文件夹路径。
 * @returns 操作的异步结果。
 */
export async function copy(srcPath: string, destPath: string): AsyncVoidIOResult {
    const absSrcPath = getAbsolutePath(srcPath);
    const absDestPath = getAbsolutePath(destPath);

    return (await stat(absSrcPath, {
        recursive: true,
    })).andThenAsync(async statsArray => {
        // directory
        if (Array.isArray(statsArray)) {
            for (const { path, stats } of statsArray) {
                // 不能用join
                const srcEntryPath = absSrcPath + path;
                const destEntryPath = absDestPath + path;

                const res = await (stats.isDirectory()
                    ? mkdir(destEntryPath)
                    : copyFile(srcEntryPath, destEntryPath));

                if (res.isErr()) {
                    return res;
                }
            }

            return RESULT_VOID;
        } else {
            // file
            return (await mkdir(dirname(absDestPath))).andThenAsync(() => {
                return copyFile(absSrcPath, absDestPath);
            });
        }
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
 * 读取文件并解析为 JSON。
 * @param filePath - 文件路径。
 * @returns 读取结果。
 */
export async function readJsonFile<T>(filePath: string): AsyncIOResult<T> {
    return (await readTextFile(filePath)).andThenAsync(async contents => {
        try {
            return Ok(JSON.parse(contents));
        } catch (e) {
            return Err(e as Error);
        }
    });
}

/**
 * 将数据序列化为 JSON 并写入文件。
 * @param filePath - 文件路径。
 * @param data - 要写入的数据。
 * @returns 写入结果。
 */
export async function writeJsonFile<T>(filePath: string, data: T): AsyncVoidIOResult {
    try {
        return await writeFile(filePath, JSON.stringify(data));
    } catch (e) {
        return Err(e as Error);
    }
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
 * 下载文件并保存到临时文件。
 * @param fileUrl - 文件的网络 URL。
 * @param options - 可选参数。
 * @returns 下载操作的异步结果，成功时返回 true。
 */
export function downloadFile(fileUrl: string, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult>;
/**
 * 下载文件。
 * @param fileUrl - 文件的网络 URL。
 * @param filePath - 可选的下载后文件存储的路径，没传则存到临时文件。
 * @param options - 可选参数。
 * @returns 下载操作的异步结果，成功时返回 true。
 */
export function downloadFile(fileUrl: string, filePath: string, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult>;
export function downloadFile(fileUrl: string, filePath?: string | DownloadFileOptions, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult> {
    type T = WechatMinigame.DownloadFileSuccessCallbackResult;

    assertSafeUrl(fileUrl);

    let absFilePath: string | undefined = undefined;
    if (typeof filePath === 'string') {
        absFilePath = getAbsolutePath(filePath);
    } else {
        options = filePath;
    }

    const {
        onProgress,
        ...rest
    } = options ?? {};

    let aborted = false;

    const future = new Future<IOResult<T>>();

    let task: WechatMinigame.DownloadTask;

    const download = () => {
        task = wx.downloadFile({
            ...rest,
            url: fileUrl,
            filePath: absFilePath,
            async success(res): Promise<void> {
                if (aborted) {
                    future.resolve(Err(createAbortError()));
                    return;
                }

                const { statusCode } = res;

                if (statusCode >= 200 && statusCode < 300) {
                    future.resolve(Ok(res));
                    return;
                }

                // remove the not expected file but no need to actively delete the temporary file
                if (res.filePath) {
                    await remove(res.filePath);
                }

                future.resolve(Err(new Error(statusCode.toString())));
            },
            fail(err): void {
                future.resolve(aborted ? Err(createAbortError()) : miniGameFailureToResult(err));
            },
        });

        if (typeof onProgress === 'function') {
            task.onProgressUpdate(res => {
                const { totalBytesExpectedToWrite, totalBytesWritten } = res;
                onProgress(typeof totalBytesExpectedToWrite === 'number' && typeof totalBytesWritten === 'number' ? Ok({
                    totalByteLength: totalBytesExpectedToWrite,
                    completedByteLength: totalBytesWritten,
                }) : Err(new Error(`Unknown download progress ${ totalBytesWritten }/${ totalBytesExpectedToWrite }`)));
            });
        }
    };

    // maybe download to a temp file
    if (typeof absFilePath === 'string' && absFilePath) {
        // create the directory if not exists
        mkdir(dirname(absFilePath)).then(res => {
            if (aborted) {
                future.resolve(Err(createAbortError()));
                return;
            }

            if (res.isErr()) {
                future.resolve(res.asErr());
                return;
            }

            download();
        });
    } else {
        download();
    }

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
            future.resolve(miniGameFailureToResult(err));
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
export async function unzip(zipFilePath: string, targetPath: string): AsyncVoidIOResult {
    const absZipPath = getAbsolutePath(zipFilePath);
    const absTargetPath = getAbsolutePath(targetPath);

    return (await promisifyWithResult(getFs().unzip)({
        zipFilePath: absZipPath,
        targetPath: absTargetPath,
    }))
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
}

/**
 * 从网络下载 zip 文件并解压。
 * @param zipFileUrl - Zip 文件的网络地址。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @param options - 可选的下载参数。
 * @returns 下载并解压操作的异步结果。
 */
export async function unzipFromUrl(zipFileUrl: string, targetPath: string, options?: DownloadFileOptions): AsyncVoidIOResult {
    return (await downloadFile(zipFileUrl, options).response).andThenAsync(({ tempFilePath }) => {
        return unzip(tempFilePath, targetPath);
    });
}

/**
 * 压缩文件到内存。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export async function zip(sourcePath: string, options?: ZipOptions): AsyncIOResult<Uint8Array>;
/**
 * 压缩文件。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export async function zip(sourcePath: string, zipFilePath: string, options?: ZipOptions): AsyncVoidIOResult;
export async function zip<T>(sourcePath: string, zipFilePath?: string | ZipOptions, options?: ZipOptions): AsyncIOResult<T> {
    const absSourcePath = getAbsolutePath(sourcePath);

    let absZipFilePath: string;
    if (typeof zipFilePath === 'string') {
        absZipFilePath = getAbsolutePath(zipFilePath);
    } else {
        options = zipFilePath;
    }

    return (await stat(absSourcePath)).andThenAsync(async stats => {
        const zipped: fflate.AsyncZippable = {};

        const sourceName = basename(absSourcePath);

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
                    // 不能用 join，否则 http://usr 会变成 http:/usr
                    const res = await readFile(absSourcePath + path);
                    if (res.isErr()) {
                        return res.asErr();
                    }

                    zipped[entryName] = new Uint8Array(res.unwrap());
                }
            }
        }

        const future = new Future<IOResult<T>>();

        fflate.zip(zipped, {
            consume: true,
        }, async (err, u8a) => {
            if (err) {
                future.resolve(Err(err));
                return;
            }

            if (absZipFilePath) {
                const res = await writeFile(absZipFilePath, u8a as Uint8Array<ArrayBuffer>);
                future.resolve(res as IOResult<T>);
            } else {
                future.resolve(Ok(u8a as T));
            }
        });

        return await future.promise;
    });
}

type ZipFromUrlOptions = DownloadFileOptions & ZipOptions;
/**
 * 下载文件并压缩到内存。
 * @param sourceUrl - 要下载的文件 URL。
 * @param options - 合并的下载和压缩选项。
 */
export async function zipFromUrl(sourceUrl: string, options?: ZipFromUrlOptions): AsyncIOResult<Uint8Array>;
/**
 * 下载文件并压缩为 zip 文件。
 * @param sourceUrl - 要下载的文件 URL。
 * @param zipFilePath - 要输出的 zip 文件路径。
 * @param options - 合并的下载和压缩选项。
 */
export async function zipFromUrl(sourceUrl: string, zipFilePath: string, options?: ZipFromUrlOptions): AsyncVoidIOResult;
export async function zipFromUrl<T>(sourceUrl: string, zipFilePath?: string | ZipFromUrlOptions, options?: ZipFromUrlOptions): AsyncIOResult<T> {
    if (typeof zipFilePath !== 'string') {
        options = zipFilePath;
        zipFilePath = undefined;
    }

    return (await downloadFile(sourceUrl, options).response).andThenAsync(async ({ tempFilePath }) => {
        return await (zipFilePath
            ? zip(tempFilePath, zipFilePath, options)
            : zip(tempFilePath, options)) as IOResult<T>;
    });
}