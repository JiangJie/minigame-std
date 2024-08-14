// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { cryptos, textDecode, textEncode } from '../src/mod.ts';

Deno.test('calculate md5', () => {
    const data = 'minigame-std';
    const md5Str = 'e1937f8f99218d8b92587af454df4f39';

    assert(cryptos.md5(data) === md5Str);
    assert(cryptos.md5(textEncode(data)) === md5Str);
});

Deno.test('calculate sha1', async () => {
    const data = 'minigame-std';
    const sha1Str = '89d4f4548e9c58c7272971b7d2cf018aea78ed1a';

    assert(await cryptos.sha1(data) === sha1Str);
    assert(await cryptos.sha1(textEncode(data)) === sha1Str);
});

Deno.test('RSA encryption', async () => {
    const data = 'minigame-std';

    function str2U8a(str: string): Uint8Array {
        const { length } = str;
        const u8a = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            u8a[i] = str.charCodeAt(i);
        }

        return u8a;
    }

    function importDecryptKey(pem: string): Promise<CryptoKey> {
        pem = pem.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\s)/g, '');

        const publicKey = str2U8a(atob(pem));

        return crypto.subtle.importKey(
            'pkcs8',
            publicKey,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            false,
            [
                'decrypt',
            ]
        );
    }

    const publicKey = await cryptos.rsa.importEncryptKey(Deno.readTextFileSync(`${ import.meta.dirname }/keys/public_key.pem`), 'SHA-256');
    const privateKey = await importDecryptKey(Deno.readTextFileSync(`${ import.meta.dirname }/keys/private_key.pem`));

    const encryptedData = await cryptos.rsa.encrypt(publicKey, data);
    const decryptedData = textDecode(await crypto.subtle.decrypt(
        {
            name: 'RSA-OAEP',
        },
        privateKey,
        encryptedData
    ));

    assert(decryptedData === data);
});