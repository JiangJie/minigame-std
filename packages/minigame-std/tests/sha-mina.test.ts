/**
 * 测试小游戏环境下的 crypto/sha/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    // 小游戏环境不需要特殊的 wx mock，因为使用的是纯 JS 实现
    (globalThis as Record<string, unknown>)['wx'] = {};
});

import { sha1, sha256, sha384, sha512 } from '../src/std/crypto/sha/mod.ts';

test('sha1 calculates hash in minigame environment', async () => {
    const result = await sha1('Hello, World!');

    expect(result.isOk()).toBe(true);
    const hash = result.unwrap();
    expect(hash).toBe('0a0a9f2a6772942557ab5355d76af442f8f65e01');
});

test('sha256 calculates hash in minigame environment', async () => {
    const result = await sha256('Hello, World!');

    expect(result.isOk()).toBe(true);
    const hash = result.unwrap();
    expect(hash).toBe('dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f');
});

test('sha384 calculates hash in minigame environment', async () => {
    const result = await sha384('Hello, World!');

    expect(result.isOk()).toBe(true);
    const hash = result.unwrap();
    expect(hash.length).toBe(96); // SHA-384 输出 96 个十六进制字符
});

test('sha512 calculates hash in minigame environment', async () => {
    const result = await sha512('Hello, World!');

    expect(result.isOk()).toBe(true);
    const hash = result.unwrap();
    expect(hash.length).toBe(128); // SHA-512 输出 128 个十六进制字符
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
