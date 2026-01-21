import { assert } from '@std/assert';
import { decodeUtf8, encodeUtf8 } from 'minigame-std';

export function testCodec(): void {
    const data = 'minigame-std';

    console.time('decode-after-encode');
    assert(decodeUtf8(encodeUtf8(data)) === data);
    console.timeEnd('decode-after-encode');
}