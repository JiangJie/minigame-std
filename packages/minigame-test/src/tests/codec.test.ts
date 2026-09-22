import { assert, assertEquals, assertThrows } from '@std/assert';
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

    // ==================== 测试不支持 wx.decode 的情况 ====================
    testUtf8Fallback();

    // ==================== 测试 TextDecoderOptions ====================
    testDecodeUtf8Options();
}

/**
 * 测试不支持 wx.decode/wx.encode 时的回退实现
 * 通过临时删除 wx.decode/wx.encode 方法来模拟不支持的环境
 */
function testUtf8Fallback(): void {
    console.log('Testing UTF-8 fallback implementation (without wx.decode/wx.encode)...');

    // 保存原始方法
    const originalDecode = wx.decode;
    const originalEncode = wx.encode;

    try {
        // 临时删除 wx.decode 和 wx.encode 方法，触发回退实现
        // @ts-expect-error 模拟不支持 wx.decode 的环境
        delete wx.decode;
        // @ts-expect-error 模拟不支持 wx.encode 的环境
        delete wx.encode;

        // 测试 ASCII 字符
        const asciiData = 'Hello World';
        assertEquals(decodeUtf8(encodeUtf8(asciiData)), asciiData);

        // 测试空字符串
        const emptyEncoded = encodeUtf8('');
        assertEquals(emptyEncoded.length, 0);
        assertEquals(decodeUtf8(emptyEncoded), '');

        // 测试 2 字节 UTF-8 字符（拉丁扩展字符）
        const latin = 'éàü';
        assertEquals(decodeUtf8(encodeUtf8(latin)), latin);

        // 测试 3 字节 UTF-8 字符（中文）
        const chinese = '你好世界';
        assertEquals(decodeUtf8(encodeUtf8(chinese)), chinese);

        // 测试 4 字节 UTF-8 字符（Emoji）
        const emoji = '😀🎉🚀';
        assertEquals(decodeUtf8(encodeUtf8(emoji)), emoji);

        // 测试混合字符
        const mixed = 'Hello, 世界! 🎉 café';
        assertEquals(decodeUtf8(encodeUtf8(mixed)), mixed);

        // 测试特殊边界值
        // U+007F (单字节最大值)
        const maxSingleByte = '\u007F';
        assertEquals(decodeUtf8(encodeUtf8(maxSingleByte)), maxSingleByte);

        // U+0080 (双字节最小值)
        const minDoubleByte = '\u0080';
        assertEquals(decodeUtf8(encodeUtf8(minDoubleByte)), minDoubleByte);

        // U+07FF (双字节最大值)
        const maxDoubleByte = '\u07FF';
        assertEquals(decodeUtf8(encodeUtf8(maxDoubleByte)), maxDoubleByte);

        // U+0800 (三字节最小值)
        const minTripleByte = '\u0800';
        assertEquals(decodeUtf8(encodeUtf8(minTripleByte)), minTripleByte);

        // U+FFFF (三字节最大值)
        const maxTripleByte = '\uFFFF';
        assertEquals(decodeUtf8(encodeUtf8(maxTripleByte)), maxTripleByte);

        // 测试从 ArrayBuffer 解码
        const buffer = new ArrayBuffer(5);
        const view = new Uint8Array(buffer);
        view.set([72, 101, 108, 108, 111]); // "Hello"
        assertEquals(decodeUtf8(buffer), 'Hello');

        // 测试从 DataView 解码
        const dataView = new DataView(buffer);
        assertEquals(decodeUtf8(dataView), 'Hello');

        console.log('UTF-8 fallback tests passed!');
    } finally {
        // 恢复原始方法
        wx.decode = originalDecode;
        wx.encode = originalEncode;
    }
}

/**
 * 测试 decodeUtf8 的 TextDecoderOptions 参数
 * - 默认行为使用 wx.decode（fatal=false, ignoreBOM=false）
 * - fatal=true 或 ignoreBOM=true 时回退到 webDecodeUtf8
 */
function testDecodeUtf8Options(): void {
    console.log('Testing decodeUtf8 with TextDecoderOptions...');

    // 默认选项：无效字节使用 U+FFFD 替换（wx.decode 路径）
    const invalidBytes = new Uint8Array([0xff, 0xfe]);
    const replaced = decodeUtf8(invalidBytes);
    assertEquals(replaced, '\uFFFD\uFFFD');

    // fatal=true：遇到无效字节抛出异常（回退到 webDecodeUtf8）
    assertThrows(() => decodeUtf8(invalidBytes, { fatal: true }), TypeError);

    // BOM 处理：默认剥离 BOM（wx.decode 路径）
    // UTF-8 BOM (EF BB BF) + 'Hi'
    const withBOM = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]);
    assertEquals(decodeUtf8(withBOM), 'Hi');

    // ignoreBOM=true：保留 BOM（回退到 webDecodeUtf8）
    assertEquals(decodeUtf8(withBOM, { ignoreBOM: true }), '\uFEFFHi');

    // fatal=false 显式传入，仍走 wx.decode 路径
    assertEquals(decodeUtf8(invalidBytes, { fatal: false }), '\uFFFD\uFFFD');

    // 组合选项：fatal=true + ignoreBOM=true（回退到 webDecodeUtf8）
    const validWithBOM = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]);
    assertEquals(decodeUtf8(validWithBOM, { fatal: true, ignoreBOM: true }), '\uFEFFHi');

    console.log('TextDecoderOptions tests passed!');
}
