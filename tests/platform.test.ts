import { expect, test } from '@jest/globals';
import { platform } from '../src/mod.ts';

test('targetType is web', () => {
    expect(platform.isWeb()).toBe(true);
    expect(platform.isMiniGame()).toBe(false);
});