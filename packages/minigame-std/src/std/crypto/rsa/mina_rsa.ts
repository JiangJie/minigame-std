/**
 * @internal
 * 小游戏平台的 RSA 加密实现。
 */

import { Ok, tryResult, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { importPublicKey as importKey, sha1, sha256, sha384, sha512 } from 'rsa-oaep-encryption';
import { encodeBase64Buffer } from '../../base64/mod.ts';
import { decodeUtf8 } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

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
            const decodedData = typeof data === 'string'
                ? data
                // 可能抛异常
                : decodeUtf8(data);
            return publicKey.encrypt(decodedData, shaFactory.create());
        });
    };

    return Promise.resolve(Ok({
        encrypt(data: DataSource): AsyncIOResult<ArrayBuffer> {
            return Promise.resolve(encrypt(data));
        },

        encryptToString(data: DataSource): AsyncIOResult<string> {
            return Promise.resolve(encrypt(data).map(encodeBase64Buffer));
        },
    }));
}

// #region Internal Functions

/**
 * 根据算法名称获取 SHA 哈希工厂。
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

// #endregion