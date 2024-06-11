import invariant from 'tiny-invariant';

/**
 * 断言传入的是一个字符串。
 * @param str - 需要断言的字符串。
 */
export function assertString(str: string): void {
    invariant(typeof str === 'string', () => `Param must be a string but received ${ str }`);
}

/**
 * 断言传入的 URL 是否为 `https` 协议。
 * @param url - 需要断言的 URL 字符串。
 */
export function assertSafeUrl(url: string): void {
    invariant(typeof url === 'string', () => `Url must be a string but received ${ url }`);
    invariant(url.startsWith('https://'), () => `Url must start with https:// but received ${ url }`);
}

/**
 * 断言传入的 WebSocket URL 是否为 `wss` 协议。
 * @param url - 需要断言的 WebSocket URL 字符串。
 */
export function assertSafeSocketUrl(url: string): void {
    invariant(typeof url === 'string', () => `SocketUrl must be a string but received ${ url }`);
    invariant(url.startsWith('wss://'), () => `SocketUrl must start with wss:// but received ${ url }`);
}