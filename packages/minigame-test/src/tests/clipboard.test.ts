import { assert } from '@std/assert';
import { clipboard } from 'minigame-std';

(async () => {
    const data = 'minigame-std';

    console.time('write-clipboard');
    const success = await clipboard.writeText(data);
    assert(success.isOk());
    console.timeEnd('write-clipboard');

    console.time('read-clipboard');
    const text = await clipboard.readText();
    assert(text.unwrap() === data);
    console.timeEnd('read-clipboard');
})();