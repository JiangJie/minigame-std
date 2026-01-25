import {
    appendFileSync as webAppendFileSync,
    copySync as webCopySync,
    emptyDirSync as webEmptyDirSync,
    existsSync as webExistsSync,
    mkdirSync as webMkdirSync,
    moveSync as webMoveSync,
    readDirSync as webReadDirSync,
    readFileSync as webReadFileSync,
    readJsonFileSync as webReadJsonFileSync,
    readTextFileSync as webReadTextFileSync,
    removeSync as webRemoveSync,
    statSync as webStatSync,
    unzipSync as webUnzipSync,
    writeFileSync as webWriteFileSync,
    writeJsonFileSync as webWriteJsonFileSync,
    zipSync as webZipSync,
    type ZipOptions,
} from 'happy-opfs';
import { Ok, type IOResult, type VoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { StatOptions, WriteFileContent } from './fs_define.ts';
import { convertFileSystemHandleLikeToStats } from './fs_helpers.ts';
import {
    appendFileSync as minaAppendFileSync,
    copySync as minaCopySync,
    emptyDirSync as minaEmptyDirSync,
    existsSync as minaExistsSync,
    mkdirSync as minaMkdirSync,
    moveSync as minaMoveSync,
    readDirSync as minaReadDirSync,
    readFileSync as minaReadFileSync,
    readJsonFileSync as minaReadJsonFileSync,
    readTextFileSync as minaReadTextFileSync,
    removeSync as minaRemoveSync,
    statSync as minaStatSync,
    unzipSync as minaUnzipSync,
    writeFileSync as minaWriteFileSync,
    writeJsonFileSync as minaWriteJsonFileSync,
    zipSync as minaZipSync,
} from './mina_fs_sync.ts';

/**
 * `mkdir` 的同步版本，递归创建文件夹。
 * @param dirPath - 将要创建的目录的路径。
 * @returns 创建成功返回的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = mkdirSync('/path/to/dir');
 * if (result.isOk()) {
 *     console.log('目录创建成功');
 * }
 * ```
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    return (isMinaEnv() ? minaMkdirSync : webMkdirSync)(dirPath);
}

/**
 * `move` 的同步版本，移动或重命名文件或目录。
 * @param srcPath - 原始路径。
 * @param destPath - 新路径。
 * @returns 操作成功返回的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = moveSync('/old/path', '/new/path');
 * if (result.isOk()) {
 *     console.log('移动成功');
 * }
 * ```
 */
export function moveSync(srcPath: string, destPath: string): VoidIOResult {
    return (isMinaEnv() ? minaMoveSync : webMoveSync)(srcPath, destPath);
}

/**
 * `readDir` 的同步版本，读取指定目录下的所有文件和子目录。
 * @param dirPath - 需要读取的目录路径。
 * @returns 包含目录内容的字符串数组的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = readDirSync('/path/to/dir');
 * if (result.isOk()) {
 *     console.log(result.unwrap()); // ['file1.txt', 'file2.txt']
 * }
 * ```
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    return (isMinaEnv() ? minaReadDirSync : webToMinaReadDirSync)(dirPath);
}

/**
 * `readFile` 的同步版本，读取文件内容。
 * @param filePath - 文件的路径。
 * @returns 包含文件内容的 Uint8Array<ArrayBuffer> 的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = readFileSync('/path/to/file.txt');
 * if (result.isOk()) {
 *     const bytes = result.unwrap();
 *     console.log(decodeUtf8(bytes));
 * }
 * ```
 */
export function readFileSync(filePath: string): IOResult<Uint8Array<ArrayBuffer>> {
    return (isMinaEnv() ? minaReadFileSync : webReadFileSync)(filePath);
}

/**
 * `remove` 的同步版本，删除文件或目录。
 * @param path - 要删除的文件或目录的路径。
 * @returns 删除成功返回的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = removeSync('/path/to/file.txt');
 * if (result.isOk()) {
 *     console.log('删除成功');
 * }
 * ```
 */
export function removeSync(path: string): VoidIOResult {
    return (isMinaEnv() ? minaRemoveSync : webRemoveSync)(path);
}

/**
 * `stat` 的同步版本，获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @returns 包含状态信息的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = statSync('/path/to/file.txt');
 * if (result.isOk()) {
 *     console.log(result.unwrap().isFile()); // true
 * }
 * ```
 */
export function statSync(path: string): IOResult<WechatMinigame.Stats>;
/**
 * `stat` 的同步版本，递归获取目录下所有文件和子目录的状态信息。
 * @param path - 目录的路径。
 * @param options - 选项，recursive 设置为 true 时递归获取。
 * @returns 包含目录下所有文件状态信息数组的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = statSync('/path/to/dir', { recursive: true });
 * if (result.isOk()) {
 *     result.unwrap().forEach(item => {
 *         console.log(item.path, item.stats.isDirectory());
 *     });
 * }
 * ```
 */
export function statSync(path: string, options: StatOptions & {
    recursive: true;
}): IOResult<WechatMinigame.FileStats[]>;
/**
 * `stat` 的同步版本，获取文件或目录的状态信息。
 * @param path - 文件或目录的路径。
 * @param options - 可选选项，包含 recursive 可递归获取目录下所有文件状态。
 * @returns 包含状态信息的操作结果，根据 options.recursive 返回单个 Stats 或 FileStats 数组。
 * @since 1.1.0
 */
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    return (isMinaEnv() ? minaStatSync : webToMinaStatSync)(path, options);
}

