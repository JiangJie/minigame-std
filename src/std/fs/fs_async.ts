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
    unzip as webUnzip,
    uploadFile as webUploadFile,
    writeFile as webWriteFile,
    zip as webZip,
    type ZipOptions,
} from 'happy-opfs';
import { Ok, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { StatOptions, UnionDownloadFileOptions, UnionUploadFileOptions, WriteFileContent } from './fs_define.ts';
import { convertFileSystemHandleToStats } from './fs_helpers.ts';
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
    unzip as minaUnzip,
    uploadFile as minaUploadFile,
    writeFile as minaWriteFile,
} from './mina_fs_async.ts';

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 将要创建的目录的路径。
 * @returns 创建成功返回 true 的异步操作结果。
 */
export function mkdir(dirPath: string): AsyncVoidIOResult {
    return isMinaEnv() ? minaMkdir(dirPath) : webMkdir(dirPath);
}

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
    for await (const { path } of x.unwrap()) {
        items.push(path);
    }
    return Ok(items);
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
export function remove(path: string): AsyncVoidIOResult {
    return isMinaEnv() ? minaRemove(path) : webRemove(path);
}

/**
 * 重命名文件或目录。
 * @param oldPath - 原始路径。
 * @param newPath - 新路径。
 * @returns 重命名成功返回 true 的异步操作结果。
 */
export function rename(oldPath: string, newPath: string): AsyncVoidIOResult {
    return isMinaEnv() ? minaRename(oldPath, newPath) : webRename(oldPath, newPath);
}

export async function stat(path: string): AsyncIOResult<WechatMinigame.Stats>;
export async function stat(path: string, options: StatOptions & {
    recursive: true;
}): AsyncIOResult<WechatMinigame.FileStats[]>;
export async function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>
/**
 * 获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @param options - 可选选项。
 * @returns 包含状态信息的异步操作结果。
 */
export async function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    if (isMinaEnv()) {
        return await minaStat(path, options);
    }

    const res = await webStat(path);

    if (res.isErr()) {
        return res.asErr();
    }

    const entryStats = await convertFileSystemHandleToStats(res.unwrap());

    if (entryStats.isFile() || !options?.recursive) {
        return Ok(entryStats);
    }

    // 递归读取目录
    const readRes = await webReadDir(path);

    if (readRes.isErr()) {
        return readRes.asErr();
    }

    const statsArr: WechatMinigame.FileStats[] = [{
        path,
        stats: entryStats,
    }];

    for await (const { path, handle } of readRes.unwrap()) {
        statsArr.push({
            path,
            stats: await convertFileSystemHandleToStats(handle),
        })
    }

    return Ok(statsArr);
}

/**
 * 写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @returns 写入成功返回 true 的异步操作结果。
 */
export function writeFile(filePath: string, contents: WriteFileContent): AsyncVoidIOResult {
    return isMinaEnv() ? minaWriteFile(filePath, contents) : webWriteFile(filePath, contents);
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加成功返回 true 的异步操作结果。
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncVoidIOResult {
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
export function emptyDir(dirPath: string): AsyncVoidIOResult {
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

/**
 * 解压 zip 文件。
 * @param zipFilePath - 要解压的 zip 文件路径。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @returns 解压操作的异步结果。
 */
export function unzip(zipFilePath: string, targetPath: string): AsyncVoidIOResult {
    return isMinaEnv() ? minaUnzip(zipFilePath, targetPath) : webUnzip(zipFilePath, targetPath);
}

/**
 * 压缩文件。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export function zip(sourcePath: string, zipFilePath: string, options?: ZipOptions): AsyncVoidIOResult {
    if (isMinaEnv()) {
        throw new Error('Not supported.');
    }

    return webZip(sourcePath, zipFilePath, options);
}