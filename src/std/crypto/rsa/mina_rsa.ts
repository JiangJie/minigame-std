import forge from 'node-forge';
import type { RSAPublicKey, SHA } from './rsa_defines.ts';

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export function publicKeyFromPem(pem: string, hash: SHA): RSAPublicKey {
    const publicKey = forge.pki.publicKeyFromPem(pem);

    return {
        encrypt(data: string): Promise<string> {
            // eg: SHA-1 => sha1
            const md = hash.toLowerCase().replace('-', '');
            const encryptedData = publicKey.encrypt(data, 'RSA-OAEP', {
                // bypassing ts errors
                md: forge.md[md as 'sha1'].create(),
            });

            return Promise.resolve(forge.util.encode64(encryptedData));
        },
    };
}