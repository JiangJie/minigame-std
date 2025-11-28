// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { platform } from 'minigame-std';

Deno.test('targetType is web', () => {
    assert(platform.isWeb());
    assert(!platform.isMiniGame());
});

Deno.test('getTargetType returns web', () => {
    const targetType = platform.getTargetType();
    assert(targetType === 'web', 'Target type should be web in test environment');
});

Deno.test('platform detection is consistent', () => {
    // All platform detection methods should be consistent
    const isWeb = platform.isWeb();
    const isMiniGame = platform.isMiniGame();
    const targetType = platform.getTargetType();
    
    if (isWeb) {
        assert(!isMiniGame, 'Cannot be both web and minigame');
        assert(targetType === 'web', 'Target type should match isWeb');
    }
    
    if (isMiniGame) {
        assert(!isWeb, 'Cannot be both minigame and web');
        assert(targetType === 'minigame', 'Target type should match isMiniGame');
    }
});