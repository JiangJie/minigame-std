/**
 * @internal
 * 小游戏平台的同步文件系统操作实现。
 */

import { basename, dirname, SEPARATOR } from '@std/path/posix';
import { zipSync as compressSync, unzipSync as decompressSync, type AsyncZippable } from 'fflate/browser';
import { ROOT_DIR, type ExistsOptions, type WriteOptions, type ZipOptions } from 'happy-opfs';
import { Err, RESULT_VOID, tryResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import type { ReadFileContent, ReadOptions, StatOptions, WriteFileContent } from './fs_define.ts';
import { createNothingToZipError, EMPTY_BYTES, fileErrorToMkdirResult, fileErrorToRemoveResult, fileErrorToResult, getExistsResult, getFs, getReadFileEncoding, getWriteFileContents, isNotFoundError, validateAbsolutePath, validateExistsOptions, type ZipIOResult } from './mina_fs_shared.ts';

/**
 * `mkdir` 的同步版本。
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    return trySyncOp(() => getFs().mkdirSync(dirPath, true), fileErrorToMkdirResult);
}

/**
 * `move` 的同步版本。
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
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    return trySyncOp(() => getFs().readdirSync(dirPath));
}

/**
 * `readFile` 的同步版本。
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
 */
export function statSync(path: string): IOResult<WechatMinigame.Stats>;
export function statSync(path: string, options: StatOptions & {
    recursive: true;
}): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>;
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const pathRes = validateAbsolutePath(path);
    if (pathRes.isErr()) return pathRes.asErr();
    path = pathRes.unwrap();

    return trySyncOp(() => getFs().statSync(path, options?.recursive ?? false));
}

/**
 * `writeFile` 的同步版本。
 */
export function writeFileSync(filePath: string, contents: WriteFileContent, options?: WriteOptions): VoidIOResult {
    const filePathRes = validateAbsolutePath(filePath);
    if (filePathRes.isErr()) return filePathRes.asErr();
    filePath = filePathRes.unwrap();

    // 默认创建
    const { append = false, create = true } = options ?? {};

    if (create) {
        const result = mkdirSync(dirname(filePath));
        if (result.isErr()) return result;
    }

    const contentsRes = getWriteFileContents(contents);
    if (contentsRes.isErr()) return contentsRes.asErr();

    const { data, encoding } = contentsRes.unwrap();

    return trySyncOp(() => (append ? getFs().appendFileSync : getFs().writeFileSync)(filePath, data, encoding));
}

/**
 * `appendFile` 的同步版本。
 */
export function appendFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return writeFileSync(filePath, contents, {
        append: true,
    });
}

/**
 * `copy` 的同步版本。
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

    const statsOrFileStats = statRes.unwrap();
    // 目录
    if (Array.isArray(statsOrFileStats)) {
        for (const { path, stats } of statsOrFileStats) {
            // path 是以 `/` 开头的
            // 不能用join
            const srcEntryPath = srcPath + path;
            const destEntryPath = destPath + path;

            const result = (stats.isDirectory()
                ? mkdirSync(destEntryPath)
                : copyFileSync(srcEntryPath, destEntryPath));

            if (result.isErr()) return result;
        }

        return RESULT_VOID;
    } else {
        // 单个目录
        if (statsOrFileStats.isDirectory()) {
            return mkdirSync(destPath);
        }

        // 单个文件
        const mkdirRes = mkdirSync(dirname(destPath));
        return mkdirRes.andThen(() => {
            return copyFileSync(srcPath, destPath);
        });
    }
}

/**
 * `exists` 的同步版本。
 */
export function existsSync(path: string, options?: ExistsOptions): IOResult<boolean> {
    const optionsRes = validateExistsOptions(options);
    if (optionsRes.isErr()) return optionsRes.asErr();

    const statRes = statSync(path);
    return getExistsResult(statRes, options);
}

/**
 * `emptyDir` 的同步版本。
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
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return readFileSync(filePath, {
        encoding: 'utf8',
    });
}

/**
 * `readJsonFile` 的同步版本。
 */
export function readJsonFileSync<T>(filePath: string): IOResult<T> {
    const readFileRes = readTextFileSync(filePath);

    return readFileRes.andThen(contents => {
        return tryResult(JSON.parse, contents);
    });
}

/**
 * `writeJsonFile` 的同步版本。
 */
export function writeJsonFileSync<T>(filePath: string, data: T): VoidIOResult {
    const result = tryResult(JSON.stringify, data);

    return result.andThen(text => writeFileSync(filePath, text));
}

/**
 * `unzip` 的同步版本。
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
 * `zip` 的同步版本。
 */
export function zipSync(sourcePath: string, options?: ZipOptions): IOResult<Uint8Array<ArrayBuffer>>;
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

    const statRes = statSync(sourcePath);
    if (statRes.isErr()) return statRes.asErr();

    // statSync 已经校验通过了
    sourcePath = validateAbsolutePath(sourcePath).unwrap();
    const sourceName = basename(sourcePath);

    const zippable: AsyncZippable = {};

    if (statRes.unwrap().isFile()) {
        // 文件
        const readFileRes = readFileSync(sourcePath);
        if (readFileRes.isErr()) return readFileRes;

        zippable[sourceName] = readFileRes.unwrap();
    } else {
        // 目录
        const statRes = statSync(sourcePath, {
            recursive: true,
        });
        if (statRes.isErr()) return statRes.asErr();
        const statsOrFileStats = statRes.unwrap();

        // 默认保留根目录
        const preserveRoot = options?.preserveRoot ?? true;
        if (preserveRoot) {
            // 添加根目录条目
            zippable[sourceName + SEPARATOR] = EMPTY_BYTES;
        }

        if (Array.isArray(statsOrFileStats)) {
            for (const { path, stats } of statsOrFileStats) {
                // statSync 在 recursive 模式下会包含根目录, 并且 path 以 `/` 开头
                if (path === ROOT_DIR) continue;

                const entryName = preserveRoot ? sourceName + path : path.slice(1);

                if (stats.isFile()) {
                    // 不能用 join，否则 http://usr 会变成 http:/usr
                    const readFileRes = readFileSync(sourcePath + path);
                    if (readFileRes.isErr()) return readFileRes;

                    zippable[entryName] = readFileRes.unwrap();
                } else {
                    // 文件夹 - 添加带有尾部斜杠和空内容的条目
                    zippable[entryName + SEPARATOR] = EMPTY_BYTES;
                }
            }
        }
    }

    // Nothing to zip - 和标准 zip 命令的行为一致
    if (Object.keys(zippable).length === 0) {
        return Err(createNothingToZipError());
    }

    return tryResult(() => compressSync(zippable))
        .andThen(bytes => {
            return writeFileSync(zipFilePath as string, bytes as Uint8Array<ArrayBuffer>);
        });
}

// #region Internal Functions

/**
 * 安全地调用同步接口。
 * @param op - 同步操作。
 * @param errToResult - 错误处理函数。
 * @returns
 */
function trySyncOp<T>(op: () => T, errToResult: (err: WechatMinigame.FileError) => IOResult<T> = fileErrorToResult): IOResult<T> {
    return tryResult<T, WechatMinigame.FileError>(op).orElse(errToResult);
}

function copyFileSync(srcPath: string, destPath: string): VoidIOResult {
    return trySyncOp(() => (getFs().copyFile({
        srcPath,
        destPath,
    })));
}

// #endregion
