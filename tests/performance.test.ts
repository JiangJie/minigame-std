import { expect, test } from 'vitest';
import { getPerformanceNow } from '../src/mod.ts';

test('getPerformanceNow returns timestamp', () => {
    const now = getPerformanceNow();

    expect(typeof now).toBe('number');
    expect(now).toBeGreaterThan(0);
});

test('getPerformanceNow increases over time', async () => {
    const time1 = getPerformanceNow();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10));

    const time2 = getPerformanceNow();

    expect(time2).toBeGreaterThan(time1);
});

test('getPerformanceNow precision', async () => {
    const measurements: number[] = [];

    // Take multiple measurements
    for (let i = 0; i < 5; i++) {
        measurements.push(getPerformanceNow());
        await new Promise(resolve => setTimeout(resolve, 1));
    }

    // Each measurement should be different and increasing
    for (let i = 1; i < measurements.length; i++) {
        expect(measurements[i]).toBeGreaterThan(measurements[i - 1]);
    }
});

test('getPerformanceNow measures elapsed time', async () => {
    const start = getPerformanceNow();

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 50));

    const end = getPerformanceNow();
    const elapsed = end - start;

    // Should be approximately 50ms (with some tolerance)
    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(100);
});
