/**
 * 图片处理模块，提供从 URL 或文件创建图片的功能。
 * @module image
 */
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
 * @since 1.7.0
 * @example
 * ```ts
 * const img = createImageFromUrl('https://example.com/image.png');
 * img.onload = () => {
 *     console.log('图片加载完成', img.width, img.height);
 * };
 * ```
 */
export function createImageFromUrl(url: string): HTMLImageElement | WechatMinigame.Image {
    return (isMinaEnv() ? minaCreateImageFromUrl : webCreateImageFromUrl)(url);
}

/**
 * 从文件创建图片。
 * @param filePath - 文件路径。
 * @returns 异步的Image对象。
 * @since 1.7.0
 * @example
 * ```ts
 * const result = await createImageFromFile('/path/to/image.png');
 * if (result.isOk()) {
 *     const img = result.unwrap();
 *     console.log('图片尺寸:', img.width, 'x', img.height);
 * }
 * ```
 */
export function createImageFromFile(filePath: string): AsyncIOResult<HTMLImageElement | WechatMinigame.Image> {
    return isMinaEnv()
        ? Promise.resolve(Ok(minaCreateImageFromFile(filePath)))
        : webCreateImageFromFile(filePath);
}