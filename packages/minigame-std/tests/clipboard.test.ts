import { expect, test, vi } from 'vitest';
import { clipboard } from '../src/mod.ts';

test('writeText writes to clipboard', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    // Mock the clipboard API
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: mockWriteText,
            readText: vi.fn(),
        },
        configurable: true,
    });

    try {
        const result = await clipboard.writeText('test data');
        expect(result.isOk()).toBe(true);
        expect(mockWriteText).toHaveBeenCalledWith('test data');
    } finally {
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    }
});

test('writeText returns Err on failure', async () => {
    const mockError = new DOMException('Clipboard access denied');
    const mockWriteText = vi.fn().mockRejectedValue(mockError);

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: mockWriteText,
            readText: vi.fn(),
        },
        configurable: true,
    });

    try {
        const result = await clipboard.writeText('test data');
        expect(result.isErr()).toBe(true);
    } finally {
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    }
});

test('readText reads from clipboard', async () => {
    const mockReadText = vi.fn().mockResolvedValue('clipboard content');

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: vi.fn(),
            readText: mockReadText,
        },
        configurable: true,
    });

    try {
        const result = await clipboard.readText();
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('clipboard content');
    } finally {
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    }
});

test('readText returns Err on failure', async () => {
    const mockError = new DOMException('Clipboard access denied');
    const mockReadText = vi.fn().mockRejectedValue(mockError);

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: vi.fn(),
            readText: mockReadText,
        },
        configurable: true,
    });

    try {
        const result = await clipboard.readText();
        expect(result.isErr()).toBe(true);
    } finally {
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    }
});

test('writeText throws on non-string input', async () => {
    const result = await clipboard.writeText(123 as unknown as string);
    expect(result.isErr()).toBe(true);
});

test('clipboard round-trip', async () => {
    let storedData = '';
    const mockWriteText = vi.fn().mockImplementation((data: string) => {
        storedData = data;
        return Promise.resolve();
    });
    const mockReadText = vi.fn().mockImplementation(() => Promise.resolve(storedData));

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: mockWriteText,
            readText: mockReadText,
        },
        configurable: true,
    });

    try {
        const testData = 'Hello, 世界!';
        await clipboard.writeText(testData);
        const result = await clipboard.readText();
        expect(result.unwrap()).toBe(testData);
    } finally {
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    }
});
