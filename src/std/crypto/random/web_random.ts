export function getRandomValues(length: number): Uint8Array {
    const u8a = new Uint8Array(length);
    crypto.getRandomValues(u8a);

    return u8a;
}

export const randomUUID = crypto.randomUUID;