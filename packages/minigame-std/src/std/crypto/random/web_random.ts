/**
 * @internal
 * Web platform implementation for random number generation.
 */

import type { UUID } from './random_defines.ts';

export function getRandomValues(length: number): Uint8Array {
    const u8a = new Uint8Array(length);
    crypto.getRandomValues(u8a);

    return u8a;
}

export function randomUUID(): UUID {
    return crypto.randomUUID();
}