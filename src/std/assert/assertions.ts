import invariant from 'tiny-invariant';

export function assertString(str: string): void {
    invariant(typeof str === 'string', () => `Param must be a string but received ${ str }`);
}

/**
 * assert url starts with https://
 *
 * @param url
 */
export function assertSafeUrl(url: string): void {
    invariant(typeof url === 'string', () => `Url must be a string but received ${ url }`);
    invariant(url.startsWith('https://'), () => `Url must start with https:// but received ${ url }`);
}

/**
 * assert socket url starts with wss://
 *
 * @param url
 */
export function assertSafeSocketUrl(url: string): void {
    invariant(typeof url === 'string', () => `SocketUrl must be a string but received ${ url }`);
    invariant(url.startsWith('wss://'), () => `SocketUrl must start with wss:// but received ${ url }`);
}