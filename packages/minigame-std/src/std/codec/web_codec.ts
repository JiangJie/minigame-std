/**
 * @internal
 * Web环境的编解码
 */

import { Lazy } from 'happy-rusty';

// #region Internal Variables

const encoder = Lazy(() => new TextEncoder());
const decoder = Lazy(() => new TextDecoder());

// #endregion

/**
 * 将字符串数据编码为 `Uint8Array`
 * @param data - 需要编码的字符串数据。
 * @returns 编码后的 `Uint8Array`
 */
export function textEncode(data: string): Uint8Array<ArrayBuffer> {
    return encoder.force().encode(data);
}

/**
 * 将二进制数据解码为字符串。
 * @param data - 需要解码的二进制数据。
 * @returns 解码后的字符串。
 */
export function textDecode(data: AllowSharedBufferSource): string {
    return decoder.force().decode(data);
}