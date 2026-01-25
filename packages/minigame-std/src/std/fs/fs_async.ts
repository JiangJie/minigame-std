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
    writeJsonFile as webWriteJsonFile,
    zip as webZip,
    zipFromUrl as webZipFromUrl,
    type DownloadFileTempResponse,
    type WriteOptions,
    type ZipOptions,
} from 'happy-opfs';
import { Ok, tryAsyncResult, type AsyncIOResult, type AsyncVoidIOResult } from 'happy-rusty';
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
    writeJsonFile as minaWriteJsonFile,
    zip as minaZip,
    zipFromUrl as minaZipFromUrl,
} from './mina_fs_async.ts';

/**
 * 递归创建文件夹，相当于 `mkdir -p`。
 * @param dirPath - 将要创建的目录的路径。
 * @returns 创建成功返回的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await mkdir('/path/to/dir');
 * if (result.isOk()) {
 *     console.log('目录创建成功');
 * }
 * ```
 */
export function mkdir(dirPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaMkdir : webMkdir)(dirPath);
}

/**
 * 移动或重命名文件或目录。
 * @param srcPath - 原始路径。
 * @param destPath - 新路径。
 * @returns 操作成功返回的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await move('/old/path', '/new/path');
 * if (result.isOk()) {
 *     console.log('移动成功');
 * }
 * ```
 */
export function move(srcPath: string, destPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaMove : webMove)(srcPath, destPath);
}

/**
 * 异步读取指定目录下的所有文件和子目录。
 * @param dirPath - 需要读取的目录路径。
 * @returns 包含目录内容的字符串数组的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await readDir('/path/to/dir');
 * if (result.isOk()) {
 *     console.log(result.unwrap()); // ['file1.txt', 'file2.txt', 'subdir']
 * }
 * ```
 */
export async function readDir(dirPath: string): AsyncIOResult<string[]> {
    return (isMinaEnv() ? minaReadDir : webToMinaReadDir)(dirPath);
}

/**
 * 读取文件内容。
 * @param filePath - 文件的路径。
 * @returns 包含文件内容的 Uint8Array<ArrayBuffer> 的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await readFile('/path/to/file.txt');
 * if (result.isOk()) {
 *     const bytes = result.unwrap();
 *     console.log(decodeUtf8(bytes));
 * }
 * ```
 */
export function readFile(filePath: string): AsyncIOResult<Uint8Array<ArrayBuffer>> {
    return (isMinaEnv() ? minaReadFile : webReadFile)(filePath);
}

/**
 * 删除文件或目录。
 * @param path - 要删除的文件或目录的路径。
 * @returns 删除成功返回的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await remove('/path/to/file.txt');
 * if (result.isOk()) {
 *     console.log('删除成功');
 * }
 * ```
 */
export function remove(path: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaRemove : webRemove)(path);
}

export function stat(path: string, options?: StatOptions & {
    recursive: false;
}): AsyncIOResult<WechatMinigame.Stats>;
export function stat(path: string, options: StatOptions & {
    recursive: true;
}): AsyncIOResult<WechatMinigame.FileStats[]>;
export function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
/**
 * 获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @param options - 可选选项，包含 recursive 可递归获取目录下所有文件状态。
 * @returns 包含状态信息的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await stat('/path/to/file.txt');
 * if (result.isOk()) {
 *     const stats = result.unwrap();
 *     console.log(stats.isFile()); // true
 * }
 * ```
 */
export async function stat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    return (isMinaEnv() ? minaStat : webToMinaStat)(path, options);
}

/**
 * 写入文件，文件不存在则创建，同时创建对应目录。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容，支持 ArrayBuffer 和 string（需确保是 UTF-8 编码）。
 * @param options - 可选写入选项。
 * @returns 写入成功返回的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await writeFile('/path/to/file.txt', 'Hello, World!');
 * if (result.isOk()) {
 *     console.log('写入成功');
 * }
 * ```
 */
export function writeFile(filePath: string, contents: WriteFileContent, options?: WriteOptions): AsyncVoidIOResult {
    return (isMinaEnv() ? minaWriteFile : webWriteFile)(filePath, contents, options);
}

/**
 * 向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加成功返回的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await appendFile('/path/to/file.txt', '\nNew content');
 * if (result.isOk()) {
 *     console.log('追加成功');
 * }
 * ```
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncVoidIOResult {
    return (isMinaEnv() ? minaAppendFile : webAppendFile)(filePath, contents);
}

/**
 * 复制文件或文件夹。
 * @param srcPath - 源文件或文件夹路径。
 * @param destPath - 目标文件或文件夹路径。
 * @returns 操作的异步结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await copy('/src/file.txt', '/dest/file.txt');
 * if (result.isOk()) {
 *     console.log('复制成功');
 * }
 * ```
 */
export function copy(srcPath: string, destPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaCopy : webCopy)(srcPath, destPath);
}

/**
 * 检查指定路径的文件或目录是否存在。
 * @param path - 文件或目录的路径。
 * @returns 存在返回 true 的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await exists('/path/to/file.txt');
 * if (result.isOk() && result.unwrap()) {
 *     console.log('文件存在');
 * }
 * ```
 */
