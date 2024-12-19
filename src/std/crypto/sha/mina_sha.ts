import { sha1 as SHA1, sha256 as SHA256, sha384 as SHA384, sha512 as SHA512 } from 'rsa-oaep-encryption';
import { toByteString } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';

export function sha1(data: DataSource): string {
    return SHA1.create().update(toByteString(data)).digest().toHex();
}

export function sha256(data: DataSource): string {
    return SHA256.create().update(toByteString(data)).digest().toHex();
}

export function sha384(data: DataSource): string {
    return SHA384.create().update(toByteString(data)).digest().toHex();
}

export function sha512(data: DataSource): string {
    return SHA512.create().update(toByteString(data)).digest().toHex();
}