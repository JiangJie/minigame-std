import { assert } from '@std/assert';
import { cryptos } from 'minigame-std';

(async () => {
    (await cryptos.getRandomValues(10)).inspect(bytes => {
        for (const n of bytes) {
            assert(n >= 0 && n < 256);
        }
    });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    (await cryptos.randomUUID()).inspect(uuid => {
        assert(uuidRegex.test(uuid));
    });
})();