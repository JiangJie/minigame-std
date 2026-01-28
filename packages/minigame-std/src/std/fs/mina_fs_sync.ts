/**
 * @internal
 * 小游戏平台的同步文件系统操作实现。
 */

import { basename, dirname, SEPARATOR } from '@std/path/posix';
import { zipSync as compressSync, unzipSync as decompressSync, type AsyncZippable } from 'fflate/browser';
import { type AppendOptions, type ExistsOptions, type WriteOptions, type ZipOptions } from 'happy-opfs';
import { Ok, RESULT_VOID, tryResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import type { ReadFileContent, ReadOptions, StatOptions, WriteFileContent } from './fs_define.ts';
import { createDirIsFileError, createFileNotExistsError, createNothingToZipError, EMPTY_BYTES, fileErrorToMkdirResult, fileErrorToRemoveResult, fileErrorToResult, getExistsResult, getFs, getReadFileEncoding, getUsrPath, getWriteFileContents, isNotFoundError, normalizeStats, validateAbsolutePath, validateExistsOptions, type ZipIOResult } from './mina_fs_shared.ts';

/**
 * `mkdir` 的同步版本。
 * @param dirPath - 要创建的目录路径。
 * @returns 操作结果。
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    // 根目录无需创建
    if (dirPath === getUsrPath()) {
        return RESULT_VOID;
    }

    const statRes = statSync(dirPath);
    if (statRes.isOk()) {
        // 已存在并且是文件
        if (statRes.unwrap().isFile()) {
            return createDirIsFileError(dirPath);
        }

        // 存在文件夹则不创建
        return RESULT_VOID;
    }

    // 递归创建
    return trySyncOp(() => getFs().mkdirSync(dirPath, true), fileErrorToMkdirResult);
}

/**
 * `move` 的同步版本。
 * @param srcPath - 源路径。
 * @param destPath - 目标路径。
 * @returns 操作结果。
 */
export function moveSync(srcPath: string, destPath: string): VoidIOResult {
    const srcPathRes = validateAbsolutePath(srcPath);
    if (srcPathRes.isErr()) return srcPathRes.asErr();
    srcPath = srcPathRes.unwrap();

    const destPathRes = validateAbsolutePath(destPath);
    if (destPathRes.isErr()) return destPathRes.asErr();
    destPath = destPathRes.unwrap();

    return trySyncOp(() => getFs().renameSync(srcPath, destPath));
}

/**
 * `readDir` 的同步版本。
 * @param dirPath - 要读取的目录路径。
 * @returns 目录中的文件和子目录名称数组。
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    return trySyncOp(() => getFs().readdirSync(dirPath));
}

/**
 * `readFile` 的同步版本。
 * @param filePath - 要读取的文件路径。
 * @param options - 读取选项。
 * @returns 文件内容。
 */
export function readFileSync(filePath: string, options: ReadOptions & {
    encoding: 'utf8';
}): IOResult<string>;
export function readFileSync(filePath: string, options?: ReadOptions & {
    encoding: 'bytes';
}): IOResult<Uint8Array<ArrayBuffer>>;
export function readFileSync(filePath: string, options?: ReadOptions): IOResult<ReadFileContent>;
export function readFileSync(filePath: string, options?: ReadOptions): IOResult<ReadFileContent> {
    const filePathRes = validateAbsolutePath(filePath);
    if (filePathRes.isErr()) return filePathRes.asErr();
    filePath = filePathRes.unwrap();

    const encoding = getReadFileEncoding(options);

    return trySyncOp(() => {
        const data = getFs().readFileSync(filePath, encoding);
        // 小游戏返回的是 ArrayBuffer，需要转换为 Uint8Array
        return typeof data === 'string' ? data : new Uint8Array(data);
    });
}

/**
 * `remove` 的同步版本。
 * @param path - 要删除的文件或目录路径。
 * @returns 操作结果。
 */
export function removeSync(path: string): VoidIOResult {
    const statRes = statSync(path);

    if (statRes.isErr()) {
        // 不存在当做成功
        return isNotFoundError(statRes.unwrapErr()) ? RESULT_VOID : statRes.asErr();
    }

    // statSync 已经校验通过了
    path = validateAbsolutePath(path).unwrap();

    return trySyncOp(() => {
        // 文件夹还是文件
        if (statRes.unwrap().isDirectory()) {
            getFs().rmdirSync(path, true);
        } else {
            getFs().unlinkSync(path);
        }
    }, fileErrorToRemoveResult);
}

/**
 * `stat` 的同步版本。
 * @param path - 文件或目录路径。
 * @param options - 统计选项。
 * @returns 文件或目录的统计信息。
 */
export function statSync(path: string, options?: StatOptions & {
    recursive: false;
}): IOResult<WechatMinigame.Stats>;
export function statSync(path: string, options: StatOptions & {
    recursive: true;
}): IOResult<WechatMinigame.FileStats[]>;
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const pathRes = validateAbsolutePath(path);
    if (pathRes.isErr()) return pathRes.asErr();
    path = pathRes.unwrap();

    const { recursive = false } = options ?? {};

    return trySyncOp(() => getFs().statSync(path, recursive))
        .map(x => normalizeStats(x, recursive));
}