export function exists(path: string): AsyncIOResult<boolean> {
    return (isMinaEnv() ? minaExists : webExists)(path);
}

/**
 * 清空指定目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 清空成功返回的异步操作结果。
 * @since 1.0.1
 * @example
 * ```ts
 * const result = await emptyDir('/path/to/dir');
 * if (result.isOk()) {
 *     console.log('目录已清空');
 * }
 * ```
 */
export function emptyDir(dirPath: string): AsyncVoidIOResult {
    return (isMinaEnv() ? minaEmptyDir : webEmptyDir)(dirPath);
}

/**
 * 读取 JSON 文件并解析为对象。
 * @typeParam T - JSON 解析后的类型。
 * @param filePath - 文件路径。
 * @returns 解析后的对象。
 * @since 1.6.0
 * @example
 * ```ts
 * const result = await readJsonFile<{ name: string }>('/path/to/config.json');
 * if (result.isOk()) {
 *     console.log(result.unwrap().name);
 * }
 * ```
 */
export function readJsonFile<T>(filePath: string): AsyncIOResult<T> {
    return (isMinaEnv() ? minaReadJsonFile : webReadJsonFile)(filePath);
}

/**
 * 读取文本文件的内容。
 * @param filePath - 文件路径。
 * @returns 包含文件文本内容的异步操作结果。
 * @since 1.0.0
 * @example
 * ```ts
 * const result = await readTextFile('/path/to/file.txt');
 * if (result.isOk()) {
 *     console.log(result.unwrap());
 * }
 * ```
 */
export function readTextFile(filePath: string): AsyncIOResult<string> {
    return (isMinaEnv() ? minaReadTextFile : webReadTextFile)(filePath);
}

/**
 * 将数据序列化为 JSON 并写入文件。
 * @typeParam T - 要写入数据的类型。
 * @param filePath - 文件路径。
 * @param data - 要写入的数据。
 * @returns 写入操作的异步结果。
 * @example
 * ```ts
 * const result = await writeJsonFile('/path/to/config.json', { name: 'test' });
 * if (result.isOk()) {
 *     console.log('写入成功');
 * }
 * ```
 */
export function writeJsonFile<T>(filePath: string, data: T): AsyncVoidIOResult {
    return (isMinaEnv() ? minaWriteJsonFile : webWriteJsonFile)(filePath, data);
}

/**
 * 下载文件并保存到临时文件。
 * @param fileUrl - 文件的网络 URL。
 * @param options - 可选的下载参数。
 * @returns 下载操作的 FetchTask，可用于取消或监听进度。
 * @since 1.0.0
 * @example
 * ```ts
 * const task = downloadFile('https://example.com/file.zip');
 * const result = await task.result;
 * if (result.isOk()) {
 *     console.log('下载完成:', result.unwrap().tempFilePath);
 * }
 * ```
 */
