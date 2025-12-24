import { assert } from '@std/assert';
import { image } from 'minigame-std';

{
    const img = image.createImageFromUrl('https://hlddz.huanle.qq.com/remote/resources/native/1d/1d8cecb27.833bf.png');

    img.onload = () => {
        assert(img.width === 119);
        assert(img.height === 173);
    };

    img.onerror = () => {
        console.error('createImageFromUrl', img);
    };
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