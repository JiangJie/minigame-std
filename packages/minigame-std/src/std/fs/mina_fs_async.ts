/**
 * @internal
 * 小游戏平台的异步文件系统操作实现。
 */

import { FetchError, type FetchResult } from '@happy-ts/fetch-t';
import { basename, dirname } from '@std/path/posix';
import { zip as compress, type AsyncZippable } from 'fflate/browser';
import type { ExistsOptions, WriteOptions, ZipOptions } from 'happy-opfs';
import { Err, Ok, RESULT_VOID, tryResult, type AsyncIOResult, type AsyncVoidIOResult, type IOResult } from 'happy-rusty';
import { Future } from 'tiny-future';
import type { FetchTask } from '../fetch/fetch_defines.ts';
import { createFailedFetchTask, miniGameFailureToResult, validateSafeUrl } from '../internal/mod.ts';
import { asyncResultify } from '../utils/mod.ts';
import type { DownloadFileOptions, ReadFileContent, ReadOptions, StatOptions, UploadFileOptions, WriteFileContent } from './fs_define.ts';
import { createAbortError } from './fs_helpers.ts';
import { errToMkdirResult, errToRemoveResult, fileErrorToResult, getExistsResult, getFs, getReadFileEncoding, getUsrPath, getWriteFileContents, isNotFoundError, validateAbsolutePath, validateExistsOptions } from './mina_fs_shared.ts';

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 需要创建的目录路径。
 * @returns 创建操作的异步结果。
 */
export async function mkdir(dirPath: string): AsyncVoidIOResult {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    // 根目录无需创建
    if (dirPath === getUsrPath()) {
        return RESULT_VOID;
    }

    const statRes = await stat(dirPath);

    if (statRes.isOk()) {
        // 存在则不创建
        return RESULT_VOID;
    }

    const mkdirRes = await asyncResultify(getFs().mkdir)({
        dirPath,
        recursive: true,
    });

    return mkdirRes
        .and(RESULT_VOID)
        .orElse(errToMkdirResult);
}

/**
 * 移动或重命名文件或目录。
 * @param srcPath - 原路径。
 * @param destPath - 新路径。
 * @returns 移动操作的异步结果。
 */
export async function move(srcPath: string, destPath: string): AsyncVoidIOResult {
    const srcPathRes = validateAbsolutePath(srcPath);
    if (srcPathRes.isErr()) return srcPathRes.asErr();
    srcPath = srcPathRes.unwrap();

    const destPathRes = validateAbsolutePath(destPath);
    if (destPathRes.isErr()) return destPathRes.asErr();
    destPath = destPathRes.unwrap();

    const moveRes = await asyncResultify(getFs().rename)({
        oldPath: srcPath,
        newPath: destPath,
    });

    return moveRes
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
}

/**
 * 读取目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 包含目录内容的字符串数组的异步结果。
 */
export async function readDir(dirPath: string): AsyncIOResult<string[]> {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    const readDirRes = await asyncResultify(getFs().readdir)({
        dirPath,
    });

    return readDirRes
        .map(x => x.files)
        .orElse(fileErrorToResult);
}

/**
 * 以 UTF-8 格式读取文件。
 * @param filePath - 文件路径。
 * @param options - 读取选项，指定编码为 'utf8'。
 * @returns 包含文件内容的字符串的异步结果。
 */
export function readFile(filePath: string, options: ReadOptions & {
    encoding: 'utf8';
}): AsyncIOResult<string>;

/**
 * 以二进制格式读取文件。
 * @param filePath - 文件路径。
 * @param options - 读取选项，指定编码为 'binary'。
 * @returns 包含文件内容的 ArrayBuffer 的异步结果。
 */
export function readFile(filePath: string, options?: ReadOptions & {
    encoding: 'binary';
}): AsyncIOResult<ArrayBuffer>;

/**
 * 读取文件内容，可选地指定编码和返回类型。
 * @template T - 返回内容的类型。
 * @param filePath - 文件路径。
 * @param options - 可选的读取选项。
 * @returns 包含文件内容的异步结果。
 */