/**
 * `writeFile` 的同步版本，写入文件。
 * @param filePath - 文件路径。
 * @param contents - 要写入的内容。
 * @returns 写入成功返回的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = writeFileSync('/path/to/file.txt', 'Hello, World!');
 * if (result.isOk()) {
 *     console.log('写入成功');
 * }
 * ```
 */
export function writeFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return (isMinaEnv() ? minaWriteFileSync : webWriteFileSync)(filePath, contents);
}

/**
 * `copy` 的同步版本，复制文件或文件夹。
 * @param srcPath - 源文件或文件夹路径。
 * @param destPath - 目标文件或文件夹路径。
 * @returns 操作的结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = copySync('/src/file.txt', '/dest/file.txt');
 * if (result.isOk()) {
 *     console.log('复制成功');
 * }
 * ```
 */
export function copySync(srcPath: string, destPath: string): VoidIOResult {
    return (isMinaEnv() ? minaCopySync : webCopySync)(srcPath, destPath);
}

/**
 * `appendFile` 的同步版本，向文件追加内容。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @returns 追加成功返回的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = appendFileSync('/path/to/file.txt', '\nNew content');
 * if (result.isOk()) {
 *     console.log('追加成功');
 * }
 * ```
 */
export function appendFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return (isMinaEnv() ? minaAppendFileSync : webAppendFileSync)(filePath, contents);
}

/**
 * `exists` 的同步版本，检查指定路径的文件或目录是否存在。
 * @param path - 文件或目录的路径。
 * @returns 存在返回 true 的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = existsSync('/path/to/file.txt');
 * if (result.isOk() && result.unwrap()) {
 *     console.log('文件存在');
 * }
 * ```
 */
export function existsSync(path: string): IOResult<boolean> {
    return (isMinaEnv() ? minaExistsSync : webExistsSync)(path);
}

/**
 * `emptyDir` 的同步版本，清空指定目录下的所有文件和子目录。
 * @param dirPath - 目录路径。
 * @returns 清空成功返回的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = emptyDirSync('/path/to/dir');
 * if (result.isOk()) {
 *     console.log('目录已清空');
 * }
 * ```
 */
export function emptyDirSync(dirPath: string): VoidIOResult {
    return (isMinaEnv() ? minaEmptyDirSync : webEmptyDirSync)(dirPath);
}

/**
 * `readJsonFile` 的同步版本，读取 JSON 文件并解析为对象。
 * @typeParam T - JSON 解析后的类型。
 * @param filePath - 文件路径。
 * @returns 解析后的对象。
 * @since 1.6.0
 * @example
 * ```ts
 * const result = readJsonFileSync<{ name: string }>('/path/to/config.json');
 * if (result.isOk()) {
 *     console.log(result.unwrap().name);
 * }
 * ```
 */
