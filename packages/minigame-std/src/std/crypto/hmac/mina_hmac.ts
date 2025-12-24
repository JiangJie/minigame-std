/**
 * @internal
 * Hash-based Message Authentication Code implementation. Requires a message
 * digest object that can be obtained, for example, from forge.md.sha1 or
 * forge.md.md5.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc. All rights reserved.
 */

import { ByteStringBuffer, sha1, sha256, sha384, sha512, type HashAlgorithmCreator } from 'rsa-oaep-encryption';
import type { SHA } from '../crypto_defines.ts';

/**
 * Creates an HMAC object that uses the given message digest object.
 *
 * @return an HMAC object.
 */
export function createHMAC(sha: SHA, key: string) {
    let shaAlgorithmCreator: HashAlgorithmCreator;

    switch (sha.replace('-', '').toLowerCase()) {
        case 'sha1': {
            shaAlgorithmCreator = sha1;
            break;
        }
        case 'sha256': {
            shaAlgorithmCreator = sha256;
            break;
        }
        case 'sha384': {
            shaAlgorithmCreator = sha384;
            break;
        }
        case 'sha512': {
            shaAlgorithmCreator = sha512;
            break;
        }
        default: {
            throw new Error(`Unsupported hash algorithm ${ sha }`);
        }
    }

    const shaAlgorithm = shaAlgorithmCreator.create();

    let keyBuffer = new ByteStringBuffer(key);

    // if key is longer than blocksize, hash it
    let keylen = keyBuffer.length();
    if (keylen > shaAlgorithm.blockLength) {
        shaAlgorithm.start();
        shaAlgorithm.update(keyBuffer.bytes());
        keyBuffer = shaAlgorithm.digest();
    }

    // mix key into inner and outer padding
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

    // if key is shorter than blocksize, add additional padding
    if (keylen < shaAlgorithm.blockLength) {
        const tmp = shaAlgorithm.blockLength - keylen;
        for (let i = 0; i < tmp; ++i) {
            ipadding.putByte(0x36);
            opadding.putByte(0x5c);
        }
    }

    // digest is done like so: hash(opadding | hash(ipadding | message))

    // prepare to do inner hash
    // hash(ipadding | message)
    shaAlgorithm.start();
    shaAlgorithm.update(ipadding.bytes());

    // hmac context
    const ctx = {
        /**
         * Updates the HMAC with the given message bytes.
         *
         * @param bytes the bytes to update with.
         */
        update(bytes: string) {
            shaAlgorithm.update(bytes);
        },

        /**
         * Produces the Message Authentication Code (MAC).
         *
         * @return a byte buffer containing the digest value.
         */
        digest() {
            // digest is done like so: hash(opadding | hash(ipadding | message))
            // here we do the outer hashing
            const inner = shaAlgorithm.digest().bytes();
            shaAlgorithm.start();
            shaAlgorithm.update(opadding.bytes());
            shaAlgorithm.update(inner);
            return shaAlgorithm.digest();
        },
    };

    return ctx;
}
