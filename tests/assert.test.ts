import { expect, test } from 'vitest';
import { assertSafeSocketUrl, assertSafeUrl, assertString } from 'minigame-std';

test('assertString accepts valid strings', () => {
    assertString('hello');
    assertString('');
    assertString('中文字符串');
    assertString('123');
});

test('assertString rejects non-strings', () => {
    expect(() => assertString(123 as unknown as string)).toThrow('Param must be a string');
    expect(() => assertString(null as unknown as string)).toThrow('Param must be a string');
    expect(() => assertString(undefined as unknown as string)).toThrow('Param must be a string');
    expect(() => assertString({} as unknown as string)).toThrow('Param must be a string');
});

test('assertSafeUrl accepts valid HTTPS URLs', () => {
    assertSafeUrl('https://example.com');
    assertSafeUrl('https://example.com/path');
    assertSafeUrl('https://example.com:8080/path?query=value');
    assertSafeUrl('https://sub.domain.example.com');
});

test('assertSafeUrl rejects HTTP URLs', () => {
    expect(() => assertSafeUrl('http://example.com')).toThrow('Url must start with https://');
});

test('assertSafeUrl rejects non-string values', () => {
    expect(() => assertSafeUrl(123 as unknown as string)).toThrow('Url must be a string');
});

test('assertSafeUrl rejects invalid protocols', () => {
    expect(() => assertSafeUrl('ftp://example.com')).toThrow('Url must start with https://');
    expect(() => assertSafeUrl('ws://example.com')).toThrow('Url must start with https://');
    expect(() => assertSafeUrl('//example.com')).toThrow('Url must start with https://');
    expect(() => assertSafeUrl('example.com')).toThrow('Url must start with https://');
});

test('assertSafeSocketUrl accepts valid WSS URLs', () => {
    assertSafeSocketUrl('wss://example.com');
    assertSafeSocketUrl('wss://example.com/socket');
    assertSafeSocketUrl('wss://example.com:8080/socket?query=value');
});

test('assertSafeSocketUrl rejects WS URLs', () => {
    expect(() => assertSafeSocketUrl('ws://example.com')).toThrow('SocketUrl must start with wss://');
});

test('assertSafeSocketUrl rejects non-string values', () => {
    expect(() => assertSafeSocketUrl(123 as unknown as string)).toThrow('SocketUrl must be a string');
});

test('assertSafeSocketUrl rejects HTTPS URLs', () => {
    expect(() => assertSafeSocketUrl('https://example.com')).toThrow('SocketUrl must start with wss://');
});

test('assertSafeSocketUrl rejects invalid protocols', () => {
    expect(() => assertSafeSocketUrl('http://example.com')).toThrow('SocketUrl must start with wss://');
    expect(() => assertSafeSocketUrl('example.com')).toThrow('SocketUrl must start with wss://');
});
