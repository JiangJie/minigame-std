import { basename, dirname } from '@std/path/posix';
import { NOT_FOUND_ERROR, assertAbsolutePath, type ExistsOptions, type WriteOptions } from 'happy-opfs';
import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { assertSafeUrl, assertString } from '../assert/assertions.ts';
import type { FileEncoding, ReadFileContent, ReadOptions, WriteFileContent } from './fs_define.ts';

/**
 * for tree shake
 */
let fs: WechatMinigame.FileSystemManager;
function getFs(): WechatMinigame.FileSystemManager {
    fs ??= wx.getFileSystemManager();
    return fs;
}

/**
 * for tree shake
 */
let rootPath: string;
function getRootPath(): string {
    rootPath ??= wx.env.USER_DATA_PATH;
    return rootPath;
}

/**
 * 获取绝对路径
 * @param path 相对USER_DATA_PATH的相对路径，也必须以`/`开头
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
 * interface FileError 转换为 Err<Error>
 * @param err FileError
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toErr(err: WechatMinigame.FileError | WechatMinigame.GeneralCallbackResult): IOResult<any> {
    const error = new Error(err.errMsg);

    // 1300002	no such file or directory ${path}
    // 可能没有errCode
    if ((err as WechatMinigame.FileError).errCode === 1300002 || err.errMsg.includes('no such file or directory')) {
        error.name = NOT_FOUND_ERROR;
    }

    return Err(error);
}

/**
 * 递归创建文件夹，相当于`mkdir -p`
 * @param dirPath 要创建的文件夹路径
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
 * 读取文件夹一级子内容
 * @param dirPath 文件夹路径
 * @returns
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
 * 读取文件内容，默认返回`ArrayBuffer`
 * @param filePath 文件路径
 * @param options 可按编码返回不同的格式
 * @returns
 */
export function readFile(filePath: string, options: ReadOptions & {
    encoding: 'binary',
}): AsyncIOResult<ArrayBuffer>;
export function readFile(filePath: string, options: ReadOptions & {
    encoding: 'utf8',
}): AsyncIOResult<string>;
export function readFile(filePath: string): AsyncIOResult<ArrayBuffer>;
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
 * 删除文件或文件夹，相当于`rm -rf`
 * @param path 文件（夹）路径
 * @returns
 */
export async function remove(path: string): AsyncIOResult<boolean> {
    const res = await stat(path);

    if (res.isErr()) {
        return res;
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
                    resolve(toErr(err));
                },
            });
        } else {
            getFs().unlink({
                filePath: absPath,
                success(): void {
                    resolve(Ok(true));
                },
                fail(err): void {
                    resolve(toErr(err));
                },
            });
        }
    });
}

/**
 * 剪切文件或文件夹
 * @param oldPath
 * @param newPath
 * @returns
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
 * fs.stat
 * @param path
 * @returns
 */
export function stat(path: string): AsyncIOResult<WechatMinigame.Stats> {
    const absPath = getAbsolutePath(path);

    return new Promise((resolve) => {
        getFs().stat({
            path: absPath,
            success(res): void {
                resolve(Ok(res.stats as WechatMinigame.Stats));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
}

/**
 * 写入文件内容，如果文件不存在默认会创建
 * @param filePath 文件路径
 * @param contents 文件内容
 * @param options
 * @returns
 */
export async function writeFile(filePath: string, contents: WriteFileContent, options?: WriteOptions): AsyncIOResult<boolean> {
    const absPath = getAbsolutePath(filePath);

    // 默认创建
    const { append = false, create = true } = options ?? {};

    const isBuffer = contents instanceof ArrayBuffer;
    const isBufferView = (contents as ArrayBufferView).buffer instanceof ArrayBuffer;
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
            data: isBufferView ? (contents as ArrayBufferView).buffer as ArrayBuffer : (contents as string | ArrayBuffer),
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
 * 将内容写入文件末尾
 * @param filePath 要写入的文件路径
 * @param contents 写入内容
 * @returns
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncIOResult<boolean> {
    return writeFile(filePath, contents, {
        append: true,
    });
}

/**
 * 检查路径是否存在
 * @param path 要检查的文件（夹）路径
 */
export async function exists(path: string, options?: ExistsOptions): AsyncIOResult<boolean> {
    const res = await stat(path);

    if (res.isErr()) {
        if (res.err().name === NOT_FOUND_ERROR) {
            return Ok(false);
        }
        // reuse
        return res;
    }

    const { isDirectory = false, isFile = false } = options ?? {};

    if (isDirectory && isFile) {
        throw new TypeError('ExistsOptions.isDirectory and ExistsOptions.isFile must not be true together.');
    }

    const stats =res.unwrap();
    const notExist =
        (isDirectory && stats.isFile())
        || (isFile && stats.isDirectory());

    return Ok(!notExist);
}

/**
 * 清空文件夹，不存在则创建
 * @param dirPath 文件夹路径
 * @returns
 */
export async function emptyDir(dirPath: string): AsyncIOResult<boolean> {
    type T = boolean;

    const res = await readDir(dirPath);
    if (res.isErr()) {
        if (res.err().name === NOT_FOUND_ERROR) {
            // 不存在则创建
            return mkdir(dirPath);
        }

        return res;
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
 * 以字符串格式读取文件
 * @param filePath 要读取的文件路径
 * @returns
 */
export function readTextFile(filePath: string): AsyncIOResult<string> {
    return readFile(filePath, {
        encoding: 'utf8',
    });
}

/**
 * 下载文件保存到本地
 * @param fileUrl 要下载的文件url
 * @param filePath 保存到本地的文件路径
 * @param headers 请求header
 * @returns
 */
export function downloadFile(fileUrl: string, filePath: string, headers?: HeadersInit): AsyncIOResult<boolean> {
    assertSafeUrl(fileUrl);
    const absPath = getAbsolutePath(filePath);

    return new Promise((resolve) => {
        wx.downloadFile({
            url: fileUrl,
            filePath: absPath,
            header: headers,
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
 * 上传文件
 * @param filePath 本地文件路径
 * @param fileUrl 上传url
 * @param headers 请求header
 * @returns
 */
export async function uploadFile(filePath: string, fileUrl: string, headers?: HeadersInit): AsyncIOResult<boolean> {
    assertSafeUrl(fileUrl);
    const absPath = getAbsolutePath(filePath);

    return new Promise((resolve) => {
        wx.uploadFile({
            url: fileUrl,
            filePath: absPath,
            name: basename(filePath),
            header: headers,
            success(): void {
                resolve(Ok(true));
            },
            fail(err): void {
                resolve(toErr(err));
            },
        });
    });
}