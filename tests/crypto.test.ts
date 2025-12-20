import { expect, test } from 'vitest';
import { base64ToBuffer, byteStringToBuffer, cryptos, textDecode, textEncode, type DataSource } from '../src/mod.ts';

test('calculate md5', () => {
    const data = 'minigame-std-中文';
    const md5Str = '3395c7db2e34c56338bec2bad454f224';

    expect(cryptos.md5(data)).toBe(md5Str);
    expect(cryptos.md5(textEncode(data))).toBe(md5Str);
});

test('calculate sha', async () => {
    const data = 'minigame-std-中文';
    const sha1Str = '431de9a89a769f4fb56a1c128fb7208bebb37960';

    expect(await cryptos.sha1(data)).toBe(sha1Str);
    expect(await cryptos.sha1(textEncode(data))).toBe(sha1Str);

    expect(await cryptos.sha256(data)).toBe('9cff73e4d0e15d78089294a8519788df44f306411e8d20f5f3770e564a73467f');
    expect(await cryptos.sha384(data)).toBe('23ba7aac72c86e88befc6094e8f903645e2531cf14ac57edf1796e74e40a6e567b0255502a342d3085493d34e87b0541');
    expect(await cryptos.sha512(data)).toBe('b4ebfef03638039622452ce378974fba515a8cb46c07e667bf80cdae06e69127123d5c32d85deb0ccc9ce563e5939b3340a604b45bd6493e663ae266c203d694');
});

test('calculate hmac', async () => {
    const key = '密码';
    const data = 'minigame-std-中文';

    expect(await cryptos.sha1HMAC(key, data)).toBe('c039c11a31199388dfb540f989d27f1ec099a43e');
    expect(await cryptos.sha256HMAC(key, data)).toBe('5e6bcf9fd1f62617773c18d420ef200dfd46dc15373d1192ff02cf648d703748');
    expect(await cryptos.sha384HMAC(key, data)).toBe('7e011216b97450f06de084cdc6bd5f6e206dba1aa87519129dfc289ae9aa6231800188a0defe9543321365db2acc91f6');
    expect(await cryptos.sha512HMAC(key, data)).toBe('e781e747d4358000756e7752086dbf37822bd5f4733df2953a6eb96945b670cad1df950d4ba2f09cdf0e90beba1cdab9f0798ce6814b5aad7521d41bf3b4d0f3');
});

test('calculate hmac with ArrayBuffer', async () => {
    const key = textEncode('密码');
    const data = textEncode('minigame-std-中文');

    expect(await cryptos.sha1HMAC(key, data)).toBe('c039c11a31199388dfb540f989d27f1ec099a43e');
    expect(await cryptos.sha256HMAC(key, data)).toBe('5e6bcf9fd1f62617773c18d420ef200dfd46dc15373d1192ff02cf648d703748');
});

test('calculate hmac with empty string', async () => {
    const key = 'key';
    const data = '';

    const result = await cryptos.sha256HMAC(key, data);
    expect(typeof result).toBe('string');
    expect(result.length).toBe(64);
});

test('calculate hmac with empty key throws error', async () => {
    const key = '';
    const data = 'test data';

    // Web Crypto API does not allow empty HMAC keys
    await expect(cryptos.sha1HMAC(key, data)).rejects.toThrow();
    await expect(cryptos.sha256HMAC(key, data)).rejects.toThrow();
    await expect(cryptos.sha384HMAC(key, data)).rejects.toThrow();
    await expect(cryptos.sha512HMAC(key, data)).rejects.toThrow();
});

test('calculate hmac with binary key and data', async () => {
    const key = new Uint8Array([0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b]);
    const data = textEncode('Hi There');

    // RFC 4231 test vector for HMAC-SHA-256
    const sha256Result = await cryptos.sha256HMAC(key, data);
    expect(sha256Result).toBe('b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7');
});

test('hmac produces consistent results', async () => {
    const key = 'consistent-key';
    const data = 'consistent-data';

    const result1 = await cryptos.sha256HMAC(key, data);
    const result2 = await cryptos.sha256HMAC(key, data);

    expect(result1).toBe(result2);
});

