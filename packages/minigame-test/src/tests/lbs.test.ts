import { assert } from '@std/assert';
import { lbs } from 'minigame-std';

(async () => {
    (await lbs.getCurrentPosition()).inspect(pos => {
        assert(typeof pos.latitude === 'number');
        assert(typeof pos.longitude === 'number');
    }).inspectErr(err => {
        assert(err instanceof Error);
    });
})();
