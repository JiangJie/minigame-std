/**
 * @internal
 * 基于哈希的消息认证码实现。需要一个消息摘要对象，
 * 例如可以从 forge.md.sha1 或 forge.md.md5 获取。
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc. All rights reserved.
 */

import { tryAsyncResult, type AsyncIOResult } from 'happy-rusty';
import { ByteStringBuffer, sha1, sha256, sha384, sha512, type HashAlgorithmCreator } from 'rsa-oaep-encryption';
import { encodeByteString } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { SHA } from '../crypto_defines.ts';

/**
 * 创建一个使用指定消息摘要对象的 HMAC 对象。
 *
 * @param sha - SHA 哈希算法。
 * @param key - 密钥，可以是字符串或 BufferSource。
 * @param data - 需要计算 HMAC 的数据，可以是字符串或 BufferSource。
 * @returns HMAC 计算结果的十六进制字符串。
 */
export function createHMAC(sha: SHA, key: DataSource, data: DataSource): AsyncIOResult<string> {
    return tryAsyncResult(() => {
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

        let keyBuffer = new ByteStringBuffer(encodeByteString(key));

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

        // 更新消息
        shaAlgorithm.update(encodeByteString(data));

        // 计算最终摘要: hash(opadding | hash(ipadding | message))
        const inner = shaAlgorithm.digest().bytes();
        shaAlgorithm.start();
        shaAlgorithm.update(opadding.bytes());
        shaAlgorithm.update(inner);

        return shaAlgorithm.digest().toHex();
    });
}
