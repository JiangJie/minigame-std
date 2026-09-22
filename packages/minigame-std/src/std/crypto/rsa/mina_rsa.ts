/**
 * @internal
 * 小游戏平台的 RSA 加密实现。
 */

import { Ok, tryResult, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { importPublicKey as importKey, sha1, sha256, sha384, sha512 } from 'rsa-oaep-encryption';
import { decodeUtf8, encodeBase64 } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

// #region Internal Variables

// 用 Record 而不是 switch：SHA 联合类型在编译期保证穷尽，运行时不产生不可达分支。
const SHA_FACTORIES: Record<SHA, typeof sha1> = {
    'SHA-1': sha1,
    'SHA-256': sha256,
    'SHA-384': sha384,
    'SHA-512': sha512,
};

// #endregion

/**
 * 从 PEM 编码的字符串导入用于加密的公钥。
 * @param pem - PEM 编码的字符串。
 * @param hash - 哈希算法。
 * @returns RSA 公钥对象。
 */
export function importPublicKey(pem: string, hash: SHA): AsyncIOResult<RSAPublicKey> {
    const publicKeyRes = tryResult(() => importKey(pem));
    if (publicKeyRes.isErr()) return Promise.resolve(publicKeyRes.asErr());

    const shaFactory = getShaFactory(hash);
    const publicKey = publicKeyRes.unwrap();

    const encrypt = (data: DataSource): IOResult<ArrayBuffer> => {
        return tryResult(() => {
            const decodedData =
                typeof data === 'string'
                    ? data
                    : // 可能抛异常
                      decodeUtf8(data);
            return publicKey.encrypt(decodedData, shaFactory.create());
        });
    };

    return Promise.resolve(
        Ok({
            encrypt(data: DataSource): AsyncIOResult<ArrayBuffer> {
                return Promise.resolve(encrypt(data));
            },

            encryptToString(data: DataSource): AsyncIOResult<string> {
                return Promise.resolve(encrypt(data).map(encodeBase64));
            },
        }),
    );
}

// #region Internal Functions

/**
 * 根据算法名称获取 SHA 哈希工厂。
 */
function getShaFactory(hash: SHA): typeof sha1 {
    return SHA_FACTORIES[hash];
}

// #endregion
