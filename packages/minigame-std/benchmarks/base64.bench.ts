/**
 * Base64 编解码性能测试
 *
 * 对比纯 JS 实现和原生 btoa/atob 的性能差异
 *
 * 运行方式：pnpm run bench
 */

import { bench, describe } from 'vitest';
import { decodeBase64, encodeBase64 } from '../src/std/codec/base64.ts';
import { encodeUtf8 } from '../src/std/codec/mod.ts';

// ===================== 原生 btoa/atob 方案 =====================

/**
 * 将字节数组转换为 Latin1 字符串（用于 btoa）
 */
function bytesToBinaryString(bytes: Uint8Array): string {
    let result = '';
    for (const byte of bytes) {
        result += String.fromCharCode(byte);
    }
    return result;
}

/**
 * 将 Latin1 字符串转换为字节数组（用于 atob）
 */
function binaryStringToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}

/**
 * 原生方案：使用 btoa 编码
 * 流程：string → UTF-8 bytes → Latin1 string → btoa → Base64
 */
function encodeBase64Native(data: string): string {
    return btoa(bytesToBinaryString(encodeUtf8(data)));
}

/**
 * 原生方案：使用 atob 解码
 * 流程：Base64 → atob → Latin1 string → bytes → UTF-8 string
 */
function decodeBase64Native(data: string): string {
    return new TextDecoder().decode(binaryStringToBytes(atob(data)));
}

// ===================== 测试数据 =====================

// 原始字符串
const shortString = 'Hello, World!';
const mediumString = 'A'.repeat(1000);
const longString = 'B'.repeat(10000);
const chineseString = '你好世界'.repeat(100);
const mixedString = 'Hello 你好 World 世界 1234567890'.repeat(50);

// 预编码的 Base64 字符串（用于解码测试）
const shortBase64 = encodeBase64(shortString);
const mediumBase64 = encodeBase64(mediumString);
const longBase64 = encodeBase64(longString);
const chineseBase64 = encodeBase64(chineseString);
const mixedBase64 = encodeBase64(mixedString);

// ===================== 编码测试 =====================

describe('编码 - 短字符串 (13 chars)', () => {
    bench('纯 JS 实现', () => {
        encodeBase64(shortString);
    });

    bench('原生 btoa', () => {
        encodeBase64Native(shortString);
    });
});

describe('编码 - 中等字符串 (1000 chars)', () => {
    bench('纯 JS 实现', () => {
        encodeBase64(mediumString);
    });

    bench('原生 btoa', () => {
        encodeBase64Native(mediumString);
    });
});

describe('编码 - 长字符串 (10000 chars)', () => {
    bench('纯 JS 实现', () => {
        encodeBase64(longString);
    });

    bench('原生 btoa', () => {
        encodeBase64Native(longString);
    });
});

describe('编码 - 中文字符串 (400 chars)', () => {
    bench('纯 JS 实现', () => {
        encodeBase64(chineseString);
    });

    bench('原生 btoa', () => {
        encodeBase64Native(chineseString);
    });
});

describe('编码 - 混合字符串 (1650 chars)', () => {
    bench('纯 JS 实现', () => {
        encodeBase64(mixedString);
    });

    bench('原生 btoa', () => {
        encodeBase64Native(mixedString);
    });
});

// ===================== 解码测试 =====================

describe('解码 - 短字符串 (13 chars)', () => {
    bench('纯 JS 实现', () => {
        decodeBase64(shortBase64);
    });

    bench('原生 atob', () => {
        decodeBase64Native(shortBase64);
    });
});

describe('解码 - 中等字符串 (1000 chars)', () => {
    bench('纯 JS 实现', () => {
        decodeBase64(mediumBase64);
    });

    bench('原生 atob', () => {
        decodeBase64Native(mediumBase64);
    });
});

describe('解码 - 长字符串 (10000 chars)', () => {
    bench('纯 JS 实现', () => {
        decodeBase64(longBase64);
    });

    bench('原生 atob', () => {
        decodeBase64Native(longBase64);
    });
});

describe('解码 - 中文字符串 (400 chars)', () => {
    bench('纯 JS 实现', () => {
        decodeBase64(chineseBase64);
    });

    bench('原生 atob', () => {
        decodeBase64Native(chineseBase64);
    });
});

describe('解码 - 混合字符串 (1650 chars)', () => {
    bench('纯 JS 实现', () => {
        decodeBase64(mixedBase64);
    });

    bench('原生 atob', () => {
        decodeBase64Native(mixedBase64);
    });
});