test('hmac with different keys produces different results', async () => {
    const key1 = 'key1';
    const key2 = 'key2';
    const data = 'same data';

    const result1 = await cryptos.sha256HMAC(key1, data);
    const result2 = await cryptos.sha256HMAC(key2, data);

    expect(result1).not.toBe(result2);
});

test('hmac with different data produces different results', async () => {
    const key = 'same key';
    const data1 = 'data1';
    const data2 = 'data2';

    const result1 = await cryptos.sha256HMAC(key, data1);
    const result2 = await cryptos.sha256HMAC(key, data2);

    expect(result1).not.toBe(result2);
});

test('hmac with long key', async () => {
    // Key longer than block size should be hashed first
    const longKey = 'a'.repeat(200);
    const data = 'test data';

    const result = await cryptos.sha256HMAC(longKey, data);
    expect(typeof result).toBe('string');
    expect(result.length).toBe(64);
});

test('hmac with long data', async () => {
    const key = 'key';
    const longData = 'x'.repeat(10000);

    const result = await cryptos.sha256HMAC(key, longData);
    expect(typeof result).toBe('string');
    expect(result.length).toBe(64);
});

test('all hmac algorithms return correct length', async () => {
    const key = 'test-key';
    const data = 'test-data';

    // SHA-1 produces 160-bit (40 hex chars) output
    const sha1Result = await cryptos.sha1HMAC(key, data);
    expect(sha1Result.length).toBe(40);

    // SHA-256 produces 256-bit (64 hex chars) output
    const sha256Result = await cryptos.sha256HMAC(key, data);
    expect(sha256Result.length).toBe(64);

    // SHA-384 produces 384-bit (96 hex chars) output
    const sha384Result = await cryptos.sha384HMAC(key, data);
    expect(sha384Result.length).toBe(96);

    // SHA-512 produces 512-bit (128 hex chars) output
    const sha512Result = await cryptos.sha512HMAC(key, data);
    expect(sha512Result.length).toBe(128);
});

test('hmac output is lowercase hex', async () => {
    const key = 'key';
    const data = 'data';

    const result = await cryptos.sha256HMAC(key, data);

    // Should be all lowercase hex characters
    expect(result).toMatch(/^[0-9a-f]+$/);
});

test('calculate md5 with empty string', () => {
    const md5Empty = cryptos.md5('');
    expect(md5Empty).toBe('d41d8cd98f00b204e9800998ecf8427e');
});

test('calculate sha256 with ArrayBuffer', async () => {
    const data = textEncode('test');
    const sha256Str = await cryptos.sha256(data);

    expect(sha256Str).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
});

test('Generate random bytes', async () => {
    const result = await cryptos.getRandomValues(10);
    expect(result.isOk()).toBe(true);

    result.inspect(bytes => {
        expect(bytes.length).toBe(10);
        for (const n of bytes) {
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThan(256);
        }
    });
});

test('Generate random bytes with different sizes', async () => {
    const sizes = [1, 16, 32, 64, 128];

    for (const size of sizes) {
        const result = await cryptos.getRandomValues(size);
        expect(result.isOk()).toBe(true);
        result.inspect(bytes => {
            expect(bytes.length).toBe(size);
        });
    }
});

test('Generate random UUID', async () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const result = await cryptos.randomUUID();

    expect(result.isOk()).toBe(true);
    result.inspect(uuid => {
        expect(uuidRegex.test(uuid)).toBe(true);
    });
});

test('Generate unique random UUIDs', async () => {
    const uuids = new Set<string>();

    for (let i = 0; i < 10; i++) {
        const result = await cryptos.randomUUID();
        result.inspect(uuid => {
            uuids.add(uuid);
        });
    }

    // All UUIDs should be unique
    expect(uuids.size).toBe(10);
});

