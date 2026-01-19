import type { DataSource } from '../defines.ts';

/**
 * RSA 公钥接口。
 * @since 1.6.0
 */
export interface RSAPublicKey {
    /**
     * 使用 RSA-OAEP 算法加密数据。
     * @param data - 要加密的数据。
     * @returns 加密后的数据。
     */
    encrypt(data: DataSource): Promise<ArrayBuffer>;

    /**
     * 加密后转换为 base64 字符串。
     */
    encryptToString(data: DataSource): Promise<string>;
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
 * const publicKey = await importPublicKey(pemString, hash);
 * ```
 */
export type SHA = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';