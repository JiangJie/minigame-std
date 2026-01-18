/**
 * @internal
 * Web platform implementation for RSA encryption.
 */

import { base64FromBuffer } from '../../base64/mod.ts';
import { byteStringToBuffer, textEncode } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import { bufferSource2U8a } from '../../utils/mod.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

/**
 * Encrypt data with a public key.
 * @param publicKey - The public key.
 * @param data - The data to encrypt.
 * @returns
 */
function encrypt(publicKey: CryptoKey, data: DataSource): Promise<ArrayBuffer> {
    const encodedData = typeof data === 'string'
        ? textEncode(data)
        : bufferSource2U8a(data);

    return crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        encodedData,
    );
}

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export async function importPublicKey(pem: string, hash: SHA): Promise<RSAPublicKey> {
    const rMessage = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+/=\s]+?)-----END \1-----/g;
    const match = rMessage.exec(pem);

    if (!match) {
        throw new TypeError('Invalid PEM formatted message');
    }

    pem = match[3];

    const keyData = byteStringToBuffer(atob(pem));

    const publicKey = await crypto.subtle.importKey(
        'spki',
        keyData,
        {
            name: 'RSA-OAEP',
            hash,
        },
        false,
        [
            'encrypt',
        ],
    );

    return {
        encrypt(data: DataSource): Promise<ArrayBuffer> {
            return encrypt(publicKey, data);
        },

        async encryptToString(data: DataSource): Promise<string> {
            return base64FromBuffer(await encrypt(publicKey, data));
        },
    };
}