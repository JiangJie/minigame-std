/**
 * @internal
 * 小游戏平台的随机数生成实现。
 */

import { Lazy, type AsyncIOResult } from 'happy-rusty';
import { hexFromBuffer } from '../../codec/mod.ts';
import { asyncIOResultify } from '../../utils/mod.ts';
import type { UUID } from './random_defines.ts';

/**
 * 缓存加密模块。
 */
const cryptoManager = Lazy(() => wx.getUserCryptoManager());

/**
 * 生成指定长度的加密随机字节数组。
 * @param length - 要生成的随机字节数。
 * @returns 返回包含随机字节的 Uint8Array。
 */
export async function getRandomValues(length: number): AsyncIOResult<Uint8Array<ArrayBuffer>> {
    const result = await asyncIOResultify(cryptoManager.force().getRandomValues)({
        length,
    });

    return result.map(x => new Uint8Array(x.randomValues));
}

/**
 * 生成符合 RFC 4122 规范的 UUID v4。
 * @returns 返回生成的 UUID 字符串。
 */
export async function randomUUID(): AsyncIOResult<UUID> {
    const bytesRes = await getRandomValues(16);

    return bytesRes.map<UUID>(bytes => {
        // 设置版本号（4）和变体（8, 9, A, B）
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // 0100xxxx
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // 10xxxxxx

        const hex = hexFromBuffer(bytes);
        return `${ hex.slice(0, 8) }-${ hex.slice(8, 12) }-${ hex.slice(12, 16) }-${ hex.slice(16, 20) }-${ hex.slice(20) }`;
    });
}