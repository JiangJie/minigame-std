/**
 * @internal
 * 基于哈希的消息认证码实现。需要一个消息摘要对象，
 * 例如可以从 forge.md.sha1 或 forge.md.md5 获取。
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc. All rights reserved.
 */

import { ByteStringBuffer, sha1, sha256, sha384, sha512, type HashAlgorithmCreator } from 'rsa-oaep-encryption';
import type { SHA } from '../crypto_defines.ts';

/**
 * 创建一个使用指定消息摘要对象的 HMAC 对象。
 *
 * @returns HMAC 对象。
 */
export function createHMAC(sha: SHA, key: string) {
    let shaAlgorithmCreator: HashAlgorithmCreator;

    switch (sha) {
        case 'SHA-1': {
            shaAlgorithmCreator = sha1;
            break;
        }
        case 'SHA-256': {
            shaAlgorithmCreator = sha256;
            break;
        }
        case 'SHA-384': {
            shaAlgorithmCreator = sha384;
            break;
        }
        case 'SHA-512': {
            shaAlgorithmCreator = sha512;
            break;
        }
    }

    const shaAlgorithm = shaAlgorithmCreator.create();

    let keyBuffer = new ByteStringBuffer(key);

    // 如果密钥长度超过 blocksize，则对其进行哈希
    let keylen = keyBuffer.length();
    if (keylen > shaAlgorithm.blockLength) {
        shaAlgorithm.start();
        shaAlgorithm.update(keyBuffer.bytes());
        keyBuffer = shaAlgorithm.digest();
    }

    // 将密钥混合到内部和外部填充中
    // ipadding = [0x36 * blocksize] ^ key
    // opadding = [0x5C * blocksize] ^ key
    const ipadding = new ByteStringBuffer();
    const opadding = new ByteStringBuffer();

    keylen = keyBuffer.length();
    for (let i = 0; i < keylen; ++i) {
        const tmp = keyBuffer.at(i);
        ipadding.putByte(0x36 ^ tmp);
        opadding.putByte(0x5c ^ tmp);
    }

    // 如果密钥短于 blocksize，添加额外的填充
    if (keylen < shaAlgorithm.blockLength) {
        const tmp = shaAlgorithm.blockLength - keylen;
        for (let i = 0; i < tmp; ++i) {
            ipadding.putByte(0x36);
            opadding.putByte(0x5c);
        }
    }

    // 摘要计算方式如下: hash(opadding | hash(ipadding | message))

    // 准备进行内部哈希
    // hash(ipadding | message)
    shaAlgorithm.start();
    shaAlgorithm.update(ipadding.bytes());

    // HMAC 上下文
    const ctx = {
        /**
         * 使用给定的消息字节更新 HMAC。
         *
         * @param bytes - 要更新的字节。
         */
        update(bytes: string) {
            shaAlgorithm.update(bytes);
        },

        /**
         * 生成消息认证码 (MAC)。
         *
         * @returns 包含摘要值的字节缓冲区。
         */
        digest() {
            // 摘要计算方式如下: hash(opadding | hash(ipadding | message))
            // 这里我们进行外部哈希
            const inner = shaAlgorithm.digest().bytes();
            shaAlgorithm.start();
            shaAlgorithm.update(opadding.bytes());
            shaAlgorithm.update(inner);
            return shaAlgorithm.digest();
        },
    };

    return ctx;
}
