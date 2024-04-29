export function encodeBase64(data: string): string {
    return btoa(unescape(encodeURIComponent(data)));
}

export function decodeBase64(data: string): string {
    return decodeURIComponent(escape(atob(data)));
}