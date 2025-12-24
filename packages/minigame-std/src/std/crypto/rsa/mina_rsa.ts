/**
 * @internal
 * Mini-game platform implementation for RSA encryption.
 */

import { importPublicKey as importKey, sha1, sha256, sha384, sha512 } from 'rsa-oaep-encryption';
import { base64FromBuffer } from '../../base64/mod.ts';
import { textDecode } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

const SHAs = {
    'sha1': sha1,
    'sha256': sha256,
    'sha384': sha384,
    'sha512': sha512,
};

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export function importPublicKey(pem: string, hash: SHA): RSAPublicKey {
    const publicKey = importKey(pem);

    const encrypt = (data: DataSource): ArrayBuffer => {
        // eg: SHA-1 => sha1
        const sha = hash.replace('-', '').toLowerCase();
        const decodedData = typeof data === 'string'
            ? data
            : textDecode(data);
        return publicKey.encrypt(decodedData, SHAs[sha as 'sha1'].create());
    };

    return {
        encrypt(data: DataSource): Promise<ArrayBuffer> {
            return Promise.resolve(encrypt(data));
        },

        encryptToString(data: DataSource): Promise<string> {
            return Promise.resolve(base64FromBuffer(encrypt(data)));
        },
    };
}