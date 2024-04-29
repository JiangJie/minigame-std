import { isMinaEnv } from '../../macros/env.ts' with { type: 'macros' };
import { decodeBase64 as minaDecodeBase64, encodeBase64 as minaEncodeBase64 } from './mina_base64.ts';
import { decodeBase64 as webDecodeBase64, encodeBase64 as webEncodeBase64 } from './web_base64.ts';
export { base64FromArrayBuffer, base64ToArrayBuffer } from './base64.ts';

export function encodeBase64(data: string): string {
    return isMinaEnv() ? minaEncodeBase64(data) : webEncodeBase64(data);
}

export function decodeBase64(data: string): string {
    return isMinaEnv() ? minaDecodeBase64(data) : webDecodeBase64(data);
}