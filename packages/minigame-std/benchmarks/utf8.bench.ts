/**
 * UTF-8 编解码性能测试
 *
 * 比较两种实现方式：
 * 1. TextEncoder/TextDecoder 方案：使用浏览器原生 API
 * 2. 纯 JS 方案：纯 JavaScript 循环编解码
 *
 * 运行方式：pnpm run bench
 */

import { bench, describe } from 'vitest';
import { decodeUtf8Buffer, encodeUtf8Buffer } from '../src/std/codec/utf8/utf8.ts';
import { decodeUtf8 as webDecodeUtf8, encodeUtf8 as webEncodeUtf8 } from '../src/std/codec/utf8/web_utf8.ts';

// 测试数据 - 原始字符串
const shortString = 'Hello, World!';
const mediumString = 'A'.repeat(1000);
const longString = 'B'.repeat(10000);
const chineseString = '你好世界'.repeat(100);
const mixedString = 'Hello 你好 World 世界 1234567890'.repeat(50);
const emojiString = '😀🎉🚀✨'.repeat(100);

// 测试数据 - 预编码的 Uint8Array（用于解码测试）
const shortBytes = webEncodeUtf8(shortString);
const mediumBytes = webEncodeUtf8(mediumString);
const longBytes = webEncodeUtf8(longString);
const chineseBytes = webEncodeUtf8(chineseString);
const mixedBytes = webEncodeUtf8(mixedString);
const emojiBytes = webEncodeUtf8(emojiString);

// ===================== 编码测试 =====================

describe('UTF-8 编码 - 短字符串 (13 chars)', () => {
    bench('TextEncoder 方案', () => {
        webEncodeUtf8(shortString);
    });

    bench('纯JS 方案', () => {
        encodeUtf8Buffer(shortString);
    });
});

describe('UTF-8 编码 - 中等字符串 (1000 chars)', () => {
    bench('TextEncoder 方案', () => {
        webEncodeUtf8(mediumString);
    });

    bench('纯JS 方案', () => {
        encodeUtf8Buffer(mediumString);
    });
});

describe('UTF-8 编码 - 长字符串 (10000 chars)', () => {
    bench('TextEncoder 方案', () => {
        webEncodeUtf8(longString);
    });

    bench('纯JS 方案', () => {
        encodeUtf8Buffer(longString);
    });
});

describe('UTF-8 编码 - 中文字符串 (400 chars)', () => {
    bench('TextEncoder 方案', () => {
        webEncodeUtf8(chineseString);
    });

    bench('纯JS 方案', () => {
        encodeUtf8Buffer(chineseString);
    });
});

describe('UTF-8 编码 - 混合字符串 (1650 chars)', () => {
    bench('TextEncoder 方案', () => {
        webEncodeUtf8(mixedString);
    });

    bench('纯JS 方案', () => {
        encodeUtf8Buffer(mixedString);
    });
});

describe('UTF-8 编码 - Emoji 字符串 (400 chars)', () => {
    bench('TextEncoder 方案', () => {
        webEncodeUtf8(emojiString);
    });

    bench('纯JS 方案', () => {
        encodeUtf8Buffer(emojiString);
    });
});

// ===================== 解码测试 =====================

describe('UTF-8 解码 - 短字符串 (13 chars)', () => {
    bench('TextDecoder 方案', () => {
        webDecodeUtf8(shortBytes);
    });

    bench('纯JS 方案', () => {
        decodeUtf8Buffer(shortBytes);
    });
});

describe('UTF-8 解码 - 中等字符串 (1000 chars)', () => {
    bench('TextDecoder 方案', () => {
        webDecodeUtf8(mediumBytes);
    });

    bench('纯JS 方案', () => {
        decodeUtf8Buffer(mediumBytes);
    });
});

describe('UTF-8 解码 - 长字符串 (10000 chars)', () => {
    bench('TextDecoder 方案', () => {
        webDecodeUtf8(longBytes);
    });

    bench('纯JS 方案', () => {
        decodeUtf8Buffer(longBytes);
    });
});

describe('UTF-8 解码 - 中文字符串 (400 chars)', () => {
    bench('TextDecoder 方案', () => {
        webDecodeUtf8(chineseBytes);
    });

    bench('纯JS 方案', () => {
        decodeUtf8Buffer(chineseBytes);
    });
});

describe('UTF-8 解码 - 混合字符串 (1650 chars)', () => {
    bench('TextDecoder 方案', () => {
        webDecodeUtf8(mixedBytes);
    });

    bench('纯JS 方案', () => {
        decodeUtf8Buffer(mixedBytes);
    });
});

describe('UTF-8 解码 - Emoji 字符串 (400 chars)', () => {
    bench('TextDecoder 方案', () => {
        webDecodeUtf8(emojiBytes);
    });

    bench('纯JS 方案', () => {
        decodeUtf8Buffer(emojiBytes);
    });
});
