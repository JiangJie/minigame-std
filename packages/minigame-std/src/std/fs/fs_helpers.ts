/**
 * @internal
 * 文件系统辅助函数。
 */

import { ABORT_ERROR, isFileHandle, isFileHandleLike, type FileSystemHandleLike } from 'happy-opfs';

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
 * Creates an `AbortError` Error.
 * @returns An `AbortError` Error.
 */
export function createAbortError(): Error {
    const error = new Error();
    error.name = ABORT_ERROR;

    return error;
}