test('RSA encryption', async () => {
    const data = 'minigame-std';

    const publicKeyStr = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAix682LW8jwpZEGjFfoom
GvLHCDh8ttPgSB5CBvXZLglimVfVkA7FiGdJqlKkf2kKXqrwSICbgcYUjFHMFdy9
fvUwrKXzFXP46AzzV3ivkam2LB97eDSMI8gaIjumDaIFZAD3E9osYz4LMSI2A0nC
qs+5xZ66JeC/Dtr5W9nobushAhFzZQWS/4I7iSUkV4WFmSG1ACB267z8YZ7YFmlT
1hMFvp+biIsZIx7mebQNqjFjFPP0ZTskXg4UfQt6yyuaPqL55pQ7Wc8iI3umlsSV
hDL1q3+ry7L8VDg7EtDBbodyYT5R62zBuhe7sJrvhtt/R6fZIfISPvRbumwusbf5
XQIDAQAB
-----END PUBLIC KEY-----`;

    const privateKeyStr = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCLHrzYtbyPClkQ
aMV+iiYa8scIOHy20+BIHkIG9dkuCWKZV9WQDsWIZ0mqUqR/aQpeqvBIgJuBxhSM
UcwV3L1+9TCspfMVc/joDPNXeK+RqbYsH3t4NIwjyBoiO6YNogVkAPcT2ixjPgsx
IjYDScKqz7nFnrol4L8O2vlb2ehu6yECEXNlBZL/gjuJJSRXhYWZIbUAIHbrvPxh
ntgWaVPWEwW+n5uIixkjHuZ5tA2qMWMU8/RlOyReDhR9C3rLK5o+ovnmlDtZzyIj
e6aWxJWEMvWrf6vLsvxUODsS0MFuh3JhPlHrbMG6F7uwmu+G239Hp9kh8hI+9Fu6
bC6xt/ldAgMBAAECggEABMjYQf68FFJM3lowF/Tshbw9mUbcuSqfxHMv86PUZeIs
6desu1vasiEqlijp9IzPrmekGbuR6Dxq+/7F1/xOaGr1KIGQ6DcObif13YIDzcIV
BxRHxN+lGzJC/dQ91tWwkvAlOeGkvv6vrVn/GrgDHH3w5mmZ/s/+2iYF8ev/CQN6
/2t68F7OGx93IwQZnet1L/fDEJbvpKNlc9FOHz9fDeh769RzMxD/QJsiV6zcJuFX
p0EFrQflFQ51sP9jKLpXgK6kKH3ugveQL0fhKHDmNFKUpz9BX2WRZh+3ix1XNk5M
Ppyhg/oeKXvphtubUEZfZRXYBLmACMqVw9ta94n5YQKBgQC/jhESKALWLl7Oc08m
GyQA03z3j3/JNaqXALSRcND38j/mpR+abI9ANDV7njwO8jtrqfXIBTGna9sqOoey
XAnLsvFkB1ndGcz7rcKi6A1CAFcEN7J6E0iePhC1HKqoY7qPMi1HLsyIKctEo20A
J7UNNSylVbUi084Dt6jTo2LPIQKBgQC57KUbHDI557km5RoisVwjyucANDs5oicr
vaSXjDhgvf0b07D5ElhSeJyzLp/LydwasUnYNM/S6az1BFSI5sAtcGiecQ36FXus
UnyWWB1B3bTa/hYPqFAT+QIIRqIqdcg8ARcaoDJgjESDYdG8Yz8N48+Dp98R22Qk
1KU4XolOvQKBgQCP7tPs7JuVDCq4vfQPEf2vkTopWm4OZoDUDfegAUFDzYcua4yf
oErTV2eIh5FhOapkb8T6ksyInIaF6Izl/DpwEPlIzC098ZEQ27OQbQTpPxAjXyaA
i9TY8pHjRLMG7EjWKEHVZtjQx3axEItqvmtQjVAKu6frj3MRYAM/Y1lvgQKBgFk9
1m4x1YXnzP53X1khqqlffguiBn9+brDXIUbAvlrpNrGBpeOXw58qV4TGL1tg8+44
BMrrZonFMgiVYIIpyDrHRuAuQdg1MZygJz7+4mQ4J9Qpu6seTfmYPzp7tOEOkeMD
XvSfyi5/hW9Op552QNDI9VUrYa4vkV0AWKG69ss9AoGAZYuK/nbQv81+AExY2vr7
KaO+FLoszYHNiFbwvjt0e10a2X4wdVrUqiiT4gujrpQEWJigrNjbAmstmjDE1zgW
VxnzlrCOTTZT7/jD4wf53nCQiqRCg2NsIq6/JYOi+tjr6dC8HA8pd58xYAkB+hbZ
wIy0/kd6szCcWK5Ld1kH9R0=
-----END PRIVATE KEY-----`;

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
            ],
        );
    }

    async function decrypt(encryptedData: DataSource, hash: string) {
        const buffer = typeof encryptedData === 'string'
            ? base64ToBuffer(encryptedData)
            : encryptedData;
        const privateKey = await importDecryptKey(privateKeyStr, hash);
        const decryptedData = textDecode(await crypto.subtle.decrypt(
            {
                name: 'RSA-OAEP',
            },
            privateKey,
            buffer,
        ));

        return decryptedData;
    }

    // Test invalid hash algorithm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-2' as any)).toThrow();

    // Test invalid PEM format
    await expect(cryptos.rsa.importPublicKey(publicKeyStr.slice(1), 'SHA-256')).rejects.toThrow();
    await expect(cryptos.rsa.importPublicKey(publicKeyStr.replace('PUBLIC', 'AES PUBLIC'), 'SHA-256')).rejects.toThrow();

    // Test encryption with different hash algorithms
    {
        const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-256')).encryptToString(data);
        const decryptedData = await decrypt(encryptedData, 'SHA-256');
        expect(decryptedData).toBe(data);
    }
    {
        const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-1')).encrypt(data);
        const decryptedData = await decrypt(encryptedData, 'SHA-1');
        expect(decryptedData).toBe(data);
    }
    {
        const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-256')).encrypt(data);
        const decryptedData = await decrypt(encryptedData, 'SHA-256');
        expect(decryptedData).toBe(data);
    }
    {
        const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-384')).encrypt(data);
        const decryptedData = await decrypt(encryptedData, 'SHA-384');
        expect(decryptedData).toBe(data);
    }
    {
        const encryptedData = await (await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-512')).encrypt(data);
        const decryptedData = await decrypt(encryptedData, 'SHA-512');
        expect(decryptedData).toBe(data);
    }
});

