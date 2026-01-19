import { expect, test } from 'vitest';
// Internal functions - import directly from source for testing
import { validateSafeSocketUrl, validateSafeUrl, validateString } from '../src/std/internal/mod.ts';

// validateString tests
test('validateString returns Ok for valid strings', () => {
    expect(validateString('hello').isOk()).toBe(true);
    expect(validateString('').isOk()).toBe(true);
    expect(validateString('中文字符串').isOk()).toBe(true);
    expect(validateString('123').isOk()).toBe(true);
});

test('validateString returns Err for non-strings', () => {
    expect(validateString(123 as unknown as string).isErr()).toBe(true);
    expect(validateString(null as unknown as string).isErr()).toBe(true);
    expect(validateString(undefined as unknown as string).isErr()).toBe(true);
    expect(validateString({} as unknown as string).isErr()).toBe(true);
});

test('validateString error message includes param name', () => {
    const result = validateString(123 as unknown as string, 'data');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain("'data'");
});

// validateSafeUrl tests
test('validateSafeUrl accepts valid HTTPS URLs', () => {
    expect(validateSafeUrl('https://example.com').isOk()).toBe(true);
    expect(validateSafeUrl('https://example.com/path').isOk()).toBe(true);
    expect(validateSafeUrl('https://example.com:8080/path?query=value').isOk()).toBe(true);
    expect(validateSafeUrl('https://sub.domain.example.com').isOk()).toBe(true);
});

test('validateSafeUrl rejects HTTP URLs', () => {
    const result = validateSafeUrl('http://example.com');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('https://');
});

test('validateSafeUrl rejects non-string values', () => {
    const result = validateSafeUrl(123 as unknown as string);
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(TypeError);
});

test('validateSafeUrl rejects invalid protocols', () => {
    expect(validateSafeUrl('ftp://example.com').isErr()).toBe(true);
    expect(validateSafeUrl('ws://example.com').isErr()).toBe(true);
    expect(validateSafeUrl('//example.com').isErr()).toBe(true);
    expect(validateSafeUrl('example.com').isErr()).toBe(true);
});

// validateSafeSocketUrl tests
test('validateSafeSocketUrl accepts valid WSS URLs', () => {
    expect(validateSafeSocketUrl('wss://example.com').isOk()).toBe(true);
    expect(validateSafeSocketUrl('wss://example.com/socket').isOk()).toBe(true);
    expect(validateSafeSocketUrl('wss://example.com:8080/socket?query=value').isOk()).toBe(true);
});

test('validateSafeSocketUrl rejects WS URLs', () => {
    const result = validateSafeSocketUrl('ws://example.com');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('wss://');
});

test('validateSafeSocketUrl rejects non-string values', () => {
    const result = validateSafeSocketUrl(123 as unknown as string);
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(TypeError);
});

test('validateSafeSocketUrl rejects HTTPS URLs', () => {
    const result = validateSafeSocketUrl('https://example.com');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('wss://');
});

test('validateSafeSocketUrl rejects invalid protocols', () => {
    expect(validateSafeSocketUrl('http://example.com').isErr()).toBe(true);
    expect(validateSafeSocketUrl('example.com').isErr()).toBe(true);
});
