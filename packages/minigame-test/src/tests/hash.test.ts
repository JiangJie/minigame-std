import { assert } from '@std/assert';
import { cryptos, encodeUtf8 } from 'minigame-std';

export async function testHash(): Promise<void> {
    const data = 'minigame-std-中文';
    const md5Str = '3395c7db2e34c56338bec2bad454f224';

    assert(cryptos.md5(data) === md5Str);
    assert(cryptos.md5(encodeUtf8(data)) === md5Str);

    const sha1Str = '431de9a89a769f4fb56a1c128fb7208bebb37960';

    assert((await cryptos.sha1(data)).unwrap() === sha1Str);
    assert((await cryptos.sha1(encodeUtf8(data))).unwrap() === sha1Str);

    assert((await cryptos.sha256(data)).unwrap() === '9cff73e4d0e15d78089294a8519788df44f306411e8d20f5f3770e564a73467f');
    assert((await cryptos.sha384(data)).unwrap() === '23ba7aac72c86e88befc6094e8f903645e2531cf14ac57edf1796e74e40a6e567b0255502a342d3085493d34e87b0541');
    assert((await cryptos.sha512(data)).unwrap() === 'b4ebfef03638039622452ce378974fba515a8cb46c07e667bf80cdae06e69127123d5c32d85deb0ccc9ce563e5939b3340a604b45bd6493e663ae266c203d694');

    // HMAC 测试
    await testHMAC();
}

/**
 * 测试 HMAC 函数
 */
async function testHMAC(): Promise<void> {
    const key = 'secret-key';
    const data = 'Hello, World!';

    console.time('hmac-sha1');
    // SHA-1 HMAC
    const hmacSha1 = await cryptos.sha1HMAC(key, data);
    assert(hmacSha1.isOk(), 'sha1HMAC should succeed');
    assert(hmacSha1.unwrap().length === 40, 'SHA-1 HMAC should be 40 hex chars');
    console.timeEnd('hmac-sha1');

    console.time('hmac-sha256');
    // SHA-256 HMAC
    const hmacSha256 = await cryptos.sha256HMAC(key, data);
    assert(hmacSha256.isOk(), 'sha256HMAC should succeed');
    assert(hmacSha256.unwrap().length === 64, 'SHA-256 HMAC should be 64 hex chars');
    console.timeEnd('hmac-sha256');

    console.time('hmac-sha384');
    // SHA-384 HMAC
    const hmacSha384 = await cryptos.sha384HMAC(key, data);
    assert(hmacSha384.isOk(), 'sha384HMAC should succeed');
    assert(hmacSha384.unwrap().length === 96, 'SHA-384 HMAC should be 96 hex chars');
    console.timeEnd('hmac-sha384');

    console.time('hmac-sha512');
    // SHA-512 HMAC
    const hmacSha512 = await cryptos.sha512HMAC(key, data);
    assert(hmacSha512.isOk(), 'sha512HMAC should succeed');
    assert(hmacSha512.unwrap().length === 128, 'SHA-512 HMAC should be 128 hex chars');
    console.timeEnd('hmac-sha512');

    // 测试使用 Uint8Array 作为 key 和 data
    const keyBytes = encodeUtf8(key);
    const dataBytes = encodeUtf8(data);

    const hmacWithBytes = await cryptos.sha256HMAC(keyBytes, dataBytes);
    assert(hmacWithBytes.isOk(), 'sha256HMAC with bytes should succeed');
    // 相同的 key 和 data 应该产生相同的 HMAC
    assert(hmacWithBytes.unwrap() === hmacSha256.unwrap(), 'HMAC with string and bytes should match');

    // 测试中文内容
    const chineseKey = '密钥';
    const chineseData = '你好，世界！';

    const hmacChinese = await cryptos.sha256HMAC(chineseKey, chineseData);
    assert(hmacChinese.isOk(), 'sha256HMAC with Chinese should succeed');
    assert(hmacChinese.unwrap().length === 64, 'SHA-256 HMAC with Chinese should be 64 hex chars');
}