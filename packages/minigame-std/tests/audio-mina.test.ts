/**
 * 测试小游戏环境下的 audio/web_audio.ts
 */
import { expect, test, vi } from 'vitest';

// Mock AudioContext
class MockAudioContext {
    destination = {};
    createBufferSource() {
        return {
            buffer: null,
            loop: false,
            connect: vi.fn(),
            start: vi.fn(),
            disconnect: vi.fn(),
            onended: null as (() => void) | null,
        };
    }
    decodeAudioData(_buffer: ArrayBuffer) {
        return Promise.resolve({
            duration: 1.0,
            numberOfChannels: 2,
            sampleRate: 44100,
        });
    }
    close() {
        return Promise.resolve();
    }
}

// 使用 vi.hoisted 确保在模块加载之前执行 mock
vi.hoisted(() => {
    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;

    (globalThis as Record<string, unknown>)['wx'] = {
        createWebAudioContext: () => new MockAudioContext(),
    };
});

import { closeGlobalAudioContext, createWebAudioContext, getGlobalAudioContext } from '../src/std/audio/web_audio.ts';

test('createWebAudioContext creates AudioContext in minigame environment', () => {
    const context = createWebAudioContext();

    expect(context).toBeDefined();
    expect(context.destination).toBeDefined();
});

test('getGlobalAudioContext returns cached AudioContext', () => {
    const context1 = getGlobalAudioContext();
    const context2 = getGlobalAudioContext();

    expect(context1).toBe(context2);
});

test('closeGlobalAudioContext closes the AudioContext', async () => {
    // 确保已初始化
    getGlobalAudioContext();

    const result = await closeGlobalAudioContext();

    expect(result.isOk()).toBe(true);
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
