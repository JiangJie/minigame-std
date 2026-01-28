/**
 * @internal
 * 内部常量。
 */

import { RESULT_VOID, type AsyncVoidResult } from 'happy-rusty';

/**
 * 异步返回 void 的成功结果常量。
 */
export const ASYNC_RESULT_VOID: AsyncVoidResult<never> = Promise.resolve(RESULT_VOID);