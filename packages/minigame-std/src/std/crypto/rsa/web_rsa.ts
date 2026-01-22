/**
 * @internal
 * Web 平台的 RSA 加密实现。
 */

import { Err, tryAsyncResult, type AsyncIOResult } from 'happy-rusty';
import { dataSourceToBytes } from '../../codec/helpers.ts';
import { decodeByteString, encodeBase64 } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { RSAPublicKey, SHA } from '../crypto_defines.ts';

/**
 * 从 PEM 编码的字符串导入用于加密的公钥。
 * @param pem - PEM 编码的字符串。
 * @param hash - 哈希算法。
 * @returns RSA 公钥对象。
 */
export function importPublicKey(pem: string, hash: SHA): AsyncIOResult<RSAPublicKey> {
    const rMessage = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+/=\s]+?)-----END \1-----/g;
    const match = rMessage.exec(pem);

    if (!match) {
        return Promise.resolve(Err(new TypeError('Invalid PEM formatted message')));
    }

    pem = match[3];

    return tryAsyncResult(async () => {
        const keyData = decodeByteString(atob(pem));

        const publicKey = await crypto.subtle.importKey(
            'spki',
            keyData,
            {
                name: 'RSA-OAEP',
                hash,
            },
            false,
            [
                'encrypt',
            ],
        );

        return {
            encrypt(data: DataSource): AsyncIOResult<ArrayBuffer> {
                return encrypt(publicKey, data);
            },

            async encryptToString(data: DataSource): AsyncIOResult<string> {
                const result = await encrypt(publicKey, data);
                return result.map(encodeBase64);
            },
        };
    });
}

// #region Internal Functions

/**
 * 使用公钥加密数据。
 * @param publicKey - 公钥。
 * @param data - 要加密的数据。
 * @returns 加密后的数据。
 */
function encrypt(publicKey: CryptoKey, data: DataSource): AsyncIOResult<ArrayBuffer> {
    return tryAsyncResult(() => {
        return crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            dataSourceToBytes(data),
        );
    });
}

// #endregion