export async function readFile(filePath: string, options?: ReadOptions): AsyncIOResult<ReadFileContent> {
    const filePathRes = validateAbsolutePath(filePath);
    if (filePathRes.isErr()) return filePathRes.asErr();
    filePath = filePathRes.unwrap();

    const encoding = getReadFileEncoding(options);

    const readFileRes = await asyncResultify(getFs().readFile)({
        filePath,
        encoding,
    });

    return readFileRes
        .map(x => x.data)
        .orElse(fileErrorToResult);
}

/**
 * 删除指定路径的文件或目录。
 * @param path - 需要删除的文件或目录的路径。
 * @returns 删除操作的异步结果。
 */
export async function remove(path: string): AsyncVoidIOResult {
    const pathRes = validateAbsolutePath(path);
    if (pathRes.isErr()) return pathRes.asErr();
    path = pathRes.unwrap();

    const statRes = await stat(path);

    if (statRes.isErr()) {
        // 不存在当做成功
        return isNotFoundError(statRes.unwrapErr()) ? RESULT_VOID : statRes.asErr();
    }

    // 文件夹还是文件
    const removeRes = await (statRes.unwrap().isDirectory()
        ? asyncResultify(getFs().rmdir)({
            dirPath: path,
            recursive: true,
        })
        : asyncResultify(getFs().unlink)({
            filePath: path,
        }));

    return removeRes
        .and(RESULT_VOID)
        .orElse(errToRemoveResult);
}

/**
 * 获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @param options - 可选选项。
 * @returns 包含状态信息的异步结果。
 */
export function stat(path: string): AsyncIOResult<WechatMinigame.Stats>;
export function stat(path: string, options: StatOptions & {
    recursive: true;
}): AsyncIOResult<WechatMinigame.FileStats[]>;
export function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
export async function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const pathRes = validateAbsolutePath(path);
    if (pathRes.isErr()) return pathRes.asErr();
    path = pathRes.unwrap();

    const statRes = await asyncResultify(getFs().stat)({
        path,
        recursive: options?.recursive ?? false,
    });

    return statRes
        .map(x => x.stats)
        .orElse(fileErrorToResult);
}

/**
 * 将内容写入文件。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @param options - 可选的写入选项。
 * @returns 写入操作的异步结果。
 */
