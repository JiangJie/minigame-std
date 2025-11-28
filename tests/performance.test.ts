// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assertEquals } from '@std/assert';
import { getPerformanceNow } from 'minigame-std';

Deno.test('getPerformanceNow returns timestamp', () => {
    const now = getPerformanceNow();
    
    assertEquals(typeof now, 'number', 'Should return a number');
    assertEquals(now > 0, true, 'Should return positive number');
});

Deno.test('getPerformanceNow increases over time', async () => {
    const time1 = getPerformanceNow();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const time2 = getPerformanceNow();
    
    assertEquals(time2 > time1, true, 'Later timestamp should be greater');
});

Deno.test('getPerformanceNow precision', async () => {
    const measurements: number[] = [];
    
    // Take multiple measurements
    for (let i = 0; i < 5; i++) {
        measurements.push(getPerformanceNow());
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    // Each measurement should be different and increasing
    for (let i = 1; i < measurements.length; i++) {
        assertEquals(
            measurements[i] > measurements[i - 1],
            true,
            `Measurement ${i} should be greater than ${i - 1}`
        );
    }
});

Deno.test('getPerformanceNow measures elapsed time', async () => {
    const start = getPerformanceNow();
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const end = getPerformanceNow();
    const elapsed = end - start;
    
    // Should be approximately 50ms (with some tolerance)
    assertEquals(elapsed >= 45, true, 'Elapsed time should be at least 45ms');
    assertEquals(elapsed < 100, true, 'Elapsed time should be less than 100ms');
});
