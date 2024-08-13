import { base64ToBuffer } from '../base64/mod.ts';
import { textEncode } from '../codec/mod.ts';

function str2U8a(str: string) {
    const { length } = str;
    const u8a = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        u8a[i] = str.charCodeAt(i);
    }

    return u8a;
}

export function importPublicKey(pem: string): Promise<CryptoKey> {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';

    if (pem.startsWith(pemHeader)) {
        pem = pem.slice(pemHeader.length);
    }
    if (pem.endsWith(pemFooter)) {
        pem = pem.slice(0, pem.length - pemFooter.length);
    }

    console.log(pem);
    let keyData = base64ToBuffer(pem);
    console.log(keyData);
    keyData = str2U8a(atob(pem));
    console.log(keyData);

    return crypto.subtle.importKey(
        'spki',
        keyData,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        [
            'encrypt',
        ]
    );
}

export function encrypt(publicKey: CryptoKey, data: string): Promise<ArrayBuffer> {
    const encodedData = textEncode(data);
    return crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        encodedData
    );
}