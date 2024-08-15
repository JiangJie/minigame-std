import { base64FromBuffer } from '../../base64/mod.ts';
import { byteStringToBuffer, textEncode } from '../../codec/mod.ts';
import { bufferSource2U8a } from '../../utils/mod.ts';
import type { RSAPublicKey, SHA } from './rsa_defines.ts';

/**
 * Encrypt data with a public key.
 * @param publicKey - The public key.
 * @param data - The data to encrypt.
 * @returns
 */
function encrypt(publicKey: CryptoKey, data: string | BufferSource): Promise<ArrayBuffer> {
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

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export async function publicKeyFromPem(pem: string, hash: SHA): Promise<RSAPublicKey> {
    pem = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\s)/g, '');

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
        ]
    );

    return {
        async encrypt(data: string | BufferSource): Promise<string> {
            return base64FromBuffer(await encrypt(publicKey, data));
        },
    };
}