test('RSA encryption with unicode data', async () => {
    const data = 'Hello, 世界! 🎮';

    const publicKeyStr = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAix682LW8jwpZEGjFfoom
GvLHCDh8ttPgSB5CBvXZLglimVfVkA7FiGdJqlKkf2kKXqrwSICbgcYUjFHMFdy9
fvUwrKXzFXP46AzzV3ivkam2LB97eDSMI8gaIjumDaIFZAD3E9osYz4LMSI2A0nC
qs+5xZ66JeC/Dtr5W9nobushAhFzZQWS/4I7iSUkV4WFmSG1ACB267z8YZ7YFmlT
1hMFvp+biIsZIx7mebQNqjFjFPP0ZTskXg4UfQt6yyuaPqL55pQ7Wc8iI3umlsSV
hDL1q3+ry7L8VDg7EtDBbodyYT5R62zBuhe7sJrvhtt/R6fZIfISPvRbumwusbf5
XQIDAQAB
-----END PUBLIC KEY-----`;

    const privateKeyStr = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCLHrzYtbyPClkQ
aMV+iiYa8scIOHy20+BIHkIG9dkuCWKZV9WQDsWIZ0mqUqR/aQpeqvBIgJuBxhSM
UcwV3L1+9TCspfMVc/joDPNXeK+RqbYsH3t4NIwjyBoiO6YNogVkAPcT2ixjPgsx
IjYDScKqz7nFnrol4L8O2vlb2ehu6yECEXNlBZL/gjuJJSRXhYWZIbUAIHbrvPxh
ntgWaVPWEwW+n5uIixkjHuZ5tA2qMWMU8/RlOyReDhR9C3rLK5o+ovnmlDtZzyIj
e6aWxJWEMvWrf6vLsvxUODsS0MFuh3JhPlHrbMG6F7uwmu+G239Hp9kh8hI+9Fu6
bC6xt/ldAgMBAAECggEABMjYQf68FFJM3lowF/Tshbw9mUbcuSqfxHMv86PUZeIs
6desu1vasiEqlijp9IzPrmekGbuR6Dxq+/7F1/xOaGr1KIGQ6DcObif13YIDzcIV
BxRHxN+lGzJC/dQ91tWwkvAlOeGkvv6vrVn/GrgDHH3w5mmZ/s/+2iYF8ev/CQN6
/2t68F7OGx93IwQZnet1L/fDEJbvpKNlc9FOHz9fDeh769RzMxD/QJsiV6zcJuFX
p0EFrQflFQ51sP9jKLpXgK6kKH3ugveQL0fhKHDmNFKUpz9BX2WRZh+3ix1XNk5M
Ppyhg/oeKXvphtubUEZfZRXYBLmACMqVw9ta94n5YQKBgQC/jhESKALWLl7Oc08m
GyQA03z3j3/JNaqXALSRcND38j/mpR+abI9ANDV7njwO8jtrqfXIBTGna9sqOoey
XAnLsvFkB1ndGcz7rcKi6A1CAFcEN7J6E0iePhC1HKqoY7qPMi1HLsyIKctEo20A
J7UNNSylVbUi084Dt6jTo2LPIQKBgQC57KUbHDI557km5RoisVwjyucANDs5oicr
vaSXjDhgvf0b07D5ElhSeJyzLp/LydwasUnYNM/S6az1BFSI5sAtcGiecQ36FXus
UnyWWB1B3bTa/hYPqFAT+QIIRqIqdcg8ARcaoDJgjESDYdG8Yz8N48+Dp98R22Qk
1KU4XolOvQKBgQCP7tPs7JuVDCq4vfQPEf2vkTopWm4OZoDUDfegAUFDzYcua4yf
oErTV2eIh5FhOapkb8T6ksyInIaF6Izl/DpwEPlIzC098ZEQ27OQbQTpPxAjXyaA
i9TY8pHjRLMG7EjWKEHVZtjQx3axEItqvmtQjVAKu6frj3MRYAM/Y1lvgQKBgFk9
1m4x1YXnzP53X1khqqlffguiBn9+brDXIUbAvlrpNrGBpeOXw58qV4TGL1tg8+44
BMrrZonFMgiVYIIpyDrHRuAuQdg1MZygJz7+4mQ4J9Qpu6seTfmYPzp7tOEOkeMD
XvSfyi5/hW9Op552QNDI9VUrYa4vkV0AWKG69ss9AoGAZYuK/nbQv81+AExY2vr7
KaO+FLoszYHNiFbwvjt0e10a2X4wdVrUqiiT4gujrpQEWJigrNjbAmstmjDE1zgW
VxnzlrCOTTZT7/jD4wf53nCQiqRCg2NsIq6/JYOi+tjr6dC8HA8pd58xYAkB+hbZ
wIy0/kd6szCcWK5Ld1kH9R0=
-----END PRIVATE KEY-----`;

    function importDecryptKey(pem: string, sha: string): Promise<CryptoKey> {
        pem = pem.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\s)/g, '');
        const privateKey = byteStringToBuffer(atob(pem));
        return crypto.subtle.importKey(
            'pkcs8',
            privateKey,
            { name: 'RSA-OAEP', hash: sha },
            false,
            ['decrypt'],
        );
    }

    const rsaKey = await cryptos.rsa.importPublicKey(publicKeyStr, 'SHA-256');
    const encryptedData = await rsaKey.encrypt(data);

    const privateKey = await importDecryptKey(privateKeyStr, 'SHA-256');
    const decryptedData = textDecode(await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedData,
    ));

    expect(decryptedData).toBe(data);
});

test('MD5 with binary data', () => {
    const data = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0xff]);
    const md5 = cryptos.md5(data);

    expect(typeof md5).toBe('string');
    expect(md5.length).toBe(32);
});

test('SHA with binary data', async () => {
    const data = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0xff]);

    const sha1 = await cryptos.sha1(data);
    expect(typeof sha1).toBe('string');
    expect(sha1.length).toBe(40);

    const sha256 = await cryptos.sha256(data);
    expect(sha256.length).toBe(64);

    const sha384 = await cryptos.sha384(data);
    expect(sha384.length).toBe(96);

    const sha512 = await cryptos.sha512(data);
    expect(sha512.length).toBe(128);
});
