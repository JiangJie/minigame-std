import { Ok, type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../../macros/env';
import {
    getRandomValues as minaGetRandomValues,
    randomUUID as minaRandomUUID,
} from './mina_random.ts';
import type { UUID } from './random_defines.ts';
import {
    getRandomValues as webGetRandomValues,
    randomUUID as webRandomUUID,
} from './web_random.ts';

export * from './random_defines.ts';

/**
 * 获取密码学安全随机数。
 * @param length - 要生成的字节数。
 * @returns 生成的随机数 Buffer。
 */
export function getRandomValues(length: number): AsyncIOResult<Uint8Array> {
    return isMinaEnv()
        ? minaGetRandomValues(length)
        : Promise.resolve(Ok(webGetRandomValues(length)))
}

/**
 * 生成 UUID。
 * @returns UUID 字符串。
 */
export function randomUUID(): AsyncIOResult<UUID> {
    return isMinaEnv()
        ? minaRandomUUID()
        : Promise.resolve(Ok(webRandomUUID()))
}