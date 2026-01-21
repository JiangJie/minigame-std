/**
 * @internal
 * 小游戏环境的编解码
 */

// #region Internal Variables

const FORMAT = 'utf8' as const;

// #endregion

/**
 * 将字符串数据编码为 ArrayBuffer。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 ArrayBuffer。
 */
export function encodeUtf8(data: string): ArrayBuffer {
    // 兼容某些平台没有 `encode` 方法
    return typeof wx.encode === 'function'
        ? wx.encode({
            data,
            format: FORMAT,
        })
        : utf8StringToAb(data);
}

/**
 * 将 ArrayBuffer 数据解码为字符串。
 * @param data - 需要解码的 ArrayBuffer。
 * @returns 解码后的字符串。
 */
export function decodeUtf8(data: ArrayBuffer): string {
    // 兼容某些平台没有 `decode` 方法
    return typeof wx.decode === 'function'
        ? wx.decode({
            data,
            format: FORMAT,
        })
        : abToUtf8String(data);
}

// #region Internal Functions

/**
 * 将 utf8 字符串转换为 ArrayBuffer。
 * 当 `wx.encode` 不可用时作为备用实现。
 * @param str - 需要转换的字符串。
 * @returns ArrayBuffer。
 */
function utf8StringToAb(str: string): ArrayBuffer {
    const utf8: number[] = [];

    for (let i = 0; i < str.length; i++) {
        // 使用 codePointAt 获取完整的 Unicode 码点，正确处理代理对
        const codePoint = str.codePointAt(i) as number;

        // 处理不同的 Unicode 范围
        if (codePoint < 0x80) {
            // 1字节
            utf8.push(codePoint);
        } else if (codePoint < 0x800) {
            // 2字节
            utf8.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        } else if (codePoint < 0x10000) {
            // 3字节
            utf8.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        } else {
            // 4字节 (U+10000 及以上)，需要跳过代理对的第二个代码单元
            utf8.push(
                0xf0 | (codePoint >> 18),
                0x80 | ((codePoint >> 12) & 0x3f),
                0x80 | ((codePoint >> 6) & 0x3f),
                0x80 | (codePoint & 0x3f),
            );
            i++; // 跳过代理对的低位部分
        }
    }

    return new Uint8Array(utf8).buffer;
}

/**
 * 将 ArrayBuffer 数据解码为 utf8 字符串。
 * 当 `wx.decode` 不可用时作为备用实现。
 * @param data - 需要解码的 ArrayBuffer。
 * @returns 解码后的字符串。
 */
function abToUtf8String(data: ArrayBuffer): string {
    const u8a = new Uint8Array(data);
    let str = '';
    let i = 0;

    while (i < u8a.length) {
        const byte1 = u8a[i];

        let codePoint: number;

        if (byte1 < 0x80) {
            // 1字节字符
            codePoint = byte1;
            i += 1;
        } else if (byte1 < 0xe0) {
            // 2字节字符
            const byte2 = u8a[i + 1];
            codePoint = ((byte1 & 0x1f) << 6) | (byte2 & 0x3f);
            i += 2;
        } else if (byte1 < 0xf0) {
            // 3字节字符
            const byte2 = u8a[i + 1];
            const byte3 = u8a[i + 2];
            codePoint = ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f);
            i += 3;
        } else if (byte1 < 0xf8) {
            // 4字节字符（码点 >= U+10000，如 emoji）
            const byte2 = u8a[i + 1];
            const byte3 = u8a[i + 2];
            const byte4 = u8a[i + 3];
            codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
            i += 4;
        } else {
            // 无效的 UTF-8 字节序列
            throw new Error('Invalid UTF-8 byte sequence');
        }

        // 使用 fromCodePoint 正确处理所有 Unicode 码点（包括 >= U+10000）
        str += String.fromCodePoint(codePoint);
    }

    return str;
}

// #endregion