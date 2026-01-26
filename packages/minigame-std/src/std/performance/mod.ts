import { Lazy } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { isMiniGameDevtools } from '../platform/target.ts';

// #region Internal Variables

/**
 * 小游戏性能管理器实例。
 *
 */
const minaPerformance = Lazy(() => wx.getPerformance());

// #endregion

/**
 * 参见`performance.now()`
 * @returns 当前时间以毫秒为单位的时间戳
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
        // 小游戏 的 performance.now() 返回的是微秒
        // NOTE: 但是小游戏开发者工具返回的是毫秒
        ? minaPerformance.force().now() / (isMiniGameDevtools() ? 1 : 1000)
        : performance.now();
}
