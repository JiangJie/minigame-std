import type { AsyncIOResult } from 'happy-rusty';
import type { DataSource } from '../defines.ts';

/**
 * RSA 公钥接口，用于加密数据。
 * @since 1.6.0
 * @example
 * ```ts
 * import { cryptos } from 'minigame-std';
 *
 * const publicKey = (await cryptos.rsa.importPublicKey(pemString, 'SHA-256')).unwrap();
 *
 * // 加密并返回 ArrayBuffer
 * const encrypted = (await publicKey.encrypt('Hello, World!')).unwrap();
 *
 * // 加密并返回 Base64 字符串
 * const encryptedStr = (await publicKey.encryptToString('Hello, World!')).unwrap();
 * ```
 */
export interface RSAPublicKey {
    /**
     * 使用 RSA-OAEP 算法加密数据。
     * @param data - 要加密的数据。
     * @returns 加密后的 ArrayBuffer。
     */
    encrypt(data: DataSource): AsyncIOResult<ArrayBuffer>;

    /**
     * 加密后转换为 Base64 字符串。
     * @param data - 要加密的数据。
     * @returns 加密后的 Base64 字符串。
     */
    encryptToString(data: DataSource): AsyncIOResult<string>;
}

/**
 * RSA-OAEP 加密支持的 SHA 哈希算法。
 *
 * @since 1.6.0
 * @example
 * ```ts
 * import { importPublicKey, type SHA } from 'minigame-std';
 *
 * const hash: SHA = 'SHA-256';
 * const publicKey = (await importPublicKey(pemString, hash)).unwrap();
 * ```
 */
export type SHA = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';