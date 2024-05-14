import type { AsyncResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts' with { type: 'macros' };
import { readText as minaReadText, writeText as minaWriteText } from './mina_clipboard.ts';
import { readText as webReadText, writeText as webWriteText } from './web_clipboard.ts';

type WriteResult = AsyncResult<boolean, DOMException | WechatMinigame.GeneralCallbackResult>;
type ReadResult = AsyncResult<string, DOMException | WechatMinigame.GeneralCallbackResult>;

export function writeText(data: string): WriteResult {
    return isMinaEnv() ? minaWriteText(data) as WriteResult : webWriteText(data) as WriteResult;
}

export function readText(): ReadResult {
    return isMinaEnv() ? minaReadText() as ReadResult : webReadText() as ReadResult;
}