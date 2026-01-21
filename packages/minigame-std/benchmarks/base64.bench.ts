/**
 * Base64 编解码性能测试
 *
 * 比较两种实现方式：
 * 1. btoa/atob 方案：使用浏览器原生 API
 * 2. 纯 JS 方案：纯 JavaScript 循环编解码
 *
 * 运行方式：pnpm run bench
 */

import { bench, describe } from 'vitest';
import { decodeBase64Buffer, encodeBase64Buffer } from '../src/std/base64/base64.ts';
import { decodeBase64 as webDecodeBase64, encodeBase64 as webEncodeBase64 } from '../src/std/base64/web_base64.ts';
import { decodeUtf8, encodeUtf8 } from '../src/std/codec/mod.ts';

// 测试数据 - 原始字符串
const shortString = 'Hello, World!';
const mediumString = 'A'.repeat(1000);
const longString = 'B'.repeat(10000);
const chineseString = '你好世界'.repeat(100);
const mixedString = 'Hello 你好 World 世界 1234567890'.repeat(50);

// 测试数据 - 预编码的 Base64 字符串（用于解码测试）
const shortBase64 = encodeBase64Buffer(encodeUtf8(shortString));
const mediumBase64 = encodeBase64Buffer(encodeUtf8(mediumString));
const longBase64 = encodeBase64Buffer(encodeUtf8(longString));
const chineseBase64 = encodeBase64Buffer(encodeUtf8(chineseString));
const mixedBase64 = encodeBase64Buffer(encodeUtf8(mixedString));

// ===================== 编码测试 =====================

describe('编码 - 短字符串 (13 chars)', () => {
    bench('btoa 方案', () => {
        webEncodeBase64(shortString);
    });

    bench('纯JS 方案', () => {
        encodeBase64Buffer(encodeUtf8(shortString));
    });
});

describe('编码 - 中等字符串 (1000 chars)', () => {
    bench('btoa 方案', () => {
        webEncodeBase64(mediumString);
    });

    bench('纯JS 方案', () => {
        encodeBase64Buffer(encodeUtf8(mediumString));
    });
});

describe('编码 - 长字符串 (10000 chars)', () => {
    bench('btoa 方案', () => {
        webEncodeBase64(longString);
    });

    bench('纯JS 方案', () => {
        encodeBase64Buffer(encodeUtf8(longString));
    });
});

describe('编码 - 中文字符串 (400 chars)', () => {
    bench('btoa 方案', () => {
        webEncodeBase64(chineseString);
    });

    bench('纯JS 方案', () => {
        encodeBase64Buffer(encodeUtf8(chineseString));
    });
});

describe('编码 - 混合字符串 (1650 chars)', () => {
    bench('btoa 方案', () => {
        webEncodeBase64(mixedString);
    });

    bench('纯JS 方案', () => {
        encodeBase64Buffer(encodeUtf8(mixedString));
    });
});

// ===================== 解码测试 =====================

describe('解码 - 短字符串 (13 chars)', () => {
    bench('atob 方案', () => {
        webDecodeBase64(shortBase64);
    });

    bench('纯JS 方案', () => {
        decodeUtf8(decodeBase64Buffer(shortBase64));
    });
});

describe('解码 - 中等字符串 (1000 chars)', () => {
    bench('atob 方案', () => {
        webDecodeBase64(mediumBase64);
    });

    bench('纯JS 方案', () => {
        decodeUtf8(decodeBase64Buffer(mediumBase64));
    });
});

describe('解码 - 长字符串 (10000 chars)', () => {
    bench('atob 方案', () => {
        webDecodeBase64(longBase64);
    });

    bench('纯JS 方案', () => {
        decodeUtf8(decodeBase64Buffer(longBase64));
    });
});

describe('解码 - 中文字符串 (400 chars)', () => {
    bench('atob 方案', () => {
        webDecodeBase64(chineseBase64);
    });

    bench('纯JS 方案', () => {
        decodeUtf8(decodeBase64Buffer(chineseBase64));
    });
});

describe('解码 - 混合字符串 (1650 chars)', () => {
    bench('atob 方案', () => {
        webDecodeBase64(mixedBase64);
    });

    bench('纯JS 方案', () => {
        decodeUtf8(decodeBase64Buffer(mixedBase64));
    });
});
