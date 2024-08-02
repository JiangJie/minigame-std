import { dirname, join } from '@std/path/posix';
import { type ExistsOptions, type WriteOptions } from 'happy-opfs';
import { Ok, RESULT_TRUE, type IOResult } from 'happy-rusty';
import type { ReadFileContent, ReadOptions, StatOptions, WriteFileContent } from './fs_define.ts';
import { getAbsolutePath, getFs, isNotFoundError, toErr } from './fs_helpers.ts';
import { errToMkdirResult, errToRemoveResult, getExistsResult, getReadFileEncoding, getWriteFileContents } from './mina_fs_shared.ts';

const fs = getFs();

/**
 * 安全地调用同步接口。
 * @param op - 同步操作。
 * @param errToResult - 错误处理函数。
 * @returns
 */
function trySyncOp<T>(op: () => T, errToResult: (err: WechatMinigame.FileError) => IOResult<T> = toErr): IOResult<T> {
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
export function mkdirSync(dirPath: string): IOResult<boolean> {
    const absPath = getAbsolutePath(dirPath);

    return trySyncOp(() => (fs.mkdirSync(absPath, true), true), errToMkdirResult);
}

/**
 * `readDir` 的同步版本。
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    const absPath = getAbsolutePath(dirPath);

    return trySyncOp(() => fs.readdirSync(absPath));
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

    return trySyncOp(() => fs.readFileSync(absPath, encoding) as T);
}

/**
 * `remove` 的同步版本。
 */
export function removeSync(path: string): IOResult<boolean> {
    const statRes = statSync(path);

    if (statRes.isErr()) {
        return statRes.asErr();
    }

    const absPath = getAbsolutePath(path);

    return trySyncOp(() => {
        // 文件夹还是文件
        if (statRes.unwrap().isDirectory()) {
            fs.rmdirSync(absPath, true);
        } else {
            fs.unlinkSync(absPath);
        }

        return true;
    }, errToRemoveResult);
}

/**
 * `rename` 的同步版本。
 */
export function renameSync(oldPath: string, newPath: string): IOResult<boolean> {
    const absOldPath = getAbsolutePath(oldPath);
    const absNewPath = getAbsolutePath(newPath);

    return trySyncOp(() => (fs.renameSync(absOldPath, absNewPath), true));
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

    return trySyncOp(() => fs.statSync(absPath, options?.recursive ?? false));
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

    return trySyncOp(() => ((append ? fs.appendFileSync : fs.writeFileSync)(absPath, data, encoding), true));
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

    return RESULT_TRUE;
}

/**
 * `readTextFile` 的同步版本。
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return readFileSync(filePath, {
        encoding: 'utf8',
    });
}