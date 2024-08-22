import { Ok, type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import {
    createImageFromFile as minaCreateImageFromFile,
    createImageFromUrl as minaCreateImageFromUrl,
} from './mina_image.ts';
import {
    createImageFromFile as webCreateImageFromFile,
    createImageFromUrl as webCreateImageFromUrl,
} from './web_image.ts';

/**
 * 从URL创建图片。
 * @param url - 图片URL。
 * @returns Image对象。
 */
export function createImageFromUrl(url: string): HTMLImageElement | WechatMinigame.Image {
    return (isMinaEnv() ? minaCreateImageFromUrl : webCreateImageFromUrl)(url);
}

/**
 * 从文件创建图片。
 * @param filePath - 文件路径。
 * @returns 异步的Image对象。
 */
export function createImageFromFile(filePath: string): AsyncIOResult<HTMLImageElement | WechatMinigame.Image> {
    return isMinaEnv()
        ? Promise.resolve(Ok(minaCreateImageFromFile(filePath)))
        : webCreateImageFromFile(filePath);
}