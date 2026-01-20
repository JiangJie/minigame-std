/**
 * @internal
 * 内部常量。
 */

import { RESULT_VOID, type AsyncVoidResult } from 'happy-rusty';

export const ASYNC_RESULT_VOID: AsyncVoidResult<never> = Promise.resolve(RESULT_VOID);