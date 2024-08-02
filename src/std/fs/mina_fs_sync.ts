import { dirname, join } from '@std/path/posix';
import { type ExistsOptions, type WriteOptions } from 'happy-opfs';
import { Ok, type IOResult } from 'happy-rusty';
import type { ReadFileContent, ReadOptions, StatOptions, WriteFileContent } from './fs_define.ts';
import { getAbsolutePath, getFs, isNotFoundError, toErr } from './fs_helpers.ts';
import { errToMkdirResult, errToRemoveResult, getExistsResult, getReadFileEncoding, getWriteFileContents } from './mina_fs_shared.ts';

/**
 * `mkdir` 的同步版本。
 */
export function mkdirSync(dirPath: string): IOResult<boolean> {
    const absPath = getAbsolutePath(dirPath);

    try {
        getFs().mkdirSync(absPath, true);
        return Ok(true);
    } catch (e: unknown) {
        return errToMkdirResult(e as WechatMinigame.FileError);
    }
}

/**
 * `readDir` 的同步版本。
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    const absPath = getAbsolutePath(dirPath);

    try {
        const files = getFs().readdirSync(absPath);
        return Ok(files);
    } catch (e: unknown) {
        return toErr(e as WechatMinigame.FileError);
    }
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

    try {
        const data = getFs().readFileSync(absPath, encoding);
        return Ok(data as T);
    } catch (e: unknown) {
        return toErr(e as WechatMinigame.FileError);
    }
}

/**
 * `remove` 的同步版本。
 */
export function removeSync(path: string): IOResult<boolean> {
    const res = statSync(path);

    if (res.isErr()) {
        return res.asErr();
    }

    const absPath = getAbsolutePath(path);

    try {
        // 文件夹还是文件
        if (res.unwrap().isDirectory()) {
            getFs().rmdirSync(absPath, true);
        } else {
            getFs().unlinkSync(absPath);
        }

        return Ok(true);
    } catch (e: unknown) {
        // 目标 path 本就不存在，当做成功
        return errToRemoveResult(e as WechatMinigame.FileError);
    }
}

/**
 * `rename` 的同步版本。
 */
export function renameSync(oldPath: string, newPath: string): IOResult<boolean> {
    const absOldPath = getAbsolutePath(oldPath);
    const absNewPath = getAbsolutePath(newPath);

    try {
        getFs().renameSync(absOldPath, absNewPath);
        return Ok(true);
    } catch (e: unknown) {
        return toErr(e as WechatMinigame.FileError);
    }
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

    try {
        const stats = getFs().statSync(absPath, options?.recursive ?? false);
        return Ok(stats);
    } catch (e: unknown) {
        return toErr(e as WechatMinigame.FileError);
    }
}

/**
 * `writeFile` 的同步版本。
 */
export function writeFileSync(filePath: string, contents: WriteFileContent, options?: WriteOptions): IOResult<boolean> {
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

    try {
        (append ? getFs().appendFileSync : getFs().writeFileSync)(absPath, data, encoding);
        return Ok(true);
    } catch (e: unknown) {
        return toErr(e as WechatMinigame.FileError);
    }
}

/**
 * `appendFile` 的同步版本。
 */
export function appendFileSync(filePath: string, contents: WriteFileContent): IOResult<boolean> {
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
export function emptyDirSync(dirPath: string): IOResult<boolean> {
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

    return Ok(true);
}

/**
 * `readTextFile` 的同步版本。
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return readFileSync(filePath, {
        encoding: 'utf8',
    });
}