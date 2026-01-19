/**
 * @internal
 * Web 平台的图片创建实现。
 */

import { readBlobFile } from 'happy-opfs';
import { Ok, type AsyncIOResult } from 'happy-rusty';

/**
 * 从 URL 创建图片元素。
 * @param url - 图片的 URL 地址。
 * @returns 返回 HTML 图片元素。
 */
export function createImageFromUrl(url: string): HTMLImageElement {
    const img = new Image();
    img.src = url;

    return img;
}

/**
 * 从本地文件路径创建图片元素。
 * @param filePath - 图片文件的本地路径。
 * @returns 返回包含 HTML 图片元素的异步结果。
 */
export async function createImageFromFile(filePath: string): AsyncIOResult<HTMLImageElement> {
    const readRes = await readBlobFile(filePath);

    return readRes.andThen(blob => {
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.src = url;

        img.addEventListener('load', () => {
            URL.revokeObjectURL(url);
        });
        img.addEventListener('error', () => {
            URL.revokeObjectURL(url);
        });

        return Ok(img);
    });
}