/**
 * `writeFile` 的同步版本。
 * @param filePath - 要写入的文件路径。
 * @param contents - 要写入的内容。
 * @param options - 写入选项。
 * @returns 操作结果。
 */
export function writeFileSync(filePath: string, contents: WriteFileContent, options?: WriteOptions): VoidIOResult {
    // 默认创建
    const { append = false, create = true } = options ?? {};

    const fs = getFs();
    let writeMethod: typeof fs.appendFileSync | typeof fs.writeFileSync = fs.writeFileSync;

    if (append) {
        // append 模式，先检查文件是否存在
        const existsRes = existsSync(filePath);
        if (existsRes.isErr()) return existsRes.asErr();

        if (existsRes.unwrap()) {
            // 文件存在，使用 appendFileSync
            writeMethod = fs.appendFileSync;
        } else {
            // 文件不存在，根据 create 参数决定
            if (!create) {
                return createFileNotExistsError(filePath);
            }
            // create=true 时使用 writeFileSync 创建文件
            writeMethod = fs.writeFileSync;
        }
    }

    // 减少可能的重复校验
    const filePathRes = validateAbsolutePath(filePath);
    if (filePathRes.isErr()) return filePathRes.asErr();
    filePath = filePathRes.unwrap();

    // 使用 writeFileSync 时（文件不存在或非 append 模式）需要创建目录
    if (create && writeMethod === fs.writeFileSync) {
        const result = mkdirSync(dirname(filePath));
        if (result.isErr()) return result;
    }

    const contentsRes = getWriteFileContents(contents);
    if (contentsRes.isErr()) return contentsRes.asErr();

    const { data, encoding } = contentsRes.unwrap();

    return trySyncOp(() => writeMethod(filePath, data, encoding));
}

/**
 * `appendFile` 的同步版本。
 * @param filePath - 文件路径。
 * @param contents - 要追加的内容。
 * @param options - 可选的追加选项。
 * @returns 操作结果。
 */
export function appendFileSync(filePath: string, contents: WriteFileContent, options?: AppendOptions): VoidIOResult {
    return writeFileSync(filePath, contents, {
        append: true,
        create: options?.create ?? true,
    });
}

/**
 * `copy` 的同步版本。
 * @param srcPath - 源路径。
 * @param destPath - 目标路径。
 * @returns 操作结果。
 */
