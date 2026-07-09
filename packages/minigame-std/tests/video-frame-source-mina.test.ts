/**
 * 测试小游戏环境下的 VideoFrameSource。
 */
import { expect, test, vi } from 'vitest';

type DecoderEvent = 'start' | 'stop' | 'seek' | 'bufferchange' | 'ended';
type DecoderListener = (event?: unknown) => void;

const mocks = vi.hoisted(() => {
    const listeners: Partial<Record<DecoderEvent, DecoderListener[]>> = {};
    const frameData = {
        data: new Uint8Array([255, 0, 0, 255]).buffer,
        width: 1,
        height: 1,
        pkDts: 1000,
        pkPts: 1000,
    };
    const decoder = {
        start: vi.fn(() => Promise.resolve()),
        stop: vi.fn(() => Promise.resolve()),
        seek: vi.fn(() => Promise.resolve()),
        remove: vi.fn(),
        getFrameData: vi.fn<() => typeof frameData | null>(() => frameData),
        on: vi.fn((event: DecoderEvent, listener: DecoderListener) => {
            listeners[event] ??= [];
            listeners[event].push(listener);
        }),
        off: vi.fn((event: DecoderEvent, listener?: DecoderListener) => {
            if (!listener) {
                listeners[event] = [];
                return;
            }
            listeners[event] = listeners[event]?.filter(item => item !== listener) ?? [];
        }),
    };
    const createVideoDecoder = vi.fn(() => decoder);

    (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'] = true;
    (globalThis as Record<string, unknown>)['wx'] = {
        env: {
            USER_DATA_PATH: 'wxfile://usr',
        },
        createVideoDecoder,
    };

    return {
        listeners,
        frameData,
        decoder,
        createVideoDecoder,
    };
});

import { createVideoFrameSource, createVideoFrameSourceFromFile, isVideoFrameSourceSupported } from '../src/std/video/mod.ts';

test('isVideoFrameSourceSupported returns true in minigame environment', () => {
    expect(isVideoFrameSourceSupported()).toBe(true);
});

test('createVideoFrameSource creates minigame video decoder', () => {
    const sourceRes = createVideoFrameSource({ source: 'https://example.com/video.mp4' });

    expect(sourceRes.isOk()).toBe(true);
    expect(mocks.createVideoDecoder).toHaveBeenCalled();

    sourceRes.unwrap().destroy();
});

test('VideoFrameSource play calls decoder start with source', async () => {
    const source = createVideoFrameSource({ source: 'https://example.com/video.mp4' }).unwrap();

    const result = await source.play();

    expect(result.isOk()).toBe(true);
    expect(mocks.decoder.start).toHaveBeenCalledWith({ source: 'https://example.com/video.mp4' });
    expect(source.state).toBe('playing');

    source.destroy();
});

test('createVideoFrameSourceFromFile normalizes user data file path as decoder source', async () => {
    const sourceRes = await createVideoFrameSourceFromFile('/tmp/video.mp4');

    expect(sourceRes.isOk()).toBe(true);
    const source = sourceRes.unwrap();

    const result = await source.play();

    expect(result.isOk()).toBe(true);
    expect(mocks.decoder.start).toHaveBeenCalledWith({ source: 'wxfile://usr/tmp/video.mp4' });

    source.destroy();
});

test('createVideoFrameSource returns error when minigame VideoDecoder is unsupported', () => {
    const originalCreateVideoDecoder = wx.createVideoDecoder;
    delete (wx as unknown as { createVideoDecoder?: unknown; }).createVideoDecoder;

    const sourceRes = createVideoFrameSource({ source: 'https://example.com/video.mp4' });

    expect(isVideoFrameSourceSupported()).toBe(false);
    expect(sourceRes.isErr()).toBe(true);
    expect(sourceRes.unwrapErr().message).toContain('VideoFrameSource is not supported');

    (wx as unknown as { createVideoDecoder: typeof originalCreateVideoDecoder; }).createVideoDecoder = originalCreateVideoDecoder;
});

test('VideoFrameSource getFrame pulls pixel frame from decoder', () => {
    const source = createVideoFrameSource({ source: 'https://example.com/video.mp4', width: 2, height: 2 }).unwrap();
    const frameListener = vi.fn();
    source.onFrame(frameListener);
    mocks.decoder.getFrameData
        .mockReturnValueOnce(mocks.frameData)
        .mockReturnValueOnce(null);

    const frameRes = source.getFrame();
    expect(frameRes.isOk()).toBe(true);
    const frame = frameRes.unwrap();
    expect(frame?.kind).toBe('pixels');
    expect(source.duration).toSatisfy(Number.isNaN);
    expect(source.currentTime).toBe(1);
    expect(source.width).toBe(1);
    expect(source.height).toBe(1);
    if (frame?.kind === 'pixels') {
        expect(frame.data).toBeInstanceOf(Uint8Array);
        expect(frame.data.byteLength).toBe(4);
        expect(frame.timestamp).toBe(1);
        frame.release();
    }

    expect(frameListener).toHaveBeenCalledWith(expect.objectContaining({
        kind: 'pixels',
        format: 'rgba',
        width: 1,
        height: 1,
        timestamp: 1,
    }));
    expect(source.getFrame().unwrap()).toBe(null);
    source.offFrame(frameListener);
    source.offFrame();
    source.destroy();
});

test('VideoFrameSource error listener can be added and removed', () => {
    const source = createVideoFrameSource({ source: 'https://example.com/video.mp4' }).unwrap();
    const errorListener = vi.fn();

    source.onError(errorListener);
    source.offError(errorListener);
    source.onError(errorListener);
    source.offError();

    source.destroy();
});

test('VideoFrameSource seek stop pause and destroy call decoder methods', async () => {
    const source = createVideoFrameSource({ source: 'https://example.com/video.mp4' }).unwrap();

    const seekRes = await source.seek(2);
    expect(seekRes.isOk()).toBe(true);
    // 公开 API 单位为秒，底层 wx.VideoDecoder.seek 单位为 ms，需 * 1000
    expect(mocks.decoder.seek).toHaveBeenCalledWith(2000);
    expect(source.currentTime).toBe(2);

    const pauseRes = await source.pause();
    expect(pauseRes.isOk()).toBe(true);
    expect(mocks.decoder.stop).toHaveBeenCalled();
    expect(source.state).toBe('paused');

    const stopRes = await source.stop();
    expect(stopRes.isOk()).toBe(true);
    expect(source.currentTime).toBe(0);

    source.destroy();
    source.destroy();
    expect(mocks.decoder.remove).toHaveBeenCalled();
    expect(source.state).toBe('destroyed');
});

test('VideoFrameSource ended event updates state', () => {
    const source = createVideoFrameSource({ source: 'https://example.com/video.mp4' }).unwrap();
    const endedListener = vi.fn();
    source.onEnded(endedListener);
    source.offEnded(endedListener);
    source.onEnded(endedListener);

    const endedCallbacks = [...(mocks.listeners.ended ?? [])];
    endedCallbacks.forEach(listener => listener());
    expect(endedListener).toHaveBeenCalled();
    expect(source.state).toBe('ended');

    source.offEnded();
    source.destroy();
    endedCallbacks.forEach(listener => listener());
});

test.afterAll(() => {
    delete (globalThis as Record<string, unknown>)['__MINIGAME_STD_MINA__'];
    delete (globalThis as Record<string, unknown>)['wx'];
});
