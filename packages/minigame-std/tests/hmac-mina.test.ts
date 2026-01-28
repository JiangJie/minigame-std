/**
 * 测试小游戏环境下的 crypto/hmac/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // 小游戏环境不需要特殊的 wx mock，因为使用的是纯 JS 实现
    (globalThis as Record<string, unknown>)['wx'] = {};
});

import { sha1HMAC, sha256HMAC, sha384HMAC, sha512HMAC } from '../src/std/crypto/hmac/mod.ts';

test('sha1HMAC calculates HMAC in minigame environment', async () => {
    const result = await sha1HMAC('secret-key', 'Hello, World!');

    expect(result.isOk()).toBe(true);
    const hmac = result.unwrap();
    expect(hmac.length).toBe(40); // SHA-1 HMAC 输出 40 个十六进制字符
});

test('sha256HMAC calculates HMAC in minigame environment', async () => {
    const result = await sha256HMAC('secret-key', 'Hello, World!');

    expect(result.isOk()).toBe(true);
    const hmac = result.unwrap();
    expect(hmac.length).toBe(64); // SHA-256 HMAC 输出 64 个十六进制字符
});

test('sha384HMAC calculates HMAC in minigame environment', async () => {
    const result = await sha384HMAC('secret-key', 'Hello, World!');

    expect(result.isOk()).toBe(true);
    const hmac = result.unwrap();
    expect(hmac.length).toBe(96); // SHA-384 HMAC 输出 96 个十六进制字符
});

test('sha512HMAC calculates HMAC in minigame environment', async () => {
    const result = await sha512HMAC('secret-key', 'Hello, World!');

    expect(result.isOk()).toBe(true);
    const hmac = result.unwrap();
    expect(hmac.length).toBe(128); // SHA-512 HMAC 输出 128 个十六进制字符
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
