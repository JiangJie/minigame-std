/**
 * @internal
 * Mini-game platform implementation for RSA encryption.
 */

import { importPublicKey as importKey, sha1, sha256, sha384, sha512 } from 'rsa-oaep-encryption';
import { base64FromBuffer } from '../../base64/mod.ts';
import { textDecode } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

/**
 * Get SHA hash factory by algorithm name.
 */
function getShaFactory(hash: SHA): typeof sha1 {
    switch (hash) {
        case 'SHA-1': {
            return sha1;
        }
        case 'SHA-256': {
            return sha256;
        }
        case 'SHA-384': {
            return sha384;
        }
        case 'SHA-512': {
            return sha512;
        }
    }
}

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export function importPublicKey(pem: string, hash: SHA): RSAPublicKey {
    const publicKey = importKey(pem);
    const shaFactory = getShaFactory(hash);

    const encrypt = (data: DataSource): ArrayBuffer => {
        const decodedData = typeof data === 'string'
            ? data
            : textDecode(data);
        return publicKey.encrypt(decodedData, shaFactory.create());
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