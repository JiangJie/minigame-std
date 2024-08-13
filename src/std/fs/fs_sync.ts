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
    zipSync as minaZipSync,
} from './mina_fs_sync.ts';

/**
 * `mkdir` 的同步版本。
 */
export function mkdirSync(dirPath: string): VoidIOResult {
    return (isMinaEnv() ? minaMkdirSync : webMkdirSync)(dirPath);
}

/**
 * `move` 的同步版本。
 */
export function moveSync(srcPath: string, destPath: string): VoidIOResult {
    return (isMinaEnv() ? minaMoveSync : webMoveSync)(srcPath, destPath);
}

/**
 * `readDir` 的同步版本。
 */
export function readDirSync(dirPath: string): IOResult<string[]> {
    return isMinaEnv()
        ? minaReadDirSync(dirPath)
        : webReadDirSync(dirPath).map(x => {
            return x.map(y => y.path);
        });
}

/**
 * `readFile` 的同步版本。
 */
export function readFileSync(filePath: string): IOResult<ArrayBuffer> {
    return (isMinaEnv() ? minaReadFileSync : webReadFileSync)(filePath);
}

/**
 * `remove` 的同步版本。
 */
export function removeSync(path: string): VoidIOResult {
    return (isMinaEnv() ? minaRemoveSync : webRemoveSync)(path);
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

    return webStatSync(path).andThen((handleLike): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> => {
        const entryStats = convertFileSystemHandleLikeToStats(handleLike);

        if (entryStats.isFile() || !options?.recursive) {
            return Ok(entryStats);
        }

        // 递归读取目录
        return webReadDirSync(path).andThen(entries => {
            const statsArr: WechatMinigame.FileStats[] = [{
                path,
                stats: entryStats,
            }];

            for (const { path, handle } of entries) {
                statsArr.push({
                    path,
                    stats: convertFileSystemHandleLikeToStats(handle),
                })
            }

            return Ok(statsArr);
        });
    });
}

/**
 * `writeFile` 的同步版本。
 */
export function writeFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return (isMinaEnv() ? minaWriteFileSync : webWriteFileSync)(filePath, contents);
}

/**
 * `copy` 的同步版本。
 */
export function copySync(srcPath: string, destPath: string): VoidIOResult {
    return (isMinaEnv() ? minaCopySync : webCopySync)(srcPath, destPath);
}

/**
 * `appendFile` 的同步版本。
 */
export function appendFileSync(filePath: string, contents: WriteFileContent): VoidIOResult {
    return (isMinaEnv() ? minaAppendFileSync : webAppendFileSync)(filePath, contents);
}

/**
 * `exists` 的同步版本。
 */
export function existsSync(path: string): IOResult<boolean> {
    return (isMinaEnv() ? minaExistsSync : webExistsSync)(path);
}

/**
 * `emptyDir` 的同步版本。
 */
export function emptyDirSync(dirPath: string): VoidIOResult {
    return (isMinaEnv() ? minaEmptyDirSync : webEmptyDirSync)(dirPath);
}

/**
 * `readJsonFile` 的同步版本。
 */
export function readJsonFileSync<T>(filePath: string): IOResult<T> {
    return (isMinaEnv() ? minaReadJsonFileSync : webReadJsonFileSync)(filePath);
}

/**
 * `readTextFile` 的同步版本。
 */
export function readTextFileSync(filePath: string): IOResult<string> {
    return (isMinaEnv() ? minaReadTextFileSync : webReadTextFileSync)(filePath);
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