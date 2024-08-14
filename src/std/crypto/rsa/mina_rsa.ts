import forge from 'node-forge';
import { encodeBase64 } from '../../base64/mod.ts';
import type { RSAPublicKey } from './rsa_defines.ts';

export function publicKeyFromPem(pem: string): RSAPublicKey {
    const publicKey = forge.pki.publicKeyFromPem(pem);

    return {
        encrypt(data: string): Promise<string> {
            return Promise.resolve(encodeBase64(publicKey.encrypt(data, 'RSA-OAEP')));
        },
    };
}