export async function writeFile(filePath: string, contents: WriteFileContent, options?: WriteOptions): AsyncVoidIOResult {
    const filePathRes = validateAbsolutePath(filePath);
    if (filePathRes.isErr()) return filePathRes.asErr();
    filePath = filePathRes.unwrap();

    // 默认创建
    const { append = false, create = true } = options ?? {};

    if (create) {
        const mkdirRes = await mkdir(dirname(filePath));
        if (mkdirRes.isErr()) {
            return mkdirRes;
        }
    }

    const fs = getFs();
    let writeMethod: typeof fs.appendFile | typeof fs.writeFile = fs.writeFile;

    if (append) {
        // append先判断文件是否存在
        const existsRes = await exists(filePath);
        if (existsRes.isErr()) {
            return existsRes.asErr();
        }

        if (existsRes.unwrap()) {
            // 文件存在才能使用appendFile
            writeMethod = fs.appendFile;
        }
    }

    const { data, encoding } = getWriteFileContents(contents);

    const writeRes = await asyncResultify(writeMethod)({
        filePath,
        data,
        encoding,
    });

    return writeRes
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加操作的异步结果。
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncVoidIOResult {
    return writeFile(filePath, contents, {
        append: true,
    });
}

async function copyFile(srcPath: string, destPath: string): AsyncVoidIOResult {
    const copyRes = await asyncResultify(getFs().copyFile)({
        srcPath,
        destPath,
    });

    return copyRes
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
    const srcPathRes = validateAbsolutePath(srcPath);
    if (srcPathRes.isErr()) return srcPathRes.asErr();
    srcPath = srcPathRes.unwrap();

    const destPathRes = validateAbsolutePath(destPath);
    if (destPathRes.isErr()) return destPathRes.asErr();
    destPath = destPathRes.unwrap();

    const statRes = await stat(srcPath, {
        recursive: true,
    });

    return statRes.andThenAsync(async statsArray => {
        // 目录
        if (Array.isArray(statsArray)) {
            for (const { path, stats } of statsArray) {
                // 不能用join
                const srcEntryPath = srcPath + path;
                const destEntryPath = destPath + path;

                const copyRes = await (stats.isDirectory()
                    ? mkdir(destEntryPath)
                    // 文件的父目录一定先于文件创建, 所以不需要额外 mkdir
                    : copyFile(srcEntryPath, destEntryPath));

                if (copyRes.isErr()) {
                    return copyRes;
                }
            }

            return RESULT_VOID;
        } else {
            // 文件
            const mkdirRes = await mkdir(dirname(destPath));
            return mkdirRes.andThenAsync(() => {
                return copyFile(srcPath, destPath);
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
    const optionsRes = validateExistsOptions(options);
    if (optionsRes.isErr()) return optionsRes.asErr();

    const statRes = await stat(path);
    return getExistsResult(statRes, options);
}

/**
 * 清空目录中的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 清空操作的异步结果。
 */
export async function emptyDir(dirPath: string): AsyncVoidIOResult {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    const readDirRes = await readDir(dirPath);
    if (readDirRes.isErr()) {
        // 不存在则创建
        return isNotFoundError(readDirRes.unwrapErr())
            ? mkdir(dirPath)
            : readDirRes.asErr();
    }

    const tasks = readDirRes.unwrap().map(name => remove(dirPath + name));
    const taskResults = await Promise.all(tasks);
    // 是否有失败？
    const failed = taskResults.find(x => x.isErr());

    return failed ?? RESULT_VOID;
}

/**
 * 读取文件并解析为 JSON。
 * @param filePath - 文件路径。
 * @returns 读取结果。
 */
export async function readJsonFile<T>(filePath: string): AsyncIOResult<T> {
    const readFileRes = await readTextFile(filePath);

    return readFileRes.andThen(contents => {
        return tryResult(JSON.parse, contents);
    });
}

/**
 * 将数据序列化为 JSON 并写入文件。
 * @param filePath - 文件路径。
 * @param data - 要写入的数据。
 * @returns 写入结果。
 */
export async function writeJsonFile<T>(filePath: string, data: T): AsyncVoidIOResult {
    const result = tryResult(JSON.stringify, data);

    return result.andThenAsync(text => writeFile(filePath, text));
}

/**
 * 读取文本文件的内容。
 * @param filePath - 文件路径。
 * @returns 包含文件文本内容的异步结果。
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
 * @returns 下载操作的异步结果。
 */
export function downloadFile(fileUrl: string, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult>;
/**
 * 下载文件。
 * @param fileUrl - 文件的网络 URL。
 * @param filePath - 可选的下载后文件存储的路径，没传则存到临时文件。
 * @param options - 可选参数。
 * @returns 下载操作的异步结果。
 */
export function downloadFile(fileUrl: string, filePath: string, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult>;
export function downloadFile(fileUrl: string, filePath?: string | DownloadFileOptions, options?: DownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult> {
    type T = WechatMinigame.DownloadFileSuccessCallbackResult;

    const fileUrlRes = validateSafeUrl(fileUrl);
    if (fileUrlRes.isErr()) return createFailedFetchTask(fileUrlRes);

    if (typeof filePath === 'string') {
        const filePathRes = validateAbsolutePath(filePath);
        if (filePathRes.isErr()) return createFailedFetchTask(filePathRes);
        filePath = filePathRes.unwrap();
    } else {
        options = filePath;
        filePath = undefined;
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
            filePath: filePath as string,
            async success(response): Promise<void> {
                if (aborted) {
                    future.resolve(Err(createAbortError()));
                    return;
                }

                const { statusCode } = response;

                if (statusCode >= 200 && statusCode < 300) {
                    future.resolve(Ok(response));
                    return;
                }

                // 删除不符合预期的文件，但无需主动删除临时文件
                if (response.filePath) {
                    await remove(response.filePath);
                }

                future.resolve(Err(new FetchError(response.errMsg, statusCode)));
            },
            fail(err): void {
                future.resolve(aborted ? Err(createAbortError()) : miniGameFailureToResult(err));
            },
        });

        if (typeof onProgress === 'function') {
            task.onProgressUpdate(progress => {
                const { totalBytesExpectedToWrite, totalBytesWritten } = progress;
                onProgress(typeof totalBytesExpectedToWrite === 'number' && typeof totalBytesWritten === 'number' ? Ok({
                    totalByteLength: totalBytesExpectedToWrite,
                    completedByteLength: totalBytesWritten,
                }) : Err(new Error(`Unknown download progress ${ totalBytesWritten }/${ totalBytesExpectedToWrite }`)));
            });
        }
    };

    if (typeof filePath === 'string' && filePath) {
        // 如果目录不存在则创建
        mkdir(dirname(filePath)).then(mkdirRes => {
            if (aborted) {
                future.resolve(Err(createAbortError()));
                return;
            }

            if (mkdirRes.isErr()) {
                future.resolve(mkdirRes.asErr());
                return;
            }

            download();
        });
    } else {
        // 可能下载到临时文件
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

        get result(): FetchResult<T> {
            return future.promise;
        },
    };
}

/**
 * 文件上传。
 * @param filePath - 需要上传的文件路径。
 * @param fileUrl - 目标网络 URL。
 * @param options - 可选参数。
 * @returns 上传操作的异步结果。
 */
export function uploadFile(filePath: string, fileUrl: string, options?: UploadFileOptions): FetchTask<WechatMinigame.UploadFileSuccessCallbackResult> {
    type T = WechatMinigame.UploadFileSuccessCallbackResult;

    const fileUrlRes = validateSafeUrl(fileUrl);
    if (fileUrlRes.isErr()) return createFailedFetchTask(fileUrlRes);

    const filePathRes = validateAbsolutePath(filePath);
    if (filePathRes.isErr()) return createFailedFetchTask(filePathRes);
    filePath = filePathRes.unwrap();

    let aborted = false;

    const future = new Future<IOResult<T>>();

    const task = wx.uploadFile({
        name: basename(filePath),
        ...options,
        url: fileUrl,
        filePath,
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

        get result(): FetchResult<T> {
            return future.promise;
        },
    };
}

/**
 * 解压 zip 文件。
 * @param zipFilePath - 要解压的 zip 文件路径。
 * @param destDir - 要解压到的目标文件夹路径。
 * @returns 解压操作的异步结果。
 */
export async function unzip(zipFilePath: string, destDir: string): AsyncVoidIOResult {
    const zipFilePathRes = validateAbsolutePath(zipFilePath);
    if (zipFilePathRes.isErr()) return zipFilePathRes.asErr();
    zipFilePath = zipFilePathRes.unwrap();

    const destDirRes = validateAbsolutePath(destDir);
    if (destDirRes.isErr()) return destDirRes.asErr();
    destDir = destDirRes.unwrap();

    const unzipRes = await asyncResultify(getFs().unzip)({
        zipFilePath,
        targetPath: destDir,
    });

    return unzipRes
        .and(RESULT_VOID)
        .orElse(fileErrorToResult);
}

/**
 * 从网络下载 zip 文件并解压。
 * @param zipFileUrl - Zip 文件的网络地址。
 * @param destDir - 要解压到的目标文件夹路径。
 * @param options - 可选的下载参数。
 * @returns 下载并解压操作的异步结果。
 */
export async function unzipFromUrl(zipFileUrl: string, destDir: string, options?: DownloadFileOptions): AsyncVoidIOResult {
    const destDirRes = validateAbsolutePath(destDir);
    if (destDirRes.isErr()) return destDirRes.asErr();
    destDir = destDirRes.unwrap();

    const downloadRes = await downloadFile(zipFileUrl, options).result;

    return downloadRes.andThenAsync(({ tempFilePath }) => {
        return unzip(tempFilePath, destDir);
    });
}

/**
 * 压缩文件到内存。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export async function zip(sourcePath: string, options?: ZipOptions): AsyncIOResult<Uint8Array<ArrayBuffer>>;
/**
 * 压缩文件。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export async function zip(sourcePath: string, zipFilePath: string, options?: ZipOptions): AsyncVoidIOResult;
export async function zip(sourcePath: string, zipFilePath?: string | ZipOptions, options?: ZipOptions): AsyncZipIOResult {
    if (typeof zipFilePath === 'string') {
        const zipFilePathRes = validateAbsolutePath(zipFilePath);
        if (zipFilePathRes.isErr()) return zipFilePathRes.asErr() as ZipIOResult;
        zipFilePath = zipFilePathRes.unwrap();
    } else {
        options = zipFilePath;
        zipFilePath = undefined;
    }

    const statRes = await stat(sourcePath);
    if (statRes.isErr()) return statRes.asErr() as ZipIOResult;

    const stats = statRes.unwrap();
    const sourceName = basename(sourcePath);
    const zippable: AsyncZippable = {};

    if (stats.isFile()) {
    // 文件
        const readFileRes = await readFile(sourcePath);
        if (readFileRes.isErr()) return readFileRes.asErr() as ZipIOResult;

        zippable[sourceName] = new Uint8Array(readFileRes.unwrap());
    } else {
        // 目录
        const statRes = await stat(sourcePath, {
            recursive: true,
        });
        if (statRes.isErr()) return statRes.asErr() as ZipIOResult;

        // 默认保留根目录
        const preserveRoot = options?.preserveRoot ?? true;

        for (const { path, stats } of statRes.unwrap()) {
            if (stats.isFile()) {
                const entryName = preserveRoot ? sourceName + path : path;
                // 不能用 join，否则 http://usr 会变成 http:/usr
                const readFileRes = await readFile(sourcePath + path);
                if (readFileRes.isErr()) return readFileRes.asErr() as ZipIOResult;

                zippable[entryName] = new Uint8Array(readFileRes.unwrap());
            }
        }
    }

    return zipTo(zippable, zipFilePath);
}

/**
 * 下载文件并压缩到内存。
 * @param sourceUrl - 要下载的文件 URL。
 * @param options - 下载选项。
 */
export async function zipFromUrl(sourceUrl: string, options?: DownloadFileOptions): AsyncIOResult<Uint8Array<ArrayBuffer>>;
/**
 * 下载文件并压缩为 zip 文件。
 * @param sourceUrl - 要下载的文件 URL。
 * @param zipFilePath - 要输出的 zip 文件路径。
 * @param options - 下载选项。
 */
export async function zipFromUrl(sourceUrl: string, zipFilePath: string, options?: DownloadFileOptions): AsyncVoidIOResult;
export async function zipFromUrl(sourceUrl: string, zipFilePath?: string | DownloadFileOptions, options?: DownloadFileOptions): AsyncZipIOResult {
    if (typeof zipFilePath !== 'string') {
        options = zipFilePath;
        zipFilePath = undefined;
    }

    const downloadRes = await downloadFile(sourceUrl, options).result;

    return downloadRes.andThenAsync(async ({ tempFilePath }) => {
        const readFileRes = await readFile(tempFilePath);
        if (readFileRes.isErr()) return readFileRes.asErr() as ZipIOResult;

        const sourceName = basename(tempFilePath);
        const zippable = {
            [sourceName]: new Uint8Array(readFileRes.unwrap()),
        };

        return zipTo(zippable, zipFilePath);
    });
}

// #region Internal Types

/**
 * zip 操作的结果。
 */
type ZipIOResult = IOResult<Uint8Array<ArrayBuffer> | void>;
type AsyncZipIOResult = Promise<ZipIOResult>;

// #endregion

// #region Internal Functions

// #region Internal Functions

function zipTo(zippable: AsyncZippable, zipFilePath?: string): AsyncZipIOResult {
    const future = new Future<ZipIOResult>();

    compress(zippable, {
        consume: true,
    }, async (err, bytesLike) => {
        if (err) {
            future.resolve(Err(err) as ZipIOResult);
            return;
        }

        const bytes = bytesLike as Uint8Array<ArrayBuffer>;
        // 有文件路径则写入文件
        if (zipFilePath) {
            future.resolve(writeFile(zipFilePath, bytes));
        } else {
            future.resolve(Ok(bytes));
        }
    });

    return future.promise;
}

// #endregion
