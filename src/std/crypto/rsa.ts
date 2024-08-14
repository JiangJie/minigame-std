import { textEncode } from '../codec/mod.ts';
import { bufferSource2U8a } from '../utils/mod.ts';

/**
 * Supported hash algorithms.
 */
type SHA = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

/**
 * Convert a string to an Uint8Array.
 * @param str
 * @returns
 */
function str2U8a(str: string): Uint8Array {
    const { length } = str;
    const u8a = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        u8a[i] = str.charCodeAt(i);
    }

    return u8a;
}

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export function importEncryptKey(pem: string, hash: SHA): Promise<CryptoKey> {
    pem = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\s)/g, '');

    const publicKey = str2U8a(atob(pem));

    return crypto.subtle.importKey(
        'spki',
        publicKey,
        {
            name: 'RSA-OAEP',
            hash,
        },
        false,
        [
            'encrypt',
        ]
    );
}

/**
 * Encrypt data with a public key.
 * @param publicKey - The public key.
 * @param data - The data to encrypt.
 * @returns
 */
export function encrypt(publicKey: CryptoKey, data: string | BufferSource): Promise<ArrayBuffer> {
    const encodedData = typeof data === 'string'
        ? textEncode(data)
        : bufferSource2U8a(data);

    return crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        encodedData
    );
}