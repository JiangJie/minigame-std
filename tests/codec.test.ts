import { expect, test } from '@jest/globals';
import { decode, encode } from '../src/mod.ts';

test('encode/decode between utf8 string and ArrayBuffer', () => {
    const data = 'minigame-std';
    expect(decode(encode(data))).toBe(data);
});