export function copySync(srcPath: string, destPath: string): VoidIOResult {
    const destPathRes = validateAbsolutePath(destPath);
    if (destPathRes.isErr()) return destPathRes.asErr();
    destPath = destPathRes.unwrap();

    const statRes = statSync(srcPath, {
        recursive: true,
    });
    if (statRes.isErr()) return statRes.asErr();

    // statSync 已经校验通过了
    srcPath = validateAbsolutePath(srcPath).unwrap();

    for (const { path, stats } of statRes.unwrap()) {
        let copyRes: VoidIOResult;

        if (!path) {
            // 根目录或者文件
            if (stats.isDirectory()) {
                copyRes = mkdirSync(destPath);
            } else {
                const mkdirRes = mkdirSync(dirname(destPath));
                copyRes = mkdirRes.andThen(() => {
                    return copyFileSync(srcPath, destPath);
                });
            }
        } else {
            // 不能用join
            const srcEntryPath = srcPath + SEPARATOR + path;
            const destEntryPath = destPath + SEPARATOR + path;

            copyRes = (stats.isDirectory()
                ? mkdirSync(destEntryPath)
                // 由于串行执行, 文件的父目录一定先于文件创建, 所以不需要额外 mkdir
                : copyFileSync(srcEntryPath, destEntryPath));
        }

        if (copyRes.isErr()) return copyRes;
    }

    return RESULT_VOID;
}

/**
 * `exists` 的同步版本。
 * @param path - 文件或目录路径。
 * @param options - 检查选项。
 * @returns 是否存在。
 */
export function existsSync(path: string, options?: ExistsOptions): IOResult<boolean> {
    const optionsRes = validateExistsOptions(options);
    if (optionsRes.isErr()) return optionsRes.asErr();

    const statRes = statSync(path);
    return getExistsResult(statRes, options);
}

/**
 * `emptyDir` 的同步版本。
 * @param dirPath - 要清空的目录路径。
 * @returns 操作结果。
 */
export function emptyDirSync(dirPath: string): VoidIOResult {
    const readDirRes = readDirSync(dirPath);
    if (readDirRes.isErr()) {
        // 不存在则创建
        return isNotFoundError(readDirRes.unwrapErr())
            ? mkdirSync(dirPath)
            : readDirRes.asErr();
    }

    // readDirSync 已经校验通过了
    dirPath = validateAbsolutePath(dirPath).unwrap();

    for (const name of readDirRes.unwrap()) {
        const removeRes = removeSync(dirPath + SEPARATOR + name);
        if (removeRes.isErr()) return removeRes.asErr();
    }

    return RESULT_VOID;
}

/**
 * `readTextFile` 的同步版本。
 * @param filePath - 要读取的文件路径。
 * @returns 文件的文本内容。
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return readFileSync(filePath, {
        encoding: 'utf8',
    });
}

/**
 * `readJsonFile` 的同步版本。
 * @param filePath - 要读取的 JSON 文件路径。
 * @returns 解析后的 JSON 对象。
 */
export function readJsonFileSync<T>(filePath: string): IOResult<T> {
    const readFileRes = readTextFileSync(filePath);

    return readFileRes.andThen(contents => {
        return tryResult(JSON.parse, contents);
    });
}

/**
 * `writeJsonFile` 的同步版本。
 * @param filePath - 要写入的文件路径。
 * @param data - 要序列化并写入的数据。
 * @returns 操作结果。
 */
export function writeJsonFileSync<T>(filePath: string, data: T): VoidIOResult {
    const result = tryResult(JSON.stringify, data);

    return result.andThen(text => writeFileSync(filePath, text));
}

/**
 * `unzip` 的同步版本。
 * @param zipFilePath - 要解压的 ZIP 文件路径。
 * @param destDir - 解压目标目录。
 * @returns 操作结果。
 */
export function unzipSync(zipFilePath: string, destDir: string): VoidIOResult {
    const destDirRes = validateAbsolutePath(destDir);
    if (destDirRes.isErr()) return destDirRes.asErr();
    destDir = destDirRes.unwrap();

    const readFileRes = readFileSync(zipFilePath);
    if (readFileRes.isErr()) return readFileRes.asErr();
    const bytes = readFileRes.unwrap();

    const unzippedRes = tryResult(() => decompressSync(bytes));
    if (unzippedRes.isErr()) return unzippedRes.asErr();
    const unzipped = unzippedRes.unwrap();

    for (const path in unzipped) {
        if (path.at(-1) === SEPARATOR) {
            // 文件夹
            const mkdirRes = mkdirSync(destDir + SEPARATOR + path.slice(1));
            if (mkdirRes.isErr()) return mkdirRes.asErr();
        } else {
            const writeFileRes = writeFileSync(destDir + SEPARATOR + path, unzipped[path] as Uint8Array<ArrayBuffer>);
            if (writeFileRes.isErr()) return writeFileRes.asErr();
        }
    }

    return RESULT_VOID;
}

