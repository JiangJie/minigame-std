// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { hash } from '../src/mod.ts';
import { textEncode } from '../src/std/codec/mod.ts';

Deno.test('calculate md5', () => {
    const data = 'minigame-std';
    const md5Str = 'e1937f8f99218d8b92587af454df4f39';

    assert(hash.md5(data) === md5Str);
    assert(hash.md5(textEncode(data)) === md5Str);
});