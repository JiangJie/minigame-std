// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assert } from '@std/assert';
import { platform } from 'minigame-std';

Deno.test('targetType is web', () => {
    assert(platform.isWeb());
    assert(!platform.isMiniGame());
});