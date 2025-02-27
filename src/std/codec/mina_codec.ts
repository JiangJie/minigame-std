/**
 * 小游戏环境的编解码
 */

const FORMAT = 'utf8' as const;

/**
 * 将字符串数据编码为 ArrayBuffer。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 ArrayBuffer。
 */
export function textEncode(data: string): ArrayBuffer {
    // 兼容某些平台没有 `encode` 方法
    return typeof wx.encode === 'function'
        ? wx.encode({
            data,
            format: FORMAT,
        })
        : utf8String2AB(data);
}

/**
 * 将 ArrayBuffer 数据解码为字符串。
 * @param data - 需要解码的 ArrayBuffer。
 * @returns 解码后的字符串。
 */
export function textDecode(data: ArrayBuffer): string {
    // 兼容某些平台没有 `decode` 方法
    return typeof wx.decode === 'function'
        ? wx.decode({
            data,
            format: FORMAT,
        })
        : ab2Utf8String(data);
}

/**
 * 将 utf8 字符串转换为 ArrayBuffer。
 * @param str - 需要转换的字符串。
 * @returns ArrayBuffer。
 */
function utf8String2AB(str: string): ArrayBuffer {
    // 创建一个 Uint8Array，长度为字符串的 UTF-8 编码后的字节数
    const utf8: number[] = [];

    for (let i = 0; i < str.length; i++) {
        const codePoint = str.charCodeAt(i);

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
        } else if (codePoint < 0x110000) {
            // 4字节
            utf8.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        }
    }

    return new Uint8Array(utf8).buffer;
}

/**
 * 将 ArrayBuffer 数据解码为 utf8 字符串。
 * @param data - 需要解码的 ArrayBuffer。
 * @returns 解码后的字符串。
 */
function ab2Utf8String(data: ArrayBuffer): string {
    const u8a = new Uint8Array(data);
    let str = '';
    let i = 0;

    while (i < u8a.length) {
        const byte1 = u8a[i];

        if (byte1 < 0x80) {
            // 1字节字符
            str += String.fromCharCode(byte1);
            i += 1;
        } else if (byte1 < 0xe0) {
            // 2字节字符
            const byte2 = u8a[i + 1];
            str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
            i += 2;
        } else if (byte1 < 0xf0) {
            // 3字节字符
            const byte2 = u8a[i + 1];
            const byte3 = u8a[i + 2];
            str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
            i += 3;
        } else if (byte1 < 0xF8) {
            // 4字节字符
            const byte2 = u8a[i + 1];
            const byte3 = u8a[i + 2];
            const byte4 = u8a[i + 3];
            str += String.fromCharCode(((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f));
            i += 4;
        } else {
            // 无效的 UTF-8 字节序列
            throw new Error('Invalid UTF-8 byte sequence');
        }
    }

    return str;
}