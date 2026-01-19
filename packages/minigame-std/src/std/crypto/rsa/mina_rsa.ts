/**
 * @internal
 * 小游戏平台的 RSA 加密实现。
 */

import { importPublicKey as importKey, sha1, sha256, sha384, sha512 } from 'rsa-oaep-encryption';
import { base64FromBuffer } from '../../base64/mod.ts';
import { textDecode } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

/**
 * 从 PEM 编码的字符串导入用于加密的公钥。
 * @param pem - PEM 编码的字符串。
 * @param hash - 哈希算法。
 * @returns RSA 公钥对象。
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