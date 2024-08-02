import { NOT_FOUND_ERROR, assertAbsolutePath, toFileSystemHandleLike, type FileSystemFileHandleLike, type FileSystemHandleLike } from 'happy-opfs';
import { Err, type IOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';

/**
 * 小游戏文件系统管理器实例。
 *
 * for tree shake
 */
let fs: WechatMinigame.FileSystemManager;

/**
 * 获取小游戏文件系统管理器实例。
 * @returns 文件系统管理器实例。
 */
export function getFs(): WechatMinigame.FileSystemManager {
    fs ??= wx.getFileSystemManager();
    return fs;
}

/**
 * 根路径。
 *
 * for tree shake
 */
let rootPath: string;

/**
 * 获取文件系统的根路径。
 * @returns 文件系统的根路径。
 */
function getRootPath(): string {
    rootPath ??= wx.env.USER_DATA_PATH;
    return rootPath;
}

/**
 * 获取给定路径的绝对路径。
 * @param path - 相对USER_DATA_PATH的相对路径，也必须以`/`开头。
 * @returns 转换后的绝对路径。
 */
export function getAbsolutePath(path: string): string {
    assertString(path);

    const rootPath = getRootPath();

    if (path.startsWith(rootPath)) {
        return path;
    }

    assertAbsolutePath(path);
    return rootPath + path;
}

/**
 * 判断是否文件或者文件夹不存在。
 * @param err - 错误对象。
 */
export function isNotFoundIOError(err: WechatMinigame.FileError): boolean {
    // 1300002	no such file or directory ${path}
    // 可能没有errCode
    return err.errCode === 1300002 || err.errMsg.includes('no such file or directory');
}

/**
 * 判断是否文件或者文件夹已存在。
 * @param err - 错误对象。
 */
export function isAlreadyExistsIOError(err: WechatMinigame.FileError): boolean {
    // 1301005	file already exists ${dirPath}	已有同名文件或目录
    // 可能没有errCode
    return err.errCode === 1301005 || err.errMsg.includes('already exists');
}

/**
 * 将错误对象转换为 IOResult 类型。
 * @typeParam T - Result 的 Ok 类型。
 * @param err - 错误对象。
 * @returns 转换后的 IOResult 对象。
 */
export function toErr<T>(err: WechatMinigame.FileError | WechatMinigame.GeneralCallbackResult): IOResult<T> {
    const error = new Error(err.errMsg);

    if (isNotFoundIOError(err as WechatMinigame.FileError)) {
        error.name = NOT_FOUND_ERROR;
    }

    return Err(error);
}

/**
 * Whether the error is a `NotFoundError`.
 * @param err - The error to check.
 * @returns `true` if the error is a `NotFoundError`, otherwise `false`.
 */
export function isNotFoundError(err: Error): boolean {
    return err.name === NOT_FOUND_ERROR;
}

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

        size = file.size
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