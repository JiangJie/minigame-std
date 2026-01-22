/**
 * @internal
 * 小游戏平台的同步文件系统操作实现。
 */

import { basename, dirname, join, SEPARATOR } from '@std/path/posix';
import { zipSync as compressSync, unzipSync as decompressSync, type AsyncZippable, type FlateError } from 'fflate/browser';
import { type ExistsOptions, type WriteOptions, type ZipOptions } from 'happy-opfs';
import { Err, RESULT_VOID, tryResult, type IOResult, type VoidIOResult } from 'happy-rusty';
import type { ReadFileContent, ReadOptions, StatOptions, WriteFileContent } from './fs_define.ts';
import { errToMkdirResult, errToRemoveResult, fileErrorToResult, getExistsResult, getFs, getReadFileEncoding, getWriteFileContents, isNotFoundError, validateAbsolutePath, validateExistsOptions } from './mina_fs_shared.ts';

/**
 * `mkdir` 的同步版本。
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    const dirPathRes = validateAbsolutePath(dirPath);
    if (dirPathRes.isErr()) return dirPathRes.asErr();
    dirPath = dirPathRes.unwrap();

    return trySyncOp(() => getFs().mkdirSync(dirPath, true), errToMkdirResult);
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
    const pathRes = validateAbsolutePath(path);
    if (pathRes.isErr()) return pathRes.asErr();
    path = pathRes.unwrap();

    const statRes = statSync(path);

    if (statRes.isErr()) {
        // 不存在当做成功
        return isNotFoundError(statRes.unwrapErr()) ? RESULT_VOID : statRes.asErr();
    }

    return trySyncOp(() => {
        // 文件夹还是文件
        if (statRes.unwrap().isDirectory()) {
            getFs().rmdirSync(path, true);
        } else {
            getFs().unlinkSync(path);
        }
    }, errToRemoveResult);
}

/**
 * `stat` 的同步版本。
 */
export function statSync(path: string): IOResult<WechatMinigame.Stats>;
export function statSync(path: string, options: StatOptions & {
    recursive: true;
}): IOResult<WechatMinigame.FileStats[]>;
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

    const { data, encoding } = getWriteFileContents(contents);

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
    const srcPathRes = validateAbsolutePath(srcPath);
    if (srcPathRes.isErr()) return srcPathRes.asErr();
    srcPath = srcPathRes.unwrap();

    const destPathRes = validateAbsolutePath(destPath);
    if (destPathRes.isErr()) return destPathRes.asErr();
    destPath = destPathRes.unwrap();

    return statSync(srcPath, {
        recursive: true,
    }).andThen(statsArray => {
        // 目录
        if (Array.isArray(statsArray)) {
            for (const { path, stats } of statsArray) {
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
            // 文件
            return copyFileSync(srcPath, destPath);
        }
    });
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
        return isNotFoundError(readDirRes.unwrapErr()) ? mkdirSync(dirPath) : readDirRes.asErr();
    }

    for (const name of readDirRes.unwrap()) {
        const removeRes = removeSync(join(dirPath, name));
        if (removeRes.isErr()) return removeRes.asErr();
    }

    return RESULT_VOID;
}

/**
 * `readJsonFile` 的同步版本。
 */
export function readJsonFileSync<T>(filePath: string): IOResult<T> {
    return readTextFileSync(filePath).andThen(contents => {
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
 * `readTextFile` 的同步版本。
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return readFileSync(filePath, {
        encoding: 'utf8',
    });
}

/**
 * `unzip` 的同步版本。
 */
export function unzipSync(zipFilePath: string, destDir: string): VoidIOResult {
    const zipFilePathRes = validateAbsolutePath(zipFilePath);
    if (zipFilePathRes.isErr()) return zipFilePathRes.asErr();
    zipFilePath = zipFilePathRes.unwrap();

    const destDirRes = validateAbsolutePath(destDir);
    if (destDirRes.isErr()) return destDirRes.asErr();
    destDir = destDirRes.unwrap();

    return readFileSync(zipFilePath).andThen(buffer => {
        const data = new Uint8Array(buffer);

        try {
            const unzipped = decompressSync(data);

            for (const path in unzipped) {
                // 忽略目录
                if (path.at(-1) !== SEPARATOR) {
                    // 不能用 json，否则 http://usr 会变成 http:/usr
                    const writeFileRes = writeFileSync(`${ destDir }/${ path }`, unzipped[path] as Uint8Array<ArrayBuffer>);
                    if (writeFileRes.isErr()) return writeFileRes.asErr();
                }
            }

            return RESULT_VOID;
        } catch (e) {
            return Err(e as FlateError);
        }
    });
}

/**
 * `zip` 的同步版本。
 */
export function zipSync(sourcePath: string, zipFilePath: string, options?: ZipOptions): VoidIOResult {
    const sourcePathRes = validateAbsolutePath(sourcePath);
    if (sourcePathRes.isErr()) return sourcePathRes.asErr();
    sourcePath = sourcePathRes.unwrap();

    const zipFilePathRes = validateAbsolutePath(zipFilePath);
    if (zipFilePathRes.isErr()) return zipFilePathRes.asErr();
    zipFilePath = zipFilePathRes.unwrap();

    return statSync(sourcePath).andThen(stats => {
        const zipped: AsyncZippable = {};

        const sourceName = basename(sourcePath);

        if (stats.isFile()) {
            // 文件
            const readFileRes = readFileSync(sourcePath);
            if (readFileRes.isErr()) return readFileRes.asErr();

            zipped[sourceName] = new Uint8Array(readFileRes.unwrap());
        } else {
            // 目录
            const statRes = statSync(sourcePath, {
                recursive: true,
            });
            if (statRes.isErr()) return statRes.asErr();

            // 默认保留根目录
            const preserveRoot = options?.preserveRoot ?? true;

            for (const { path, stats } of statRes.unwrap()) {
                if (stats.isFile()) {
                    const entryName = preserveRoot ? join(sourceName, path) : path;
                    // 不能用 join，否则 http://usr 会变成 http:/usr
                    const readFileRes = readFileSync(sourcePath + path);
                    if (readFileRes.isErr()) return readFileRes.asErr();

                    zipped[entryName] = new Uint8Array(readFileRes.unwrap());
                }
            }
        }

        try {
            const bytes = compressSync(zipped) as Uint8Array<ArrayBuffer>;
            return writeFileSync(zipFilePath, bytes);
        } catch (e) {
            return Err(e as FlateError);
        }
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