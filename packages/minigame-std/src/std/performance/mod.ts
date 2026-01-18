import { isMinaEnv } from '../../macros/env.ts';

/**
 * 参见`performance.now()`
 * @returns 当前时间以微秒为单位的时间戳
 * @since 1.0.0
 * @example
 * ```ts
 * const start = getPerformanceNow();
 * // 执行一些操作...
 * const end = getPerformanceNow();
 * console.log('耗时:', end - start, 'ms');
 * ```
 */
export function getPerformanceNow(): number {
    return isMinaEnv()
        ? wx.getPerformance().now()
        : performance.now();
}