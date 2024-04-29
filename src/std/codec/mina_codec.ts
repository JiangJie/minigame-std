/**
 * 小游戏环境的编解码
 */

const FORMAT = 'utf8';

export function encode(data: string): ArrayBuffer {
    return wx.encode({
        data,
        format: FORMAT,
    });
}

export function decode(data: ArrayBuffer): string {
    return wx.decode({
        data,
        format: FORMAT,
    });
}