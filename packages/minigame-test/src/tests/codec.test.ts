import { assert, assertEquals } from '@std/assert';
import {
    decodeByteString,
    decodeHex,
    decodeUtf8,
    encodeByteString,
    encodeHex,
    encodeUtf8,
} from 'minigame-std';

export function testCodec(): void {
    // UTF-8 编解码测试
    const data = 'minigame-std';

    console.time('utf8-decode-after-encode');
    assert(decodeUtf8(encodeUtf8(data)) === data);
    console.timeEnd('utf8-decode-after-encode');

    // 包含中文的 UTF-8 测试
    const dataWithChinese = 'minigame-std-中文测试';
    assert(decodeUtf8(encodeUtf8(dataWithChinese)) === dataWithChinese);

    // Hex 编解码测试
    console.time('hex-encode-decode');

    // 字节数组转 hex
    const hexBytes = new Uint8Array([255, 0, 128, 64]);
    assertEquals(encodeHex(hexBytes), 'ff008040');

    // 字符串转 hex
    assertEquals(encodeHex('hello'), '68656c6c6f');

    // hex 解码
    const decodedHex = decodeHex('ff008040');
    assertEquals(decodedHex, new Uint8Array([255, 0, 128, 64]));

    // hex 编解码往返测试
    const hexTestData = new Uint8Array([0, 127, 255, 1, 254]);
    assertEquals(decodeHex(encodeHex(hexTestData)), hexTestData);

    console.timeEnd('hex-encode-decode');

    // ByteString 编解码测试
    console.time('bytestring-encode-decode');

    // 字节数组转字节字符串
    const byteArray = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
    assertEquals(encodeByteString(byteArray), 'Hello');

    // 字节字符串解码
    const decodedBytes = decodeByteString('Hello');
    assertEquals(decodedBytes, new Uint8Array([72, 101, 108, 108, 111]));

    // 字节字符串编解码往返测试
    const byteStringTestData = new Uint8Array([0, 127, 255, 1, 254, 128]);
    assertEquals(decodeByteString(encodeByteString(byteStringTestData)), byteStringTestData);

    console.timeEnd('bytestring-encode-decode');
}