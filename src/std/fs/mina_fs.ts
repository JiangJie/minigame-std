import type { FetchTask } from '@happy-ts/fetch-t';
import { basename, dirname } from '@std/path/posix';
import { NOT_FOUND_ERROR, assertAbsolutePath, type ExistsOptions, type WriteOptions } from 'happy-opfs';
import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { assertSafeUrl, assertString } from '../assert/assertions.ts';
import type { DownloadFileOptions, FileEncoding, ReadFileContent, ReadOptions, StatOptions, UploadFileOptions, WriteFileContent } from './fs_define.ts';

/**
 * 小游戏文件系统管理器实例。
 *
 * for tree shake
 */
let fs: WechatMinigame.FileSystemManager;

/**
 * 获取小游戏文件系统管理器实例。
 * @returns 文件系统管理器实例。
 */
function getFs(): WechatMinigame.FileSystemManager {
    fs ??= wx.getFileSystemManager();
    return fs;
}

/**
 * 根路径。
 *
 * for tree shake
 */
let rootPath: string;

/**
 * 获取文件系统的根路径。
 * @returns 文件系统的根路径。
 */
function getRootPath(): string {
    rootPath ??= wx.env.USER_DATA_PATH;
    return rootPath;
}

/**
 * 获取给定路径的绝对路径。
 * @param path - 相对USER_DATA_PATH的相对路径，也必须以`/`开头。
 * @returns 转换后的绝对路径。
 */
function getAbsolutePath(path: string): string {
    assertString(path);

    const rootPath = getRootPath();

    if (path.startsWith(rootPath)) {
        return path;
    }

    assertAbsolutePath(path);
    return rootPath + path;
}

/**
 * 判断是否是文件不存在的错误。
 * @param err - 错误对象。
 */
function isNotFoundFileError(err: WechatMinigame.FileError): boolean {
    return err.errCode === 1300002 || err.errMsg.includes('no such file or directory');
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 */
function toErr<T>(err: WechatMinigame.FileError | WechatMinigame.GeneralCallbackResult): IOResult<T> {
    const error = new Error(err.errMsg);

    // 1300002	no such file or directory ${path}
    // 可能没有errCode
    if (isNotFoundFileError(err as WechatMinigame.FileError)) {
        error.name = NOT_FOUND_ERROR;
    }

    return Err(error);
}

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 需要创建的目录路径。
 * @returns 创建结果的异步操作，成功时返回 true。
 */
export function mkdir(dirPath: string): AsyncIOResult<boolean> {
    const absPath = getAbsolutePath(dirPath);

    return new Promise((resolve) => {
        getFs().mkdir({
            dirPath: absPath,
            recursive: true,
            success(): void {
                resolve(Ok(true));
            },
            fail(err): void {
                // 1301005	file already exists ${dirPath}	已有同名文件或目录
                // 可能没有errCode
                if (err.errCode === 1301005 || err.errMsg.includes('already exists')) {
                    // 当做成功
                    resolve(Ok(true));
                    return;
                }

                resolve(toErr(err));
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
        getFs().readdir({
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

    // NOTE: 想要读取ArrayBuffer就不能传encoding，
    // 如果传了'binary'，读出来的是字符串
    let encoding: FileEncoding | undefined = options?.encoding;
    if (!encoding || encoding === 'binary') {
        encoding = undefined;
    }

    return new Promise((resolve) => {
        getFs().readFile({
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
            getFs().rmdir({
                dirPath: absPath,
                recursive: true,
                success(): void {
                    resolve(Ok(true));
                },
                fail(err): void {
                    // 目标 path 本就不存在，当做成功
                    resolve(isNotFoundFileError(err) ? Ok(true) : toErr(err));
                },
            });
        } else {
            getFs().unlink({
                filePath: absPath,
                success(): void {
                    resolve(Ok(true));
                },
                fail(err): void {
                    // 目标 path 本就不存在，当做成功
                    resolve(isNotFoundFileError(err) ? Ok(true) : toErr(err));
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
        getFs().rename({
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
        getFs().stat({
            path: absPath,
            recursive: options?.recursive,
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

    const isBuffer = contents instanceof ArrayBuffer;
    const isBufferView = ArrayBuffer.isView(contents);
    const isBin = isBuffer || isBufferView;

    if (create) {
        const res = await mkdir(dirname(absPath));
        if (res.isErr()) {
            return res;
        }
    }

    return new Promise((resolve) => {
        (append ? getFs().appendFile : getFs().writeFile)({
            filePath: absPath,
            // ArrayBuffer可能是带有offset的
            data: isBufferView ? contents.buffer : contents,
            encoding: isBin ? 'binary' : 'utf8',
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

    if (res.isErr()) {
        if (res.unwrapErr().name === NOT_FOUND_ERROR) {
            return Ok(false);
        }
        return res.asErr();
    }

    const { isDirectory = false, isFile = false } = options ?? {};

    if (isDirectory && isFile) {
        throw new TypeError('ExistsOptions.isDirectory and ExistsOptions.isFile must not be true together.');
    }

    const stats = res.unwrap();
    const notExist =
        (isDirectory && stats.isFile())
        || (isFile && stats.isDirectory());

    return Ok(!notExist);
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
        if (res.unwrapErr().name === NOT_FOUND_ERROR) {
            // 不存在则创建
            return mkdir(dirPath);
        }

        return res.asErr();
    }

    const items: AsyncIOResult<T>[] = [];

    for await (const name of res.unwrap()) {
        items.push(remove(`${ dirPath }/${ name }`));
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