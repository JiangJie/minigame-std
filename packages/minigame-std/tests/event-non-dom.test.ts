// @vitest-environment node
import { expect, test } from 'vitest';

test('typeof document and location are undefined in Node environment', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof location).toBe('undefined');
});

test('getLaunchOptionsSync returns empty options in non-DOM environment', async () => {
    const { getLaunchOptionsSync } = await import('../src/std/event/web_event.ts');
    const options = getLaunchOptionsSync();
    expect(options.query).toEqual({});
    expect(options.scene).toBe(0);
    expect(options.referrerInfo.appId).toBe('');
    expect(options.referrerInfo.extraData).toEqual({});
});

test('getEnterOptionsSync returns empty query in non-DOM environment', async () => {
    const { getEnterOptionsSync } = await import('../src/std/event/web_event.ts');
    const options = getEnterOptionsSync();
    expect(options.query).toEqual({});
    expect(options.referrerInfo.appId).toBe('');
});

test('addShowListener returns no-op with fireImmediately in non-DOM environment', async () => {
    const { addShowListener } = await import('../src/std/event/web_event.ts');
    let fireCount = 0;
    let lastOptions: WechatMinigame.OnShowListenerResult | undefined;
    const removeListener = addShowListener((options) => {
        fireCount++;
        lastOptions = options;
    }, { fireImmediately: true });

    // fireImmediately still fires once with degraded getWebShowOptions
    expect(fireCount).toBe(1);
    expect(lastOptions?.query).toEqual({});
    expect(lastOptions?.referrerInfo.appId).toBe('');

    // remove is no-op, should not throw
    removeListener();
});

test('addShowListener does not fire without fireImmediately in non-DOM environment', async () => {
    const { addShowListener } = await import('../src/std/event/web_event.ts');
    let fireCount = 0;
    const removeListener = addShowListener(() => {
        fireCount++;
    });

    expect(fireCount).toBe(0);
    removeListener();
});

test('addHideListener returns no-op in non-DOM environment', async () => {
    const { addHideListener } = await import('../src/std/event/web_event.ts');
    let fireCount = 0;
    const removeListener = addHideListener(() => {
        fireCount++;
    });

    expect(fireCount).toBe(0);
    removeListener();
});
