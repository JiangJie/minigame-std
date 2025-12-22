/**
 * @internal
 * Mini-game platform implementation for random number generation.
 */

import { type AsyncIOResult } from 'happy-rusty';
import { hexFromBuffer } from '../../codec/mod.ts';
import { miniGameFailureToError, promisifyWithResult } from '../../utils/mod.ts';
import type { UUID } from './random_defines.ts';

export async function getRandomValues(length: number): AsyncIOResult<Uint8Array<ArrayBuffer>> {
    return (await promisifyWithResult(wx.getUserCryptoManager().getRandomValues)({
        length,
    }))
        .map(x => new Uint8Array(x.randomValues))
        .mapErr(miniGameFailureToError);
}

export async function randomUUID(): AsyncIOResult<UUID> {
    return (await getRandomValues(16)).map(bytes => {
        // 设置版本号（4）和变体（8, 9, A, B）
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // 0100xxxx
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // 10xxxxxx

        const hex = hexFromBuffer(bytes);
        return `${ hex.slice(0, 8) }-${ hex.slice(8, 12) }-${ hex.slice(12, 16) }-${ hex.slice(16, 20) }-${ hex.slice(20) }` as UUID;
    });
}