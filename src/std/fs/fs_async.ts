import type { FetchTask } from '@happy-ts/fetch-t';
import {
    appendFile as webAppendFile,
    copy as webCopy,
    downloadFile as webDownloadFile,
    emptyDir as webEmptyDir,
    exists as webExists,
    mkdir as webMkdir,
    move as webMove,
    readDir as webReadDir,
    readFile as webReadFile,
    readJsonFile as webReadJsonFile,
    readTextFile as webReadTextFile,
    remove as webRemove,
    stat as webStat,
    unzip as webUnzip,
    unzipFromUrl as webUnzipFromUrl,
    uploadFile as webUploadFile,
    writeFile as webWriteFile,
    zip as webZip,
    zipFromUrl as webZipFromUrl,
    type DownloadFileTempResponse,
    type WriteOptions,
    type ZipOptions,
} from 'happy-opfs';
import { Ok, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { StatOptions, UnionDownloadFileOptions, UnionUploadFileOptions, WriteFileContent, ZipFromUrlOptions } from './fs_define.ts';
import { convertFileSystemHandleToStats } from './fs_helpers.ts';
import {
    appendFile as minaAppendFile,
    copy as minaCopy,
    downloadFile as minaDownloadFile,
    emptyDir as minaEmptyDir,
    exists as minaExists,
    mkdir as minaMkdir,
    move as minaMove,
    readDir as minaReadDir,
    readFile as minaReadFile,
    readJsonFile as minaReadJsonFile,
    readTextFile as minaReadTextFile,
    remove as minaRemove,
    stat as minaStat,
    unzip as minaUnzip,
    unzipFromUrl as minaUnzipFromUrl,
    uploadFile as minaUploadFile,
    writeFile as minaWriteFile,
    zip as minaZip,
    zipFromUrl as minaZipFromUrl,
} from './mina_fs_async.ts';

/**
 * 递归创建文件夹，相当于`mkdir -p`。
 * @param dirPath - 将要创建的目录的路径。
 * @returns 创建成功返回 true 的异步操作结果。
 */
export function mkdir(dirPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaMkdir : webMkdir)(dirPath);
}

/**
 * 重命名文件或目录。
 * @param srcPath - 原始路径。
 * @param destPath - 新路径。
 * @returns 重命名成功返回 true 的异步操作结果。
 */
export function move(srcPath: string, destPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaMove : webMove)(srcPath, destPath);
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

    return (await webReadDir(dirPath)).andThenAsync(async entries => {
        const items: string[] = [];
        for await (const { path } of entries) {
            items.push(path);
        }
        return Ok(items);
    });
}

/**
 * 读取文件内容。
 * @param filePath - 文件的路径。
 * @returns 包含文件内容的 ArrayBuffer 的异步操作结果。
 */
export function readFile(filePath: string): AsyncIOResult<ArrayBuffer> {
    return (isMinaEnv() ? minaReadFile : webReadFile)(filePath);
}

/**
 * 删除文件或目录。
 * @param path - 要删除的文件或目录的路径。
 * @returns 删除成功返回 true 的异步操作结果。
 */
export function remove(path: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaRemove : webRemove)(path);
}

export async function stat(path: string): AsyncIOResult<WechatMinigame.Stats>;
export async function stat(path: string, options: StatOptions & {
    recursive: true;
}): AsyncIOResult<WechatMinigame.FileStats[]>;
export async function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
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

    return (await webStat(path)).andThenAsync(async (handle): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> => {
        const entryStats = await convertFileSystemHandleToStats(handle);

        if (entryStats.isFile() || !options?.recursive) {
            return Ok(entryStats);
        }

        // 递归读取目录
        return (await webReadDir(path)).andThenAsync(async entries => {
            const statsArr: WechatMinigame.FileStats[] = [{
                path,
                stats: entryStats,
            }];

            for await (const { path, handle } of entries) {
                statsArr.push({
                    path,
                    stats: await convertFileSystemHandleToStats(handle),
                });
            }

            return Ok(statsArr);
        });
    });
}

/**
 * 写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @param options - 可选选项。
 * @returns 写入成功返回 true 的异步操作结果。
 */
export function writeFile(filePath: string, contents: WriteFileContent, options?: WriteOptions): AsyncVoidIOResult {
    return (isMinaEnv() ? minaWriteFile : webWriteFile)(filePath, contents, options);
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加成功返回 true 的异步操作结果。
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncVoidIOResult {
    return (isMinaEnv() ? minaAppendFile : webAppendFile)(filePath, contents);
}

/**
 * 复制文件或文件夹。
 *
 * @param srcPath - 源文件或文件夹路径。
 * @param destPath - 目标文件或文件夹路径。
 * @returns 操作的异步结果。
 */
export function copy(srcPath: string, destPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaCopy : webCopy)(srcPath, destPath);
}

/**
 * 检查指定路径的文件或目录是否存在。
 * @param path - 文件或目录的路径。
 * @returns 存在返回 true 的异步操作结果。
 */
export function exists(path: string): AsyncIOResult<boolean> {
    return (isMinaEnv() ? minaExists : webExists)(path);
}

/**
 * 清空指定目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 清空成功返回 true 的异步操作结果。
 */
