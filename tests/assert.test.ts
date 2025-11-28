// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
(globalThis as any).__MINIGAME_STD_MINA__ = false;

import { assertThrows } from '@std/assert';
import { assertSafeSocketUrl, assertSafeUrl, assertString } from 'minigame-std';

Deno.test('assertString accepts valid strings', () => {
    assertString('hello');
    assertString('');
    assertString('中文字符串');
    assertString('123');
});

Deno.test('assertString rejects non-strings', () => {
    assertThrows(
        () => assertString(123 as any),
        Error,
        'Param must be a string'
    );
    
    assertThrows(
        () => assertString(null as any),
        Error,
        'Param must be a string'
    );
    
    assertThrows(
        () => assertString(undefined as any),
        Error,
        'Param must be a string'
    );
    
    assertThrows(
        () => assertString({} as any),
        Error,
        'Param must be a string'
    );
});

Deno.test('assertSafeUrl accepts valid HTTPS URLs', () => {
    assertSafeUrl('https://example.com');
    assertSafeUrl('https://example.com/path');
    assertSafeUrl('https://example.com:8080/path?query=value');
    assertSafeUrl('https://sub.domain.example.com');
});

Deno.test('assertSafeUrl rejects HTTP URLs', () => {
    assertThrows(
        () => assertSafeUrl('http://example.com'),
        Error,
        'Url must start with https://'
    );
});

Deno.test('assertSafeUrl rejects non-string values', () => {
    assertThrows(
        () => assertSafeUrl(123 as any),
        Error,
        'Url must be a string'
    );
});

Deno.test('assertSafeUrl rejects invalid protocols', () => {
    assertThrows(
        () => assertSafeUrl('ftp://example.com'),
        Error,
        'Url must start with https://'
    );
    
    assertThrows(
        () => assertSafeUrl('ws://example.com'),
        Error,
        'Url must start with https://'
    );
    
    assertThrows(
        () => assertSafeUrl('//example.com'),
        Error,
        'Url must start with https://'
    );
    
    assertThrows(
        () => assertSafeUrl('example.com'),
        Error,
        'Url must start with https://'
    );
});

Deno.test('assertSafeSocketUrl accepts valid WSS URLs', () => {
    assertSafeSocketUrl('wss://example.com');
    assertSafeSocketUrl('wss://example.com/socket');
    assertSafeSocketUrl('wss://example.com:8080/socket?query=value');
});

Deno.test('assertSafeSocketUrl rejects WS URLs', () => {
    assertThrows(
        () => assertSafeSocketUrl('ws://example.com'),
        Error,
        'SocketUrl must start with wss://'
    );
});

Deno.test('assertSafeSocketUrl rejects non-string values', () => {
    assertThrows(
        () => assertSafeSocketUrl(123 as any),
        Error,
        'SocketUrl must be a string'
    );
});

Deno.test('assertSafeSocketUrl rejects HTTPS URLs', () => {
    assertThrows(
        () => assertSafeSocketUrl('https://example.com'),
        Error,
        'SocketUrl must start with wss://'
    );
});

Deno.test('assertSafeSocketUrl rejects invalid protocols', () => {
    assertThrows(
        () => assertSafeSocketUrl('http://example.com'),
        Error,
        'SocketUrl must start with wss://'
    );
    
    assertThrows(
        () => assertSafeSocketUrl('example.com'),
        Error,
        'SocketUrl must start with wss://'
    );
});
