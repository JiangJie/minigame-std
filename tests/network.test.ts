import { addNetworkChangeListener, getNetworkType } from 'minigame-std';
import { expect, test, vi } from 'vitest';

test('getNetworkType returns none when offline', async () => {
    const originalOnLine = navigator.onLine;

    Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
    });

    try {
        const result = await getNetworkType();
        expect(result).toBe('none');
    } finally {
        Object.defineProperty(navigator, 'onLine', {
            value: originalOnLine,
            configurable: true,
        });
    }
});

test('getNetworkType returns unknown when online without connection API', async () => {
    const originalOnLine = navigator.onLine;
    const originalConnection = (navigator as { connection?: unknown }).connection;

    Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
    });
    Object.defineProperty(navigator, 'connection', {
        value: undefined,
        configurable: true,
    });

    try {
        const result = await getNetworkType();
        expect(result).toBe('unknown');
    } finally {
        Object.defineProperty(navigator, 'onLine', {
            value: originalOnLine,
            configurable: true,
        });
        Object.defineProperty(navigator, 'connection', {
            value: originalConnection,
            configurable: true,
        });
    }
});

test('getNetworkType returns wifi when connected via wifi', async () => {
    const originalOnLine = navigator.onLine;
    const originalConnection = (navigator as { connection?: unknown }).connection;

    Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
    });
    Object.defineProperty(navigator, 'connection', {
        value: {
            type: 'wifi',
            effectiveType: '4g',
        },
        configurable: true,
    });

    try {
        const result = await getNetworkType();
        expect(result).toBe('wifi');
    } finally {
        Object.defineProperty(navigator, 'onLine', {
            value: originalOnLine,
            configurable: true,
        });
        Object.defineProperty(navigator, 'connection', {
            value: originalConnection,
            configurable: true,
        });
    }
});

test('getNetworkType returns effectiveType for non-wifi connections', async () => {
    const originalOnLine = navigator.onLine;
    const originalConnection = (navigator as { connection?: unknown }).connection;

    Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
    });
    Object.defineProperty(navigator, 'connection', {
        value: {
            type: 'cellular',
            effectiveType: '4g',
        },
        configurable: true,
    });

    try {
        const result = await getNetworkType();
        expect(result).toBe('4g');
    } finally {
        Object.defineProperty(navigator, 'onLine', {
            value: originalOnLine,
            configurable: true,
        });
        Object.defineProperty(navigator, 'connection', {
            value: originalConnection,
            configurable: true,
        });
    }
});

test('addNetworkChangeListener adds and removes listener', () => {
    const originalConnection = (navigator as { connection?: unknown }).connection;

    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();

    Object.defineProperty(navigator, 'connection', {
        value: {
            type: 'wifi',
            effectiveType: '4g',
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        },
        configurable: true,
    });

    try {
        const listener = vi.fn();
        const remove = addNetworkChangeListener(listener);

        expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

        remove();

        expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    } finally {
        Object.defineProperty(navigator, 'connection', {
            value: originalConnection,
            configurable: true,
        });
    }
});

test('addNetworkChangeListener calls callback with network type on change', () => {
    const originalOnLine = navigator.onLine;
    const originalConnection = (navigator as { connection?: unknown }).connection;

    let capturedCallback: (() => void) | undefined;
    const mockAddEventListener = vi.fn().mockImplementation((_, callback) => {
        capturedCallback = callback;
    });

    Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
    });
    Object.defineProperty(navigator, 'connection', {
        value: {
            type: 'wifi',
            effectiveType: '4g',
            addEventListener: mockAddEventListener,
            removeEventListener: vi.fn(),
        },
        configurable: true,
    });

    try {
        const listener = vi.fn();
        addNetworkChangeListener(listener);

        // Simulate network change
        capturedCallback?.();

        expect(listener).toHaveBeenCalledWith('wifi');
    } finally {
        Object.defineProperty(navigator, 'onLine', {
            value: originalOnLine,
            configurable: true,
        });
        Object.defineProperty(navigator, 'connection', {
            value: originalConnection,
            configurable: true,
        });
    }
});

test('addNetworkChangeListener handles missing connection API gracefully', () => {
    const originalConnection = (navigator as { connection?: unknown }).connection;

    Object.defineProperty(navigator, 'connection', {
        value: undefined,
        configurable: true,
    });

    try {
        const listener = vi.fn();
        const remove = addNetworkChangeListener(listener);

        // Should not throw
        expect(() => remove()).not.toThrow();
    } finally {
        Object.defineProperty(navigator, 'connection', {
            value: originalConnection,
            configurable: true,
        });
    }
});
