import { basename, dirname } from '@std/path/posix';
import { NOT_FOUND_ERROR, assertAbsolutePath, type ExistsOptions, type WriteOptions } from 'happy-opfs';
import { Err, Ok, type AsyncIOResult } from 'happy-rusty';
import { assertSafeUrl } from '../assert/assertions.ts';
import { type ReadFileContent, type ReadOptions, type WriteFileContent } from './fs_define.ts';

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
    assertAbsolutePath(path);
    return getRootPath() + path;
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

                resolve(Err(new Error(err.errMsg)));
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
                resolve(Err(new Error(err.errMsg)));
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

    return new Promise((resolve) => {
        getFs().readFile({
            filePath: absPath,
            encoding: options?.encoding ?? 'binary',
            success(res): void {
                resolve(Ok(res.data as T));
            },
            fail(err): void {
                resolve(Err(new Error(err.errMsg)));
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
                    resolve(Err(new Error(err.errMsg)));
                },
            });
        } else {
            getFs().unlink({
                filePath: absPath,
                success(): void {
                    resolve(Ok(true));
                },
                fail(err): void {
                    resolve(Err(new Error(err.errMsg)));
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
                resolve(Err(new Error(err.errMsg)));
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
                const error = new Error(err.errMsg);

                // 1300002	no such file or directory ${path}
                // 可能没有errCode
                if (err.errCode === 1300002 || err.errMsg.includes('no such file or directory')) {
                    error.name = NOT_FOUND_ERROR;
                }

                resolve(Err(error));
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
                resolve(Err(new Error(err.errMsg)));
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
                resolve(Err(new Error(err.errMsg)));
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
                resolve(Err(new Error(err.errMsg)));
            },
        });
    });
}