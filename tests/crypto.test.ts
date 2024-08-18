// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert, assertRejects, assertThrows } from '@std/assert';
import { base64ToBuffer, byteStringToBuffer, cryptos, textDecode, textEncode } from '../src/mod.ts';

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

    function importDecryptKey(pem: string, sha: string): Promise<CryptoKey> {
        pem = pem.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\s)/g, '');

        const privateKey = byteStringToBuffer(atob(pem));

        return crypto.subtle.importKey(
            'pkcs8',
            privateKey,
            {
                name: 'RSA-OAEP',
                hash: sha,
            },
            false,
            [
                'decrypt',
            ]
        );
    }

    async function decrypt(encryptedData: string | BufferSource, hash: string) {
        const data = typeof encryptedData === 'string'
            ? base64ToBuffer(encryptedData)
            : encryptedData;
        const privateKey = await importDecryptKey(Deno.readTextFileSync(`${ import.meta.dirname }/keys/private_key.pem`), hash);
        const decryptedData = textDecode(await crypto.subtle.decrypt(
            {
                name: 'RSA-OAEP',
            },
            privateKey,
            data
        ));

        return decryptedData;
    }

    const publicKeyStr = Deno.readTextFileSync(`${ import.meta.dirname }/keys/public_key.pem`);

    {
        assertThrows(() => cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-2' as any));
        assertRejects(() => cryptos.rsa.importPublicKey(publicKeyStr.slice(1), 'SHA-256'));
        assertRejects(() => cryptos.rsa.importPublicKey(publicKeyStr.replace('PUBLIC', 'AES PUBLIC'), 'SHA-256'));
    }

    for (let index = 0; index < 1; index++) {
        {
            const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-256')).encryptToString(data);
            const decryptedData = await decrypt(encryptedData, 'SHA-256');
            assert(decryptedData === data);
        }
        {
            const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-1')).encrypt(data);
            const decryptedData = await decrypt(encryptedData, 'SHA-1');
            assert(decryptedData === data);
        }
        {
            const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-256')).encrypt(data);
            const decryptedData = await decrypt(encryptedData, 'SHA-256');
            assert(decryptedData === data);
        }
        {
            const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-384')).encrypt(data);
            const decryptedData = await decrypt(encryptedData, 'SHA-384');
            assert(decryptedData === data);
        }
        {
            const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-512')).encrypt(data);
            const decryptedData = await decrypt(encryptedData, 'SHA-512');
            assert(decryptedData === data);
        }
    }
});