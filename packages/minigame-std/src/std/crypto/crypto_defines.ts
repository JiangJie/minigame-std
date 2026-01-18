import type { DataSource } from '../defines.ts';

/**
 * The RSA public key.
 */
export interface RSAPublicKey {
    /**
     * Use the RSA-OAEP algorithm to encrypt the data.
     * @param data - The data to encrypt.
     * @returns Encrypted data.
     */
    encrypt(data: DataSource): Promise<ArrayBuffer>;

    /**
     * `encrypt` then convert to base64 string.
     */
    encryptToString(data: DataSource): Promise<string>;
}

/**
 * Supported SHA hash algorithms for RSA-OAEP encryption.
 *
 * @example
 * ```ts
 * import { importPublicKey, type SHA } from 'minigame-std';
 *
 * const hash: SHA = 'SHA-256';
 * const publicKey = await importPublicKey(pemString, hash);
 * ```
 */
export type SHA = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';