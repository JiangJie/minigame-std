/**
 * The RSA public key.
 */
export interface RSAPublicKey {
    /**
     * Use the RSA-OAEP algorithm to encrypt the data.
     * @param data - The data to encrypt.
     * @returns Encrypted data.
     */
    encrypt(data: string): Promise<ArrayBuffer>;

    /**
     * `encrypt` then convert to base64 string.
     */
    encryptToString(data: string): Promise<string>;
}

/**
 * Supported hash algorithms.
 */
export type SHA = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';