/**
 * `zip` 的同步版本，返回压缩后的字节数组。
 * @param sourcePath - 要压缩的源路径。
 * @param options - 压缩选项。
 * @returns 压缩后的字节数组。
 */
export function zipSync(sourcePath: string, options?: ZipOptions): IOResult<Uint8Array<ArrayBuffer>>;
/**
 * `zip` 的同步版本，将压缩结果写入指定文件。
 * @param sourcePath - 要压缩的源路径。
 * @param zipFilePath - ZIP 文件输出路径。
 * @param options - 压缩选项。
 * @returns 操作结果。
 */
export function zipSync(sourcePath: string, zipFilePath: string, options?: ZipOptions): VoidIOResult;
export function zipSync(sourcePath: string, zipFilePath?: string | ZipOptions, options?: ZipOptions): ZipIOResult {
    if (typeof zipFilePath === 'string') {
        const zipFilePathRes = validateAbsolutePath(zipFilePath);
        if (zipFilePathRes.isErr()) return zipFilePathRes.asErr();
        zipFilePath = zipFilePathRes.unwrap();
    } else {
        options = zipFilePath;
        zipFilePath = undefined;
    }

    const statRes = statSync(sourcePath, {
        recursive: true,
    });
    if (statRes.isErr()) return statRes.asErr();
    const statsArray = statRes.unwrap();

    // statSync 已经校验通过了
    sourcePath = validateAbsolutePath(sourcePath).unwrap();
    const sourceName = basename(sourcePath);

    const zippable: AsyncZippable = {};

    if (statsArray.length === 1 && statsArray[0].stats.isFile()) {
        // sourcePath 是文件
        const readFileRes = readFileSync(sourcePath);
        if (readFileRes.isErr()) return readFileRes;

        zippable[sourceName] = readFileRes.unwrap();
    } else {
        // sourcePath 是目录
        // 默认保留根目录
        const preserveRoot = options?.preserveRoot ?? true;
        if (preserveRoot) {
            // 添加根目录条目
            zippable[sourceName + SEPARATOR] = EMPTY_BYTES;
        }

        for (const { path, stats } of statsArray) {
            // 这里就跳过根目录了
            if (!path) continue;

            const entryName = preserveRoot ? sourceName + SEPARATOR + path : path;

            if (stats.isFile()) {
                // 不能用 join，否则 http://usr 会变成 http:/usr
                const readFileRes = readFileSync(sourcePath + SEPARATOR + path);
                if (readFileRes.isErr()) return readFileRes;

                zippable[entryName] = readFileRes.unwrap();
            } else {
                // 文件夹 - 添加带有尾部斜杠和空内容的条目
                zippable[entryName + SEPARATOR] = EMPTY_BYTES;
            }
        }
    }

    // Nothing to zip - 和标准 zip 命令的行为一致
    if (Object.keys(zippable).length === 0) {
        return createNothingToZipError();
    }

    return tryResult(() => compressSync(zippable))
        .andThen<Uint8Array<ArrayBuffer> | void>(bytesLike => {
            const bytes = bytesLike as Uint8Array<ArrayBuffer>;
            // 有文件路径则写入文件
            return zipFilePath
                ? writeFileSync(zipFilePath, bytes)
                : Ok(bytes);
        });
}

// #region Internal Functions

/**
 * 安全地调用同步接口。
 */
function trySyncOp<T>(op: () => T, errToResult: (err: Error) => IOResult<T> = fileErrorToResult): IOResult<T> {
    return tryResult<T, Error>(op).orElse(errToResult);
}

/**
 * 复制单个文件。
 */
function copyFileSync(srcPath: string, destPath: string): VoidIOResult {
    return trySyncOp(() => getFs().copyFileSync(srcPath, destPath));
}

// #endregion
