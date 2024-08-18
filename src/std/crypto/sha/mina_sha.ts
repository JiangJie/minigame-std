import { sha1 as SHA1, sha256 as SHA256, sha384 as SHA384, sha512 as SHA512 } from 'rsa-oaep-encryption';
import { byteStringFromBuffer, textEncode } from '../../codec/mod.ts';

/**
 * 将 UTF-8 字符串转换为 ByteString。
 */
function toByteString(data: string | BufferSource): string {
    const buffer = typeof data === 'string'
        ? textEncode(data)
        : data;

    return byteStringFromBuffer(buffer);
}

export function sha1(data: string | BufferSource): string {
    return SHA1.create().update(toByteString(data)).digest().toHex();
}

export function sha256(data: string | BufferSource): string {
    return SHA256.create().update(toByteString(data)).digest().toHex();
}

export function sha384(data: string | BufferSource): string {
    return SHA384.create().update(toByteString(data)).digest().toHex();
}

export function sha512(data: string | BufferSource): string {
    return SHA512.create().update(toByteString(data)).digest().toHex();
}