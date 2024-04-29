/**
 * assert function
 * @param expr
 * @param createMsg return a string message to throw
 */
function invariant(expr: unknown, createMsg: () => string): void {
    if (!expr) {
        throw new TypeError(createMsg());
    }
}

export function assertString(str: string): void {
    invariant(typeof str === 'string', () => `Param must be a string. Received ${ JSON.stringify(str) }`);
}

/**
 * assert url starts with https://
 *
 * @param url
 */
export function assertSafeUrl(url: string): void {
    invariant(typeof url === 'string', () => `Url must be a string. Received ${ JSON.stringify(url) }`);
    invariant(url.startsWith('https://'), () => `Url must start with https://. Received ${ JSON.stringify(url) }`);
}

/**
 * assert socket url starts with wss://
 *
 * @param url
 */
export function assertSafeSocketUrl(url: string): void {
    invariant(typeof url === 'string', () => `SocketUrl must be a string. Received ${ JSON.stringify(url) }`);
    invariant(url.startsWith('wss://'), () => `SocketUrl must start with wss://. Received ${ JSON.stringify(url) }`);
}