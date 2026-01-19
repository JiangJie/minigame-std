import { assert } from '@std/assert';
import { image } from 'minigame-std';

export async function testImage(): Promise<void> {
    // 测试1：从URL创建图片
    await new Promise<void>((resolve, reject) => {
        const img = image.createImageFromUrl('https://hlddz.huanle.qq.com/remote/resources/native/1d/1d8cecb27.833bf.png');

        img.onload = () => {
            assert(img.width === 119);
            assert(img.height === 173);
            resolve();
        };

        img.onerror = () => {
            console.error('createImageFromUrl', img);
            reject(new Error('createImageFromUrl failed'));
        };
    });

    // 测试2：从文件创建图片
    (await image.createImageFromFile('images/test.png')).inspect(img => {
        img.onload = () => {
            assert(img.width === 119);
            assert(img.height === 173);
        };

        img.onerror = () => {
            console.error('createImageFromFile', img);
        };
    });
}

(async () => {
    (await image.createImageFromFile('images/test.png')).inspect(img => {
        img.onload = () => {
            assert(img.width === 119);
            assert(img.height === 173);
        };

        img.onerror = () => {
            console.error('createImageFromFile', img);
        };
    });
})();