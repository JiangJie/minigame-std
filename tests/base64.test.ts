import { expect, test } from '@jest/globals';
import { decodeBase64, encodeBase64 } from '../src/mod.ts';

test('encode/decode string to/from base64 string', () => {
    const data = 'minigame-std';
    const encodedData = 'bWluaWdhbWUtc3Rk';

    const data1 = '中文';
    const encodedData1 = '5Lit5paH';

    expect(encodeBase64(data)).toBe(encodedData);
    expect(decodeBase64(encodedData)).toBe(data);

    expect(encodeBase64(data1)).toBe(encodedData1);
    expect(decodeBase64(encodedData1)).toBe(data1);
});