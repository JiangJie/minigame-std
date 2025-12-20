import { ABORT_ERROR, toFileSystemHandleLike, type FileSystemFileHandleLike, type FileSystemHandleLike } from 'happy-opfs';

/**
 * 将 `FileSystemHandleLike` 转换为小游戏 `Stats`。
 * @param handleLike - FileSystemHandleLike
 * @returns
 */
export function convertFileSystemHandleLikeToStats(handleLike: FileSystemHandleLike): WechatMinigame.Stats {
    const { kind } = handleLike;
    const isFile = kind === 'file';
    const isDirectory = kind === 'directory';

    let size = 0;
    let lastModifiedTime = 0;

    if (isFile) {
        const file = handleLike as FileSystemFileHandleLike;

        size = file.size;
        lastModifiedTime = file.lastModified;
    }

    const stats: WechatMinigame.Stats = {
        isFile: (): boolean => isFile,
        isDirectory: (): boolean => isDirectory,
        size,
        lastModifiedTime,
        lastAccessedTime: 0,
        mode: 0,
    };

    return stats;
}

/**
 * 将`FileSystemHandle`转换为小游戏 `Stats`。
 * @param handle - FileSystemHandle
 * @returns
 */
export async function convertFileSystemHandleToStats(handle: FileSystemHandle): Promise<WechatMinigame.Stats> {
    const handleLike = await toFileSystemHandleLike(handle);
    return convertFileSystemHandleLikeToStats(handleLike);
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