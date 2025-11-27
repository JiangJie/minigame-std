// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { decodeBase64, encodeBase64 } from 'minigame-std';

Deno.test('encode/decode string to/from base64 string', () => {
    const data = 'minigame-std';
    const encodedData = 'bWluaWdhbWUtc3Rk';

    const data1 = '中文';
    const encodedData1 = '5Lit5paH';

    assert(encodeBase64(data) === encodedData);
    assert(decodeBase64(encodedData) === data);

    assert(encodeBase64(data1) === encodedData1);
    assert(decodeBase64(encodedData1) === data1);
});