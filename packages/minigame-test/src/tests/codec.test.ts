import { assert } from '@std/assert';
import { textDecode, textEncode } from 'minigame-std';

export function testCodec(): void {
    const data = 'minigame-std';

    console.time('decode-after-encode');
    assert(textDecode(textEncode(data)) === data);
    console.timeEnd('decode-after-encode');
}