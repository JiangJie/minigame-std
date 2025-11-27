import { Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { Future } from 'tiny-future';
import { hexFromBuffer } from '../../codec/mod.ts';
import { miniGameFailureToResult } from '../../utils/mod.ts';
import type { UUID } from './random_defines.ts';

export function getRandomValues(length: number): AsyncIOResult<Uint8Array<ArrayBuffer>> {
    const future = new Future<IOResult<Uint8Array<ArrayBuffer>>>();

    wx.getUserCryptoManager().getRandomValues({
        length,
        success(res): void {
            future.resolve(Ok(new Uint8Array(res.randomValues)));
        },
        fail(err): void {
            future.resolve(miniGameFailureToResult(err));
        },
    });

    return future.promise;
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