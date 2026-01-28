/**
 * 测试小游戏环境下的 crypto/rsa/mod.ts
 *
 * 注意：小游戏环境使用的是 rsa-oaep-encryption 库实现的 RSA 加密，
 * 不是 wx.rsa API
 */
import { expect, test, vi } from 'vitest';

// RSA 2048-bit 公钥（测试用）
const TEST_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`;

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // 小游戏环境的 RSA 实现使用 rsa-oaep-encryption 库，不需要 mock wx.rsa
    (globalThis as Record<string, unknown>)['wx'] = {};
});

import { cryptos } from '../src/mod.ts';

test('importPublicKey returns RSA public key in minigame environment', async () => {
    const result = await cryptos.rsa.importPublicKey(TEST_PUBLIC_KEY, 'SHA-256');

    expect(result.isOk()).toBe(true);
    const publicKey = result.unwrap();
    expect(publicKey.encrypt).toBeDefined();
    expect(publicKey.encryptToString).toBeDefined();
});

test('importPublicKey encrypt works in minigame environment', async () => {
    const result = await cryptos.rsa.importPublicKey(TEST_PUBLIC_KEY, 'SHA-256');

    expect(result.isOk()).toBe(true);
    const publicKey = result.unwrap();

    const encryptResult = await publicKey.encryptToString('test data');
    expect(encryptResult.isOk()).toBe(true);
    expect(typeof encryptResult.unwrap()).toBe('string');
});

test('importPublicKey supports different SHA algorithms', async () => {
    for (const sha of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const) {
        const result = await cryptos.rsa.importPublicKey(TEST_PUBLIC_KEY, sha);
        expect(result.isOk()).toBe(true);
    }
});

test('importPublicKey rejects unsupported hash algorithm', async () => {
    const result = await cryptos.rsa.importPublicKey(TEST_PUBLIC_KEY, 'MD5' as cryptos.SHA);

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('Unsupported hash algorithm');
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
