import { textEncode } from '../codec/mod.ts';

/**
 * Supported hash algorithms.
 */
type SHA = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

/**
 * The header of a PEM encoded public key.
 */
const PEM_HEADER = '-----BEGIN PUBLIC KEY-----' as const;

/**
 * The footer of a PEM encoded public key.
 */
const PEM_FOOTER = '-----END PUBLIC KEY-----' as const;

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
 * Import a public key from a PEM encoded string.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export function importPublicKey(pem: string, hash: SHA): Promise<CryptoKey> {
    if (pem.startsWith(PEM_HEADER)) {
        pem = pem.slice(PEM_HEADER.length);
    }
    if (pem.endsWith(PEM_FOOTER)) {
        pem = pem.slice(0, pem.length - PEM_FOOTER.length);
    }

    const publicKey = str2U8a(atob(pem));

    return crypto.subtle.importKey(
        'spki',
        publicKey,
        {
            name: 'RSA-OAEP',
            hash,
        },
        true,
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
export function encrypt(publicKey: CryptoKey, data: string): Promise<ArrayBuffer> {
    const encodedData = textEncode(data);
    return crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        encodedData
    );
}