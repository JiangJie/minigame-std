import { isMinaEnv } from '../../macros/env.ts';

/**
 * 参见`performance.now()`
 * @returns 当前时间以微秒为单位的时间戳
 */
export function getPerformanceNow(): number {
    return isMinaEnv()
        ? wx.getPerformance().now()
        : performance.now();
}