export function emptyDir(dirPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaEmptyDir : webEmptyDir)(dirPath);
}

/**
 * 读取文件并解析为 JSON。
 * @param filePath - 文件路径。
 * @returns 读取结果。
 */
export function readJsonFile<T>(filePath: string): AsyncIOResult<T> {
    return (isMinaEnv() ? minaReadJsonFile : webReadJsonFile)(filePath);
}

/**
 * 读取文本文件的内容。
 * @param filePath - 文件路径。
 * @returns 包含文件文本内容的异步操作结果。
 */
export function readTextFile(filePath: string): AsyncIOResult<string> {
    return (isMinaEnv() ? minaReadTextFile : webReadTextFile)(filePath);
}

/**
 * 下载文件并保存到临时文件。
 * @param fileUrl - 文件的网络 URL。
 * @param options - 可选参数。
 * @returns 下载操作的异步结果，成功时返回 true。
 */
export function downloadFile(fileUrl: string, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | DownloadFileTempResponse>;
/**
 * 下载文件。
 * @param fileUrl - 文件的网络 URL。
 * @param filePath - 可选的下载后文件存储的路径，没传则存到临时文件。
 * @param options - 可选的请求初始化参数。
 * @returns 下载成功返回原始结果。
 */
export function downloadFile(fileUrl: string, filePath: string, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | Response>;
export function downloadFile(fileUrl: string, filePath?: string | UnionDownloadFileOptions, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | DownloadFileTempResponse | Response> {
    if (typeof filePath === 'string') {
        return isMinaEnv()
            ? minaDownloadFile(fileUrl, filePath, options)
            : webDownloadFile(fileUrl, filePath, options);
    } else {
        return isMinaEnv()
            ? minaDownloadFile(fileUrl, filePath)
            : webDownloadFile(fileUrl, filePath);
    }
}

/**
 * 上传本地文件。
 * @param filePath - 需要上传的文件路径。
 * @param fileUrl - 目标服务器的 URL。
 * @param options - 可选的请求初始化参数。
 * @returns 上传成功返回原始结果。
 */
export function uploadFile(filePath: string, fileUrl: string, options?: UnionUploadFileOptions): FetchTask<WechatMinigame.UploadFileSuccessCallbackResult | Response> {
    return (isMinaEnv() ? minaUploadFile : webUploadFile)(filePath, fileUrl, options);
}

/**
 * 解压 zip 文件。
 * @param zipFilePath - 要解压的 zip 文件路径。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @returns 解压操作的异步结果。
 */
export function unzip(zipFilePath: string, targetPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaUnzip : webUnzip)(zipFilePath, targetPath);
}

/**
 * 从网络下载 zip 文件并解压。
 * @param zipFileUrl - Zip 文件的网络地址。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @param options - 可选的下载参数。
 * @returns 下载并解压操作的异步结果。
 */
export async function unzipFromUrl(zipFileUrl: string, targetPath: string, options?: UnionDownloadFileOptions): AsyncVoidIOResult {
    return (isMinaEnv() ? minaUnzipFromUrl : webUnzipFromUrl)(zipFileUrl, targetPath, options);
}

/**
 * 压缩文件到内存。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export function zip(sourcePath: string, options?: ZipOptions): AsyncIOResult<Uint8Array>;
/**
 * 压缩文件。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩成功的异步结果。
 */
export function zip(sourcePath: string, zipFilePath: string, options?: ZipOptions): AsyncVoidIOResult;
export function zip(sourcePath: string, zipFilePath?: string | ZipOptions, options?: ZipOptions): AsyncVoidIOResult | AsyncIOResult<Uint8Array> {
    if (typeof zipFilePath === 'string') {
        return isMinaEnv()
            ? minaZip(sourcePath, zipFilePath, options)
            : webZip(sourcePath, zipFilePath, options);
    } else {
        return isMinaEnv()
            ? minaZip(sourcePath, zipFilePath)
            : webZip(sourcePath, zipFilePath);
    }
}

/**
 * 下载文件并压缩到内存。
 * @param sourceUrl - 要下载的文件 URL。
 * @param options - 合并的下载和压缩选项。
 */
export function zipFromUrl(sourceUrl: string, options?: ZipFromUrlOptions): AsyncIOResult<Uint8Array>;
/**
 * 下载文件并压缩为 zip 文件。
 * @param sourceUrl - 要下载的文件 URL。
 * @param zipFilePath - 要输出的 zip 文件路径。
 * @param options - 合并的下载和压缩选项。
 */
export function zipFromUrl(sourceUrl: string, zipFilePath: string, options?: ZipFromUrlOptions): AsyncVoidIOResult;
export function zipFromUrl(sourceUrl: string, zipFilePath?: string | ZipFromUrlOptions, options?: ZipFromUrlOptions): AsyncVoidIOResult | AsyncIOResult<Uint8Array> {
    if (typeof zipFilePath === 'string') {
        return isMinaEnv()
            ? minaZipFromUrl(sourceUrl, zipFilePath, options)
            : webZipFromUrl(sourceUrl, zipFilePath, options);
    } else {
        return isMinaEnv()
            ? minaZipFromUrl(sourceUrl, zipFilePath)
            : webZipFromUrl(sourceUrl, zipFilePath);
    }
}