export function downloadFile(fileUrl: string, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | DownloadFileTempResponse>;
/**
 * 下载文件并保存到指定路径。
 * @param fileUrl - 文件的网络 URL。
 * @param filePath - 下载后文件存储的路径。
 * @param options - 可选的请求初始化参数。
 * @returns 下载操作的 FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * const task = downloadFile('https://example.com/file.zip', '/path/to/save.zip');
 * const result = await task.result;
 * if (result.isOk()) {
 *     console.log('下载完成');
 * }
 * ```
 */
export function downloadFile(fileUrl: string, filePath: string, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | Response>;
export function downloadFile(fileUrl: string, filePath?: string | UnionDownloadFileOptions, options?: UnionDownloadFileOptions): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | DownloadFileTempResponse | Response> {
    if (typeof filePath === 'string') {
        return (isMinaEnv()
            ? minaDownloadFile(fileUrl, filePath, options)
            : webDownloadFile(fileUrl, filePath, options)) as FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | Response>;
    } else {
        return (isMinaEnv()
            ? minaDownloadFile(fileUrl, filePath)
            : webDownloadFile(fileUrl, filePath)) as FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | DownloadFileTempResponse>;
    }
}

/**
 * 上传本地文件到服务器。
 * @param filePath - 需要上传的文件路径。
 * @param fileUrl - 目标服务器的 URL。
 * @param options - 可选的请求初始化参数。
 * @returns 上传操作的 FetchTask。
 * @since 1.0.0
 * @example
 * ```ts
 * const task = uploadFile('/path/to/file.txt', 'https://example.com/upload');
 * const result = await task.result;
 * if (result.isOk()) {
 *     console.log('上传成功');
 * }
 * ```
 */
export function uploadFile(filePath: string, fileUrl: string, options?: UnionUploadFileOptions): FetchTask<WechatMinigame.UploadFileSuccessCallbackResult | Response> {
    return (isMinaEnv()
        ? minaUploadFile(filePath, fileUrl, options)
        : webUploadFile(filePath, fileUrl, options)) as FetchTask<WechatMinigame.UploadFileSuccessCallbackResult | Response>;
}

/**
 * 解压 zip 文件。
 * @param zipFilePath - 要解压的 zip 文件路径。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @returns 解压操作的异步结果。
 * @since 1.3.0
 * @example
 * ```ts
 * const result = await unzip('/path/to/archive.zip', '/path/to/output');
 * if (result.isOk()) {
 *     console.log('解压成功');
 * }
 * ```
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
 * @since 1.4.0
 * @example
 * ```ts
 * const result = await unzipFromUrl('https://example.com/archive.zip', '/path/to/output');
 * if (result.isOk()) {
 *     console.log('下载并解压成功');
 * }
 * ```
 */
export function unzipFromUrl(zipFileUrl: string, targetPath: string, options?: UnionDownloadFileOptions): AsyncVoidIOResult {
    return (isMinaEnv() ? minaUnzipFromUrl : webUnzipFromUrl)(zipFileUrl, targetPath, options);
}

/**
 * 压缩文件或文件夹到内存。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩后的 Uint8Array。
 * @since 1.3.0
 * @example
 * ```ts
 * const result = await zip('/path/to/source');
 * if (result.isOk()) {
 *     console.log('压缩成功:', result.unwrap().length, 'bytes');
 * }
 * ```
 */
export function zip(sourcePath: string, options?: ZipOptions): AsyncIOResult<Uint8Array>;
/**
 * 压缩文件或文件夹并保存到指定路径。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩操作的异步结果。
 * @since 1.3.0
 * @example
 * ```ts
 * const result = await zip('/path/to/source', '/path/to/archive.zip');
 * if (result.isOk()) {
 *     console.log('压缩成功');
 * }
 * ```
 */
export function zip(sourcePath: string, zipFilePath: string, options?: ZipOptions): AsyncVoidIOResult;
export function zip(sourcePath: string, zipFilePath?: string | ZipOptions, options?: ZipOptions): AsyncVoidIOResult | AsyncIOResult<Uint8Array> {
    if (typeof zipFilePath === 'string') {
        return (isMinaEnv() ? minaZip : webZip)(sourcePath, zipFilePath, options);
    } else {
        return (isMinaEnv() ? minaZip : webZip)(sourcePath, zipFilePath);
    }
}

/**
 * 下载文件并压缩到内存。
 * @param sourceUrl - 要下载的文件 URL。
 * @param options - 合并的下载和压缩选项。
 * @returns 压缩后的 Uint8Array。
 * @since 1.4.0
 * @example
 * ```ts
 * const result = await zipFromUrl('https://example.com/file.txt');
 * if (result.isOk()) {
 *     console.log('下载并压缩成功');
 * }
 * ```
 */
export function zipFromUrl(sourceUrl: string, options?: ZipFromUrlOptions): AsyncIOResult<Uint8Array>;
/**
 * 下载文件并压缩为 zip 文件。
 * @param sourceUrl - 要下载的文件 URL。
 * @param zipFilePath - 要输出的 zip 文件路径。
 * @param options - 合并的下载和压缩选项。
 * @returns 操作的异步结果。
 * @since 1.4.0
 * @example
 * ```ts
 * const result = await zipFromUrl('https://example.com/file.txt', '/path/to/archive.zip');
 * if (result.isOk()) {
 *     console.log('下载并压缩成功');
 * }
 * ```
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

// #region Internal Functions

/**
 * 将 Web 端的读取目录结果转换为小游戏端的读取目录结果。
 */
async function webToMinaReadDir(dirPath: string): AsyncIOResult<string[]> {
    // 小游戏不支持 recursive 选项
    const readDirRes = await webReadDir(dirPath);
    return readDirRes.andTryAsync(async entries => {
        if (typeof Array.fromAsync === 'function') {
            return Array.fromAsync(entries, ({ path }) => path);
        }

        const items: string[] = [];
        for await (const { path } of entries) {
            items.push(path);
        }
        return items;
    });
}

/**
 * 将 Web 端的 stat 结果转换为小游戏端的 stat 结果。
 */
async function webToMinaStat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const statRes = await webStat(path);
    if (statRes.isErr()) return statRes.asErr();

    const handle = statRes.unwrap();

    const entryStatsRes = await tryAsyncResult(convertFileSystemHandleToStats(handle));
    if (entryStatsRes.isErr()) return entryStatsRes;

    // 非递归模式直接返回
    if (!options?.recursive) {
        return entryStatsRes;
    }

    const entryStats = entryStatsRes.unwrap();
    if (entryStats.isFile()) {
        return Ok([{
            path: '', // 当前文件本身的相对路径
            stats: entryStats,
        }]);
    }

    // 递归读取目录
    const readDirRes = await webReadDir(path);
    return readDirRes.andTryAsync(async entries => {
        // 只要是 recursive 模式下的目录, 就返回数组(即使空目录)
        const tasks = [Promise.resolve({
            path: '', // 当前文件夹本身的相对路径
            stats: entryStats,
        })];

        for await (const { path, handle } of entries) {
            tasks.push((async () => {
                const stats = await convertFileSystemHandleToStats(handle);
                return {
                    path,
                    stats,
                };
            })());
        }

        return Promise.all(tasks);
    });
}

// #endregion
