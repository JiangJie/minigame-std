import {
    appendFile as webAppendFile,
    downloadFile as webDownloadFile,
    exists as webExists,
    mkdir as webMkdir,
    readDir as webReadDir,
    readFile as webReadFile,
    readTextFile as webReadTextFile,
    remove as webRemove,
    rename as webRename,
    stat as webStat,
    uploadFile as webUploadFile,
    writeFile as webWriteFile,
} from 'happy-opfs';
import { Ok, type AsyncIOResult, type Result } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts' with { type: 'macros' };
import type { WriteFileContent } from './fs_define.ts';
import {
    appendFile as minaAppendFile,
    downloadFile as minaDownloadFile,
    exists as minaExists,
    mkdir as minaMkdir,
    readDir as minaReadDir,
    readFile as minaReadFile,
    readTextFile as minaReadTextFile,
    remove as minaRemove,
    rename as minaRename,
    stat as minaStat,
    uploadFile as minaUploadFile,
    writeFile as minaWriteFile,
} from './mina_fs.ts';

/**
 * 读取文件夹一级子内容
 * @param dirPath 文件夹路径
 * @returns
 */
export async function readDir(dirPath: string): AsyncIOResult<string[]> {
    if (isMinaEnv()) {
        return minaReadDir(dirPath);
    }

    const x = await webReadDir(dirPath);
    if (x.isErr()) {
        return x as Result<string[], Error>;
    }
    const items: string[] = [];
    for await (const item of x.unwrap()) {
        items.push(item[0]);
    }
    return Ok(items);
}

/**
 * 递归创建文件夹，相当于`mkdir -p`
 * @param dirPath 要创建的文件夹路径
 */
export function mkdir(dirPath: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaMkdir(dirPath) : webMkdir(dirPath);
}

/**
 * 读取文件内容，返回`ArrayBuffer`
 * @param filePath 要读取的文件路径
 */
export function readFile(filePath: string): AsyncIOResult<ArrayBuffer> {
    return isMinaEnv() ? minaReadFile(filePath) : webReadFile(filePath);
}

/**
 * 递归删除目录或者文件，即使目录非空，相当于`rm -rf`
 * @param path 要删除的文件（夹）路径
 */
export function remove(path: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaRemove(path) : webRemove(path);
}

/**
 * 剪切文件或文件夹
 * @param oldPath
 * @param newPath
 * @returns
 */
export function rename(oldPath: string, newPath: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaRename(oldPath, newPath) : webRename(oldPath, newPath);
}

/**
 * fs.stat
 * @param path
 * @returns
 */
export async function stat(path: string): AsyncIOResult<{
    isFile: () => boolean;
    isDirectory: () => boolean;
}> {
    if (isMinaEnv()) {
        const res = await minaStat(path);

        if (res.isErr()) {
            return res;
        }

        const stat = res.unwrap();
        const isFile = stat.isFile();
        const isDirectory = stat.isDirectory();

        return Ok({
            isFile: () => isFile,
            isDirectory: () => isDirectory,
        });
    }

    const res = await webStat(path);

    if (res.isErr()) {
        return res;
    }

    const { kind } = res.unwrap();
    const isFile = kind === 'file';
    const isDirectory = kind === 'directory';

    return Ok({
        isFile: () => isFile,
        isDirectory: () => isDirectory,
    });
}

/**
 * 写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的
 * @param filePath 要写入的文件路径
 * @param contents 写入内容
 */
export function writeFile(filePath: string, contents: WriteFileContent): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaWriteFile(filePath, contents) : webWriteFile(filePath, contents);
}

/**
 * 将内容写入文件末尾
 * @param filePath 要写入的文件路径
 * @param contents 写入内容
 */
export function appendFile(filePath: string, contents: WriteFileContent): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaAppendFile(filePath, contents) : webAppendFile(filePath, contents);
}

/**
 * 下载文件到本地
 * @param fileUrl 文件远端url
 * @param filePath 写入的本地路径
 * @param requestHeaders 下载请求的自定义headers
 */
export function downloadFile(fileUrl: string, filePath: string, requestInit?: RequestInit): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaDownloadFile(fileUrl, filePath, requestInit?.headers) : webDownloadFile(fileUrl, filePath, requestInit);
}

/**
 * 检查路径的可访问性，只要存在则默认是可读写的
 * @param path 要检查的文件（夹）路径
 */
export function exists(path: string): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaExists(path) : webExists(path);
}

/**
 * 读取文件内容，返回`string`
 * @param filePath 要读取的文件路径
 */
export function readTextFile(filePath: string): AsyncIOResult<string> {
    return isMinaEnv() ? minaReadTextFile(filePath) : webReadTextFile(filePath);
}

/**
 * 上传文件
 * @param filePath 本地文件路径
 * @param fileUrl 上传url
 * @param requestInit 传递给`fetch`的参数
 * @returns
 */
export async function uploadFile(filePath: string, fileUrl: string, requestInit?: RequestInit): AsyncIOResult<boolean> {
    return isMinaEnv() ? minaUploadFile(fileUrl, filePath, requestInit?.headers) : webUploadFile(fileUrl, filePath, requestInit);
}
