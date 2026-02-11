import { expect, test } from 'vitest';
// Internal functions - import directly from source for testing
import { validatePositiveInteger, validateSafeSocketUrl, validateSafeUrl, validateString } from '../src/std/internal/mod.ts';

// validateString tests
test('validateString returns Ok for valid strings', () => {
    expect(validateString('hello', 'test').isOk()).toBe(true);
    expect(validateString('', 'test').isOk()).toBe(true);
    expect(validateString('中文字符串', 'test').isOk()).toBe(true);
    expect(validateString('123', 'test').isOk()).toBe(true);
});

test('validateString returns Err for non-strings', () => {
    expect(validateString(123 as unknown as string, 'test').isErr()).toBe(true);
    expect(validateString(null as unknown as string, 'test').isErr()).toBe(true);
    expect(validateString(undefined as unknown as string, 'test').isErr()).toBe(true);
    expect(validateString({} as unknown as string, 'test').isErr()).toBe(true);
});

test('validateString error message includes param name', () => {
    const result = validateString(123 as unknown as string, 'data');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain("'data'");
});

// validatePositiveInteger tests
test('validatePositiveInteger returns Ok for valid positive integers', () => {
    expect(validatePositiveInteger(1, 'count').isOk()).toBe(true);
    expect(validatePositiveInteger(100, 'count').isOk()).toBe(true);
    expect(validatePositiveInteger(Number.MAX_SAFE_INTEGER, 'count').isOk()).toBe(true);
});

test('validatePositiveInteger returns TypeError for non-number types', () => {
    const result = validatePositiveInteger('1' as unknown as number, 'length');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(TypeError);
    expect(result.unwrapErr().message).toContain("'length'");
});

test('validatePositiveInteger returns Error for non-positive-integer numbers', () => {
    const zeroResult = validatePositiveInteger(0, 'length');
    expect(zeroResult.isErr()).toBe(true);
    expect(zeroResult.unwrapErr()).toBeInstanceOf(Error);
    expect(zeroResult.unwrapErr()).not.toBeInstanceOf(TypeError);

    const negativeResult = validatePositiveInteger(-1, 'length');
    expect(negativeResult.isErr()).toBe(true);
    expect(negativeResult.unwrapErr()).not.toBeInstanceOf(TypeError);

    const floatResult = validatePositiveInteger(1.5, 'length');
    expect(floatResult.isErr()).toBe(true);
    expect(floatResult.unwrapErr()).not.toBeInstanceOf(TypeError);
});

test('validatePositiveInteger error message includes param name', () => {
    const result = validatePositiveInteger(-1, 'size');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain("'size'");
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
