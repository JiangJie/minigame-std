import { assert } from '@std/assert';
import { storage } from 'minigame-std';

(async () => {
    const key = 'name';
    const data = 'minigame-std';

    console.time('storage-setItem');
    await storage.setItem(key, data);
    console.timeEnd('storage-setItem');

    // NOTE: 2024-05-14
    // 开发者工具有bug，setStorage之后立马getStorage会报错
    console.time('storage-getItem');
    const text = await storage.getItem(key);
    assert(text.unwrap() === data);
    console.timeEnd('storage-getItem');

    console.time('storage-removeItem');
    await storage.removeItem(key);
    console.timeEnd('storage-removeItem');

    const textNotExists = await storage.getItem(key);
    assert(textNotExists.isErr());

    await storage.setItem(key, data);
    console.time('storage-clear');
    await storage.clear();
    console.timeEnd('storage-clear');
})();