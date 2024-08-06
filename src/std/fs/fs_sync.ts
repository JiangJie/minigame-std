import {
    appendFileSync as webAppendFileSync,
    emptyDirSync as webEmptyDirSync,
    existsSync as webExistsSync,
    mkdirSync as webMkdirSync,
    readDirSync as webReadDirSync,
    readFileSync as webReadFileSync,
    readTextFileSync as webReadTextFile,
    removeSync as webRemove,
    renameSync as webRename,
    statSync as webStat,
    unzipSync as webUnzipSync,
    writeFileSync as webWriteFile,
    zipSync as webZipSync,
    type ZipOptions,
} from 'happy-opfs';
import { Ok, type IOResult, type VoidIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { StatOptions, WriteFileContent } from './fs_define.ts';
import { convertFileSystemHandleLikeToStats } from './fs_helpers.ts';
import {
    appendFileSync as minaAppendFile,
    emptyDirSync as minaEmptyDir,
    existsSync as minaExists,
    mkdirSync as minaMkdir,
    readDirSync as minaReadDir,
    readFileSync as minaReadFile,
    readTextFileSync as minaReadTextFileSync,
    removeSync as minaRemoveSync,
    renameSync as minaRenameSync,
    statSync as minaStatSync,
    unzipSync as minaUnzipSync,
    writeFileSync as minaWriteFileSync,
    zipSync as minaZipSync,
} from './mina_fs_sync.ts';

/**
 * `mkdir` 的同步版本。
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    return isMinaEnv() ? minaMkdir(dirPath) : webMkdirSync(dirPath);
}

/**
 * `readDir` 的同步版本。
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    return isMinaEnv()
        ? minaReadDir(dirPath)
        : webReadDirSync(dirPath).map(x => {
            return x.map(y => y.path);
        });
}

/**
 * `readFile` 的同步版本。
 */
export function readFileSync(filePath: string): IOResult<ArrayBuffer> {
    return isMinaEnv() ? minaReadFile(filePath) : webReadFileSync(filePath);
}

/**
 * `remove` 的同步版本。
 */
export function removeSync(path: string): VoidIOResult {
    return isMinaEnv() ? minaRemoveSync(path) : webRemove(path);
}

/**
 * `rename` 的同步版本。
 */
export function renameSync(oldPath: string, newPath: string): VoidIOResult {
    return isMinaEnv() ? minaRenameSync(oldPath, newPath) : webRename(oldPath, newPath);
}

/**
 * `stat` 的同步版本。
 */
export function statSync(path: string): IOResult<WechatMinigame.Stats>;
export function statSync(path: string, options: StatOptions & {
    recursive: true;
}): IOResult<WechatMinigame.FileStats[]>;
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>
export function statSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    if (isMinaEnv()) {
        return minaStatSync(path, options);
    }

    const res = webStat(path);

    if (res.isErr()) {
        return res.asErr();
    }

    const entryStats = convertFileSystemHandleLikeToStats(res.unwrap());

    if (entryStats.isFile() || !options?.recursive) {
        return Ok(entryStats);
    }

    // 递归读取目录
    const readRes = webReadDirSync(path);

    if (readRes.isErr()) {
        return readRes.asErr();
    }

    const statsArr: WechatMinigame.FileStats[] = [{
        path,
        stats: entryStats,
    }];

    for (const { path, handle } of readRes.unwrap()) {
        statsArr.push({
            path,
            stats: convertFileSystemHandleLikeToStats(handle),
        })
    }

    return Ok(statsArr);
}

/**
 * `writeFile` 的同步版本。
 */
export function writeFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return isMinaEnv() ? minaWriteFileSync(filePath, contents) : webWriteFile(filePath, contents);
}

/**
 * `appendFile` 的同步版本。
 */
export function appendFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return isMinaEnv() ? minaAppendFile(filePath, contents) : webAppendFileSync(filePath, contents);
}

/**
 * `exists` 的同步版本。
 */
export function existsSync(path: string): IOResult<boolean> {
    return isMinaEnv() ? minaExists(path) : webExistsSync(path);
}

/**
 * `emptyDir` 的同步版本。
 */
export function emptyDirSync(dirPath: string): VoidIOResult {
    return isMinaEnv() ? minaEmptyDir(dirPath) : webEmptyDirSync(dirPath);
}

/**
 * `readTextFile` 的同步版本。
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return isMinaEnv() ? minaReadTextFileSync(filePath) : webReadTextFile(filePath);
}

/**
 * `unzip` 的同步版本。
 */
export function unzipSync(zipFilePath: string, targetPath: string): VoidIOResult {
    return (isMinaEnv() ? minaUnzipSync : webUnzipSync)(zipFilePath, targetPath);
}

/**
 * `zip` 的同步版本。
 */
export function zipSync(sourcePath: string, zipFilePath: string, options?: ZipOptions): VoidIOResult {
    return (isMinaEnv() ? minaZipSync : webZipSync)(sourcePath, zipFilePath, options);
}