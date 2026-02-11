import { Ok, type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../../macros/env.ts';
import { validatePositiveInteger } from '../../internal/mod.ts';
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
 * 获取密码学安全的随机数。
 * @param length - 要生成的随机字节数。
 * @returns 包含随机数据的 Uint8Array，封装在 IOResult 中。
 * @since 1.7.0
 * @example
 * ```ts
 * const result = await getRandomValues(16);
 * if (result.isOk()) {
 *     console.log(result.unwrap()); // Uint8Array(16) [...]
 * }
 * ```
 */
export function getRandomValues(length: number): AsyncIOResult<Uint8Array<ArrayBuffer>> {
    const validateResult = validatePositiveInteger(length, 'length');
    if (validateResult.isErr()) {
        return Promise.resolve(validateResult.asErr());
    }

    return isMinaEnv()
        ? minaGetRandomValues(length)
        : Promise.resolve(webGetRandomValues(length));
}

/**
 * 生成符合 RFC 4122 标准的 UUID v4。
 * @returns UUID 字符串，封装在 IOResult 中。
 * @since 1.7.0
 * @example
 * ```ts
 * const result = await randomUUID();
 * if (result.isOk()) {
 *     console.log(result.unwrap()); // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 * }
 * ```
 */
export function randomUUID(): AsyncIOResult<UUID> {
    return isMinaEnv()
        ? minaRandomUUID()
        : Promise.resolve(Ok(webRandomUUID()));
}