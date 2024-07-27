import type { FetchTask } from '@happy-ts/fetch-t';
import {
    appendFile as webAppendFile,
    downloadFile as webDownloadFile,
    emptyDir as webEmptyDir,
    exists as webExists,
    mkdir as webMkdir,
    readDir as webReadDir,
    readFile as webReadFile,
    readTextFile as webReadTextFile,
    remove as webRemove,
    rename as webRename,
    stat as webStat,
    uploadFile as webUploadFile,
    writeFile as webWriteFile,
} from 'happy-opfs';
import { Ok, type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { Stats, UnionDownloadFileOptions, UnionUploadFileOptions, WriteFileContent } from './fs_define.ts';
import {
    appendFile as minaAppendFile,
    downloadFile as minaDownloadFile,
    emptyDir as minaEmptyDir,
    exists as minaExists,
    mkdir as minaMkdir,
    readDir as minaReadDir,
    readFile as minaReadFile,
    readTextFile as minaReadTextFile,
    remove as minaRemove,
    rename as minaRename,
    stat as minaStat,
    uploadFile as minaUploadFile,
    writeFile as minaWriteFile,
} from './mina_fs.ts';

export * from './fs_define.ts';

/**
 * 异步读取指定目录下的所有文件和子目录。
 * @param dirPath - 需要读取的目录路径。
 * @returns 包含目录内容的字符串数组的异步操作结果。
 */
export async function readDir(dirPath: string): AsyncIOResult<string[]> {
    if (isMinaEnv()) {
        return minaReadDir(dirPath);
    }

    const x = await webReadDir(dirPath);
    if (x.isErr()) {
        return x.asErr();
    }
    const items: string[] = [];
    for await (const item of x.unwrap()) {
        items.push(item[0]);
    }
    return Ok(items);
}

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 将要创建的目录的路径。
 * @returns 创建成功返回 true 的异步操作结果。
 */
export function mkdir(dirPath: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaMkdir(dirPath) : webMkdir(dirPath);
}

/**
 * 读取文件内容。
 * @param filePath - 文件的路径。
 * @returns 包含文件内容的 ArrayBuffer 的异步操作结果。
 */
export function readFile(filePath: string): AsyncIOResult<ArrayBuffer> {
    return isMinaEnv() ? minaReadFile(filePath) : webReadFile(filePath);
}

/**
 * 删除文件或目录。
 * @param path - 要删除的文件或目录的路径。
 * @returns 删除成功返回 true 的异步操作结果。
 */
export function remove(path: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaRemove(path) : webRemove(path);
}

/**
 * 重命名文件或目录。
 * @param oldPath - 原始路径。
 * @param newPath - 新路径。
 * @returns 重命名成功返回 true 的异步操作结果。
 */
export function rename(oldPath: string, newPath: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaRename(oldPath, newPath) : webRename(oldPath, newPath);
}

/**
 * 获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @returns 包含状态信息的异步操作结果。
 */
export async function stat(path: string): AsyncIOResult<Stats> {
    if (isMinaEnv()) {
        const res = await minaStat(path);

        if (res.isErr()) {
            return res;
        }

        const stat = res.unwrap();

        return Ok({
            isFile: (): boolean => stat.isFile(),
            isDirectory: (): boolean => stat.isDirectory(),
            size: stat.size,
        });
    }

    const res = await webStat(path);

    if (res.isErr()) {
        return res.asErr();
    }

    const stat = res.unwrap();

    const { kind } = stat;
    const isFile = kind === 'file';
    const isDirectory = kind === 'directory';
    const size = isFile
        ? (await (stat as FileSystemFileHandle).getFile()).size
        : 0;

    return Ok({
        isFile: (): boolean => isFile,
        isDirectory: (): boolean => isDirectory,
        size,
    });
}

/**
 * 写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @returns 写入成功返回 true 的异步操作结果。
 */
export function writeFile(filePath: string, contents: WriteFileContent): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaWriteFile(filePath, contents) : webWriteFile(filePath, contents);
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加成功返回 true 的异步操作结果。
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaAppendFile(filePath, contents) : webAppendFile(filePath, contents);
}

/**
 * 检查指定路径的文件或目录是否存在。
 * @param path - 文件或目录的路径。
 * @returns 存在返回 true 的异步操作结果。
 */
export function exists(path: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaExists(path) : webExists(path);
}

/**
 * 清空指定目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 清空成功返回 true 的异步操作结果。
 */
export function emptyDir(dirPath: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaEmptyDir(dirPath) : webEmptyDir(dirPath);
}

/**
 * 读取文本文件的内容。
 * @param filePath - 文件路径。
 * @returns 包含文件文本内容的异步操作结果。
 */
export function readTextFile(filePath: string): AsyncIOResult<string> {
    return isMinaEnv() ? minaReadTextFile(filePath) : webReadTextFile(filePath);
}

/**
 * 下载文件。
 * @param fileUrl - 文件的网络 URL。
 * @param filePath - 下载后文件存储的路径。
 * @param options - 可选的请求初始化参数。
 * @returns 下载成功返回原始结果。
 */
export function downloadFile(fileUrl: string, filePath: string, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | Response> {
    return isMinaEnv() ? minaDownloadFile(fileUrl, filePath, options) : webDownloadFile(fileUrl, filePath, options);
}

/**
 * 上传本地文件。
 * @param filePath - 需要上传的文件路径。
 * @param fileUrl - 目标服务器的 URL。
 * @param options - 可选的请求初始化参数。
 * @returns 上传成功返回原始结果。
 */
export function uploadFile(filePath: string, fileUrl: string, options?: UnionUploadFileOptions): FetchTask<WechatMinigame.UploadFileSuccessCallbackResult | Response> {
    return isMinaEnv() ? minaUploadFile(filePath, fileUrl, options) : webUploadFile(filePath, fileUrl, options);
}
