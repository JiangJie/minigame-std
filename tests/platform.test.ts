import { expect, test } from '@jest/globals';
import { getTargetType, isDevtools, isWx } from '../src/mod.ts';

test('getTargetType is web', () => {
    expect(getTargetType()).toBe('web');
    expect(isWx()).toBe(false);
    expect(isDevtools()).toBe(false);
});