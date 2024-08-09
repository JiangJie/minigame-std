// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { decode, encode } from '../src/mod.ts';

Deno.test('encode/decode between utf8 string and binary', () => {
    const data = 'minigame-std';
    assert(decode(encode(data)) === data);
});