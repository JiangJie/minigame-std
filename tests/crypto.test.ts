// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert, assertRejects, assertThrows } from '@std/assert';
import { base64ToBuffer, byteStringToBuffer, cryptos, textDecode, textEncode } from '../src/mod.ts';

Deno.test('calculate md5', () => {
    const data = 'minigame-std-中文';
    const md5Str = '3395c7db2e34c56338bec2bad454f224';

    assert(cryptos.md5(data) === md5Str);
    assert(cryptos.md5(textEncode(data)) === md5Str);
});

Deno.test('calculate sha', async () => {
    const data = 'minigame-std-中文';
    const sha1Str = '431de9a89a769f4fb56a1c128fb7208bebb37960';

    assert(await cryptos.sha1(data) === sha1Str);
    assert(await cryptos.sha1(textEncode(data)) === sha1Str);

    assert(await cryptos.sha256(data) === '9cff73e4d0e15d78089294a8519788df44f306411e8d20f5f3770e564a73467f');
    assert(await cryptos.sha384(data) === '23ba7aac72c86e88befc6094e8f903645e2531cf14ac57edf1796e74e40a6e567b0255502a342d3085493d34e87b0541');
    assert(await cryptos.sha512(data) === 'b4ebfef03638039622452ce378974fba515a8cb46c07e667bf80cdae06e69127123d5c32d85deb0ccc9ce563e5939b3340a604b45bd6493e663ae266c203d694');
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