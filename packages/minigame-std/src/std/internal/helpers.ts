/**
 * @internal
 * 内部辅助函数。
 */

import type { FetchTask } from '@happy-ts/fetch-t';
import type { IOResult } from 'happy-rusty';

/**
 * 创建一个已失败的 FetchTask 对象。
 * @param errResult - 错误结果。
 * @returns 返回一个已完成的失败 FetchTask。
 */
export function createFailedFetchTask<T>(errResult: IOResult<unknown>): FetchTask<T> {
    return {
        abort(): void { /* noop */ },
        get aborted(): boolean { return false; },
        get result() { return Promise.resolve(errResult.asErr<T>()); },
    };
}