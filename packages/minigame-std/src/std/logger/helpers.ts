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

/**
 * 将日志参数列表转为消息字符串。
 *
 * 单参数直接序列化，多参数用空格拼接，避免不必要的 map/join 开销。
 */
export function buildMessage(args: unknown[]): string {
    return args.length === 1
        ? stringifyArg(args[0])
        : args.map(stringifyArg).join(' ');
}

// #region Internal Functions

/**
 * 将单个参数转为字符串。
 *
 * string 原样返回；bigint 转 `` `${value}n` ``；object 尝试 JSON 序列化
 *（含 BigInt replacer fallback）；其余用 String()。
 */
function stringifyArg(arg: unknown): string {
    if (typeof arg === 'bigint') {
        return `${arg}n`;
    }

    if (typeof arg === 'object' && arg !== null) {
        try {
            return JSON.stringify(arg, (_, v) =>
                typeof v === 'bigint' ? `${v}n` : v,
            );
        } catch {
            // 循环引用等，最终 fallback
            return String(arg);
        }
    }

    return String(arg);
}

// #endregion
