// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { cryptos } from '../src/mod.ts';
import { textEncode } from '../src/std/codec/mod.ts';

Deno.test('calculate md5', () => {
    const data = 'minigame-std';
    const md5Str = 'e1937f8f99218d8b92587af454df4f39';

    assert(cryptos.md5(data) === md5Str);
    assert(cryptos.md5(textEncode(data)) === md5Str);
});

Deno.test('calculate sha1', async () => {
    const data = 'minigame-std';
    const md5Str = '89d4f4548e9c58c7272971b7d2cf018aea78ed1a';

    assert(await cryptos.sha1(data) === md5Str);
    assert(await cryptos.sha1(textEncode(data)) === md5Str);
});