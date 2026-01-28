/**
 * 测试小游戏环境下的 lbs/mod.ts
 */
import { expect, test, vi } from 'vitest';

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    (globalThis as Record<string, unknown>)['wx'] = {
        authorize: (options: {
            scope: string;
            success: () => void;
            fail: (err: Error) => void;
        }) => {
            options.success();
        },
        getLocation: (options: {
            type?: string;
            success: (res: { latitude: number; longitude: number; altitude: number; accuracy: number; }) => void;
            fail: (err: Error) => void;
        }) => {
            options.success({
                latitude: 39.9042,
                longitude: 116.4074,
                altitude: 50,
                accuracy: 10,
            });
        },
        // getFuzzyLocation 不存在，所以使用 getLocation
    };
});

import { getCurrentPosition } from '../src/std/lbs/mod.ts';

test('getCurrentPosition returns geo position in minigame environment', async () => {
    const result = await getCurrentPosition();

    expect(result.isOk()).toBe(true);
    const position = result.unwrap();
    expect(position.latitude).toBe(39.9042);
    expect(position.longitude).toBe(116.4074);
});

test('getCurrentPosition returns error when wx.authorize fails', async () => {
    // 临时替换 wx.authorize 为失败的实现
    const originalAuthorize = (globalThis as Record<string, unknown>)['wx'] as Record<string, unknown>;
    const originalAuthorizeFn = originalAuthorize['authorize'];

    originalAuthorize['authorize'] = (options: {
        scope: string;
        success: () => void;
        fail: (err: Error) => void;
    }) => {
        options.fail(new Error('User denied authorization'));
    };

    const result = await getCurrentPosition();

    expect(result.isErr()).toBe(true);

    // 恢复原始实现
    // 恢复原始实现
    originalAuthorize['authorize'] = originalAuthorizeFn;
});

test('getCurrentPosition uses getFuzzyLocation when available', async () => {
    // 临时添加 wx.getFuzzyLocation
    const wxObj = (globalThis as Record<string, unknown>)['wx'] as Record<string, unknown>;

    wxObj['getFuzzyLocation'] = (options: {
        type?: string;
        success: (res: { latitude: number; longitude: number; }) => void;
        fail: (err: Error) => void;
    }) => {
        options.success({
            latitude: 40.0,
            longitude: 117.0,
        });
    };

    const result = await getCurrentPosition();

    expect(result.isOk()).toBe(true);
    const position = result.unwrap();
    expect(position.latitude).toBe(40.0);
    expect(position.longitude).toBe(117.0);

    // 移除 getFuzzyLocation
    delete wxObj['getFuzzyLocation'];
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
