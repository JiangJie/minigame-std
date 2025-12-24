import invariant from 'tiny-invariant';
import { isMinaEnv } from '../../../macros/env.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';
import { importPublicKey as minaImportPublicKey } from './mina_rsa.ts';
import { importPublicKey as webImportPublicKey } from './web_rsa.ts';

/**
 * 从 PEM 格式的字符串导入 RSA 公钥，用于加密操作。
 * @param pem - PEM 格式的公钥字符串。
 * @param hash - 用于 OAEP 填充的哈希算法（SHA-1、SHA-256、SHA-384 或 SHA-512）。
 * @returns RSA 公钥对象，包含 encrypt 方法用于加密数据。
 * @example
 * ```ts
 * const publicKey = await importPublicKey(pemString, 'SHA-256');
 * const encrypted = await publicKey.encrypt('Hello, World!');
 * console.log(encrypted); // Base64 编码的加密数据
 * ```
 */
export function importPublicKey(pem: string, hash: SHA): Promise<RSAPublicKey> {
    invariant(
        hash === 'SHA-1'
        || hash === 'SHA-256'
        || hash === 'SHA-384'
        || hash === 'SHA-512',
        'Unsupported hash algorithm.',
    );
    return isMinaEnv()
        ? Promise.resolve(minaImportPublicKey(pem, hash))
        : webImportPublicKey(pem, hash);
}