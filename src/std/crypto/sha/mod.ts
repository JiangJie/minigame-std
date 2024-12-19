import { isMinaEnv } from '../../../macros/env.ts';
import type { DataSource } from '../../defines.ts';
import {
    sha1 as minaSHA1,
    sha256 as minaSHA256,
    sha384 as minaSHA384,
    sha512 as minaSHA512,
} from './mina_sha.ts';
import { sha as webSHA } from './web_sha.ts';

/**
 * 计算 SHA-1。
 */
export function sha1(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA1(data))
        : webSHA(data, 'SHA-1');
}

/**
 * 计算 SHA-256。
 */
export function sha256(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA256(data))
        : webSHA(data, 'SHA-256');
}

/**
 * 计算 SHA-384。
 */
export function sha384(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA384(data))
        : webSHA(data, 'SHA-384');
}

/**
 * 计算 SHA-512。
 */
export function sha512(data: DataSource): Promise<string> {
    return isMinaEnv()
        ? Promise.resolve(minaSHA512(data))
        : webSHA(data, 'SHA-512');
}