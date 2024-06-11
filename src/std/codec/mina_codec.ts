/**
 * 小游戏环境的编解码
 */

const FORMAT = 'utf8' as const;

/**
 * 将字符串数据编码为 ArrayBuffer。
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 ArrayBuffer。
 */
export function encode(data: string): ArrayBuffer {
    return wx.encode({
        data,
        format: FORMAT,
    });
}

/**
 * 将 ArrayBuffer 数据解码为字符串。
 * @param data - 需要解码的 ArrayBuffer。
 * @returns 解码后的字符串。
 */
export function decode(data: ArrayBuffer): string {
    return wx.decode({
        data,
        format: FORMAT,
    });
}