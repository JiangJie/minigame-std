/**
 * @internal
 * 文件系统辅助函数。
 */

import { isFileHandle, isFileHandleLike, readDir, readDirSync, stat, statSync, type FileSystemHandleLike } from 'happy-opfs';
import { Ok, tryAsyncResult, type AsyncIOResult, type IOResult } from 'happy-rusty';
import type { StatOptions } from './fs_define';

/**
 * 将 `FileSystemHandleLike` 转换为小游戏 `Stats`。
 * @param handleLike - FileSystemHandleLike
 * @returns
 */
export function convertFileSystemHandleLikeToStats(handleLike: FileSystemHandleLike): WechatMinigame.Stats {
    const isFile = isFileHandleLike(handleLike);

    return {
        isFile: (): boolean => isFile,
        isDirectory: (): boolean => !isFile,
        size: isFile ? handleLike.size : 0,
        lastModifiedTime: isFile ? handleLike.lastModified : 0,
        lastAccessedTime: 0,
        mode: 0,
    };
}

/**
 * 将`FileSystemHandle`转换为小游戏 `Stats`。
 * @param handle - FileSystemHandle
 * @returns
 */
export async function convertFileSystemHandleToStats(handle: FileSystemHandle): Promise<WechatMinigame.Stats> {
    const isFile = isFileHandle(handle);
    let size = 0;
    let lastModified = 0;

    if (isFile) {
        const file = await handle.getFile();
        ({ size, lastModified } = file);
    }

    return {
        isFile: (): boolean => isFile,
        isDirectory: (): boolean => !isFile,
        size,
        lastModifiedTime: lastModified,
        lastAccessedTime: 0,
        mode: 0,
    };
}

/**
 * 将 Web 端的读取目录结果转换为小游戏端的读取目录结果。
 */
export async function webToMinaReadDir(dirPath: string): AsyncIOResult<string[]> {
    // 小游戏不支持 recursive 选项
    const readDirRes = await readDir(dirPath);
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
export async function webToMinaStat(path: string, options?: StatOptions): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const statRes = await stat(path);
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
    const readDirRes = await readDir(path);
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

/**
 * 将 Web 端的读取目录结果转换为小游戏端的读取目录结果。
 */
export function webToMinaReadDirSync(dirPath: string): IOResult<string[]> {
    // 小游戏不支持 recursive 选项
    const readDirRes = readDirSync(dirPath);
    return readDirRes.map(entries => {
        return entries.map(({ path }) => path);
    });
}

/**
 * 将 Web 端的 stat 结果转换为小游戏端的 stat 结果。
 */
export function webToMinaStatSync(path: string, options?: StatOptions): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]> {
    const statRes = statSync(path);
    if (statRes.isErr()) return statRes.asErr();

    const handleLike = statRes.unwrap();

    const entryStats = convertFileSystemHandleLikeToStats(handleLike);

    // 非递归模式直接返回
    if (!options?.recursive) {
        return Ok(entryStats);
    }

    if (entryStats.isFile()) {
        return Ok([{
            path: '', // 当前文件本身的相对路径
            stats: entryStats,
        }]);
    }

    // 递归读取目录
    const readDirRes = readDirSync(path);
    return readDirRes.map(entries => {
        const statsArr = entries.map(({ path, handle }) => ({
            path,
            stats: convertFileSystemHandleLikeToStats(handle),
        }));

        // 只要是 recursive 模式下的目录, 就返回数组(即使是空目录)
        statsArr.unshift({
            path: '', // 当前文件夹本身的相对路径
            stats: entryStats,
        });

        return statsArr;
    });
}
