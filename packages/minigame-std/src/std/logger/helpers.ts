/**
 * 日志系统工具函数。
 *
 * @internal
 */

import type { LogLevel } from './defines.ts';

// #region Internal Variables

const LOG_LEVEL_INDEX: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

// #endregion

/**
 * 判断给定级别是否满足最低级别要求。
 *
 * @param entryLevel - 日志条目的级别。
 * @param minLevel - 最低允许的级别。
 * @returns `entryLevel >= minLevel` 时返回 `true`。
 */
export function shouldLog(entryLevel: LogLevel, minLevel: LogLevel): boolean {
    return LOG_LEVEL_INDEX[entryLevel] >= LOG_LEVEL_INDEX[minLevel];
}
