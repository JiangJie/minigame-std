import { expect, test } from '@jest/globals';
import { getTargetType } from '../src/mod.ts';

test('getTargetType is web', () => {
    expect(getTargetType()).toBe('web');
});