export function readJsonFileSync<T>(filePath: string): IOResult<T> {
    return (isMinaEnv() ? minaReadJsonFileSync : webReadJsonFileSync)(filePath);
}

/**
 * `readTextFile` 的同步版本，读取文本文件的内容。
 * @param filePath - 文件路径。
 * @returns 包含文件文本内容的操作结果。
 * @since 1.1.0
 * @example
 * ```ts
 * const result = readTextFileSync('/path/to/file.txt');
 * if (result.isOk()) {
 *     console.log(result.unwrap());
 * }
 * ```
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return (isMinaEnv() ? minaReadTextFileSync : webReadTextFileSync)(filePath);
}

/**
 * `writeJsonFile` 的同步版本，将数据序列化为 JSON 并写入文件。
 * @typeParam T - 要写入数据的类型。
 * @param filePath - 文件路径。
 * @param data - 要写入的数据。
 * @returns 写入操作的结果。
 * @example
 * ```ts
 * const result = writeJsonFileSync('/path/to/config.json', { name: 'test' });
 * if (result.isOk()) {
 *     console.log('写入成功');
 * }
 * ```
 */
export function writeJsonFileSync<T>(filePath: string, data: T): VoidIOResult {
    return (isMinaEnv() ? minaWriteJsonFileSync : webWriteJsonFileSync)(filePath, data);
}

/**
 * `unzip` 的同步版本，解压 zip 文件。
 * @param zipFilePath - 要解压的 zip 文件路径。
 * @param targetPath - 要解压到的目标文件夹路径。
 * @returns 解压操作的结果。
 * @since 1.3.0
 * @example
 * ```ts
 * const result = unzipSync('/path/to/archive.zip', '/path/to/output');
 * if (result.isOk()) {
 *     console.log('解压成功');
 * }
 * ```
 */
export function unzipSync(zipFilePath: string, targetPath: string): VoidIOResult {
    return (isMinaEnv() ? minaUnzipSync : webUnzipSync)(zipFilePath, targetPath);
}

/**
 * `zip` 的同步版本，压缩文件或文件夹。
 * @param sourcePath - 需要压缩的文件（夹）路径。
 * @param zipFilePath - 压缩后的 zip 文件路径。
 * @param options - 可选的压缩参数。
 * @returns 压缩操作的结果。
 * @since 1.3.0
 * @example
 * ```ts
 * const result = zipSync('/path/to/source', '/path/to/archive.zip');
 * if (result.isOk()) {
 *     console.log('压缩成功');
 * }
 * ```
 */
export function zipSync(sourcePath: string, zipFilePath: string, options?: ZipOptions): VoidIOResult {
    return (isMinaEnv() ? minaZipSync : webZipSync)(sourcePath, zipFilePath, options);
}

// #region Internal Functions

/**
 * 将 Web 端的读取目录结果转换为小游戏端的读取目录结果。
 */
function webToMinaReadDirSync(dirPath: string): IOResult<string[]> {
    // 小游戏不支持 recursive 选项
    const readDirRes = webReadDirSync(dirPath);
    return readDirRes.map(entries => {
        return entries.map(({ path }) => path);
    });
}

/**
 * 将 Web 端的 stat 结果转换为小游戏端的 stat 结果。
 */
function webToMinaStatSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const statRes = webStatSync(path);
    if (statRes.isErr()) return statRes.asErr();

    const handleLike = statRes.unwrap();

    const entryStats = convertFileSystemHandleLikeToStats(handleLike);
    if (entryStats.isFile() || !options?.recursive) {
        return Ok(entryStats);
    }

    // 递归读取目录
    const readDirRes = webReadDirSync(path);
    return readDirRes.map(entries => {
        const statsArr = entries.map(({ path, handle }) => ({
            path,
            stats: convertFileSystemHandleLikeToStats(handle),
        }));

        statsArr.unshift({
            path,
            stats: entryStats,
        });

        return statsArr;
    });
}

// #endregion
