import { basename, dirname, join, SEPARATOR } from '@std/path/posix';
import * as fflate from 'fflate/browser';
import { type ExistsOptions, type WriteOptions, type ZipOptions } from 'happy-opfs';
import { Err, Ok, RESULT_VOID, type IOResult, type VoidIOResult } from 'happy-rusty';
import type { ReadFileContent, ReadOptions, StatOptions, WriteFileContent } from './fs_define.ts';
import { errToMkdirResult, errToRemoveResult, fileErrorToResult, getAbsolutePath, getExistsResult, getFs, getReadFileEncoding, getWriteFileContents, isNotFoundError } from './mina_fs_shared.ts';

/**
 * 安全地调用同步接口。
 * @param op - 同步操作。
 * @param errToResult - 错误处理函数。
 * @returns
 */
function trySyncOp<T>(op: () => T, errToResult: (err: WechatMinigame.FileError) => IOResult<T> = fileErrorToResult): IOResult<T> {
    try {
        const res = op();
        return Ok(res);
    } catch (e: unknown) {
        return errToResult(e as WechatMinigame.FileError);
    }
}

/**
 * `mkdir` 的同步版本。
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    const absPath = getAbsolutePath(dirPath);

    return trySyncOp(() => getFs().mkdirSync(absPath, true), errToMkdirResult);
}

/**
 * `readDir` 的同步版本。
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    const absPath = getAbsolutePath(dirPath);

    return trySyncOp(() => getFs().readdirSync(absPath));
}

/**
 * `readFile` 的同步版本。
 */
export function readFileSync(filePath: string, options: ReadOptions & {
    encoding: 'utf8',
}): IOResult<string>;
export function readFileSync(filePath: string, options?: ReadOptions & {
    encoding: 'binary',
}): IOResult<ArrayBuffer>;
export function readFileSync<T extends ReadFileContent>(filePath: string, options?: ReadOptions): IOResult<T> {
    const absPath = getAbsolutePath(filePath);
    const encoding = getReadFileEncoding(options);

    return trySyncOp(() => getFs().readFileSync(absPath, encoding) as T);
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

    const absPath = getAbsolutePath(path);

    return trySyncOp(() => {
        // 文件夹还是文件
        if (statRes.unwrap().isDirectory()) {
            getFs().rmdirSync(absPath, true);
        } else {
            getFs().unlinkSync(absPath);
        }
    }, errToRemoveResult);
}

/**
 * `rename` 的同步版本。
 */
export function renameSync(oldPath: string, newPath: string): VoidIOResult {
    const absOldPath = getAbsolutePath(oldPath);
    const absNewPath = getAbsolutePath(newPath);

    return trySyncOp(() => getFs().renameSync(absOldPath, absNewPath));
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
    const absPath = getAbsolutePath(path);

    return trySyncOp(() => getFs().statSync(absPath, options?.recursive ?? false));
}

/**
 * `writeFile` 的同步版本。
 */
export function writeFileSync(filePath: string, contents: WriteFileContent, options?: WriteOptions): VoidIOResult {
    const absPath = getAbsolutePath(filePath);

    // 默认创建
    const { append = false, create = true } = options ?? {};

    if (create) {
        const res = mkdirSync(dirname(absPath));
        if (res.isErr()) {
            return res;
        }
    }

    const { data, encoding } = getWriteFileContents(contents);

    return trySyncOp(() => (append ? getFs().appendFileSync : getFs().writeFileSync)(absPath, data, encoding));
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
 * `exists` 的同步版本。
 */
export function existsSync(path: string, options?: ExistsOptions): IOResult<boolean> {
    const res = statSync(path);
    return getExistsResult(res, options);
}

/**
 * `emptyDir` 的同步版本。
 */
export function emptyDirSync(dirPath: string): VoidIOResult {
    const res = readDirSync(dirPath);
    if (res.isErr()) {
        return isNotFoundError(res.unwrapErr()) ? mkdirSync(dirPath) : res.asErr();
    }

    for (const name of res.unwrap()) {
        const res = removeSync(join(dirPath, name));
        if (res.isErr()) {
            return res.asErr();
        }
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
 * `unzip` 的同步版本。
 */
export function unzipSync(zipFilePath: string, targetPath: string): VoidIOResult {
    const absZipPath = getAbsolutePath(zipFilePath);
    const absTargetPath = getAbsolutePath(targetPath);

    const res = readFileSync(absZipPath);
    if (res.isErr()) {
        return res.asErr();
    }

    const data = new Uint8Array(res.unwrap());

    try {
        const unzipped = fflate.unzipSync(data);

        for (const path in unzipped) {
            // ignore directory
            if (path.at(-1) !== SEPARATOR) {
                console.log('path', path, join(absTargetPath, path));
                // 不能用 json，否则 http://usr 会变成 http:/usr
                const res = writeFileSync(`${ absTargetPath }/${ path }`, unzipped[path]);
                if (res.isErr()) {
                    return res.asErr();
                }
            }
        }

        return RESULT_VOID;
    } catch (e) {
        return Err(e as fflate.FlateError);
    }
}

/**
 * `zip` 的同步版本。
 */
export function zipSync(sourcePath: string, zipFilePath: string, options?: ZipOptions): VoidIOResult {
    const absSourcePath = getAbsolutePath(sourcePath);
    const absZipPath = getAbsolutePath(zipFilePath);

    const statRes = statSync(absSourcePath);
    if (statRes.isErr()) {
        return statRes.asErr();
    }

    const zipped: fflate.AsyncZippable = {};

    const sourceName = basename(absSourcePath);
    const stats = statRes.unwrap();

    if (stats.isFile()) {
        // file
        const res = readFileSync(absSourcePath);
        if (res.isErr()) {
            return res.asErr();
        }

        zipped[sourceName] = new Uint8Array(res.unwrap());
    } else {
        // directory
        const res = statSync(absSourcePath, {
            recursive: true,
        });
        if (res.isErr()) {
            return res.asErr();
        }

        // default to preserve root
        const preserveRoot = options?.preserveRoot ?? true;

        for (const { path, stats } of res.unwrap()) {
            if (stats.isFile()) {
                const entryName = preserveRoot ? join(sourceName, path) : path;
                // 不能用 json，否则 http://usr 会变成 http:/usr
                const res = readFileSync(absSourcePath + path);
                if (res.isErr()) {
                    return res.asErr();
                }

                zipped[entryName] = new Uint8Array(res.unwrap());
            }
        }
    }

    try {
        const u8a = fflate.zipSync(zipped);
        return writeFileSync(absZipPath, u8a);
    } catch (e) {
        return Err(e as fflate.FlateError);
    }
}