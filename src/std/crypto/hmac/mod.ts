import { isMinaEnv } from '../../../macros/env.ts';
import { toByteString } from '../../codec/mod.ts';
import type { DataSource } from '../../defines.ts';
import type { SHA } from '../crypto_defines.ts';
import { createHMAC as minaCreateHMAC } from './mina_hmac.ts';
import { createHMAC as webCreateHMAC } from './web_hmac.ts';

function shaHMAC(sha: SHA, key: DataSource, data: DataSource): Promise<string> {
    if (isMinaEnv()) {
        const hmac = minaCreateHMAC(sha, toByteString(key));
        hmac.update(toByteString(data));
        return Promise.resolve(hmac.digest().toHex());
    }

    return webCreateHMAC(sha, key, data);
}

/**
 * 计算 SHA-1 HMAC。
 */
export function sha1HMAC(key: DataSource, data: DataSource): Promise<string> {
    return shaHMAC('SHA-1', key, data);
}

/**
 * 计算 SHA-256 HMAC。
 */
export function sha256HMAC(key: DataSource, data: DataSource): Promise<string> {
    return shaHMAC('SHA-256', key, data);
}

/**
 * 计算 SHA-384 HMAC。
 */
export function sha384HMAC(key: DataSource, data: DataSource): Promise<string> {
    return shaHMAC('SHA-384', key, data);
}

/**
 * 计算 SHA-512 HMAC。
 */
export function sha512HMAC(key: DataSource, data: DataSource): Promise<string> {
    return shaHMAC('SHA-512', key, data);
}