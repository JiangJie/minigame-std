import invariant from 'tiny-invariant';
import { isMinaEnv } from '../../../macros/env.ts';
import { importPublicKey as minaImportPublicKey } from './mina_rsa.ts';
import type { RSAPublicKey, SHA } from './rsa_defines.ts';
import { importPublicKey as webImportPublicKey } from './web_rsa.ts';

export * from './rsa_defines.ts';

/**
 * Import a public key from a PEM encoded string for encryption.
 * @param pem - PEM encoded string.
 * @param hash - Hash algorithm.
 * @returns
 */
export function importPublicKey(pem: string, hash: SHA): Promise<RSAPublicKey> {
    invariant(
        hash === 'SHA-1'
        || hash === 'SHA-256'
        || hash === 'SHA-384'
        || hash === 'SHA-512',
        'Unsupported hash algorithm.'
    );
    return isMinaEnv()
        ? Promise.resolve(minaImportPublicKey(pem, hash))
        : webImportPublicKey(pem, hash);
}