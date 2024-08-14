import { isMinaEnv } from '../../../macros/env.ts';
import { publicKeyFromPem as minaPublicKeyFromPem } from './mina_rsa.ts';
import type { RSAPublicKey, SHA } from './rsa_defines.ts';
import { publicKeyFromPem as webPublicKeyFromPem } from './web_rsa.ts';

export * from './rsa_defines.ts';

export function publicKeyFromPem(pem: string, hash: SHA): Promise<RSAPublicKey> {
    return isMinaEnv()
        ? Promise.resolve(minaPublicKeyFromPem(pem))
        : webPublicKeyFromPem(pem, hash);
}