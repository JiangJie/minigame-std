/**
 * 日志系统核心逻辑：单例状态管理、日志流水线、插件调度。
 */

import { Lazy } from 'happy-rusty';
import type {
    LogFilter,
    LoggerConfig,
    LoggerPlugin,
    LogLevel,
    PluginContext,
} from './defines.ts';
import { shouldLog } from './helpers.ts';

// #region Internal Variables

/**
 * Console 方法映射。
 *
 * `.bind(console)` 防止直接传递方法引用时 `this` 上下文丢失。
 */
const CONSOLE_FN: Record<LogLevel, (...args: unknown[]) => void> = {
    'debug': console.debug.bind(console),
    'info': console.info.bind(console),
    'warn': console.warn.bind(console),
    'error': console.error.bind(console),
};

/**
 * 全局单例状态（懒初始化）。
 */
let lazyState = /*#__PURE__*/ Lazy(() => createDefaultState());

// #endregion

/**
 * 初始化日志系统。
 *
 * @param config - 日志系统配置。
 * @since unreleased
 * @example
 * ```ts
 * const file = fileLog({ level: 'debug' });
 * logger.init({ plugins: [file, wxLog({ level: 'warn' })] });
 * ```
 */
export function init(config: LoggerConfig = {}): void {
    const level = config.level ?? 'info';
    const plugins = config.plugins ?? [];

    const ctx: PluginContext = { globalLevel: level, filter: config.filter };

    // 调用每个 plugin 的 onInit
    for (const plugin of plugins) {
        plugin.onInit?.(ctx);
    }

    const newState: LoggerState = {
        console: {
            enabled: config.console?.enabled ?? true,
            level: config.console?.level ?? level,
            filter: config.filter,
        },
        plugins,
    };

    lazyState = Lazy(() => newState);
}

/**
 * 输出 debug 级别日志。
 * @since unreleased
 */
export function debug(...args: unknown[]): void {
    dispatchLog('debug', ...args);
}

/**
 * 输出 info 级别日志。
 * @since unreleased
 */
export function info(...args: unknown[]): void {
    dispatchLog('info', ...args);
}

/**
 * 输出 warn 级别日志。
 * @since unreleased
 */
export function warn(...args: unknown[]): void {
    dispatchLog('warn', ...args);
}

/**
 * 输出 error 级别日志。
 * @since unreleased
 */
export function error(...args: unknown[]): void {
    dispatchLog('error', ...args);
}

// #region Internal Types

/**
 * 日志系统运行时状态。
 *
 * 封装控制台输出配置、过滤器和插件列表。通过 init 创建，仅供模块内部使用。
 */
interface LoggerState {
    console: {
        enabled: boolean;
        level: LogLevel;
        filter?: LogFilter;
    };
    plugins: LoggerPlugin[];
}

// #endregion

// #region Internal Functions

function createDefaultState(): LoggerState {
    return {
        console: {
            enabled: true,
            level: 'info',
        },
        plugins: [],
    };
}

/**
 * 统一的日志分发入口。
 *
 * 控制台和插件均接收原始参数，由各消费端自行决定如何格式化或过滤。
 */
function dispatchLog(level: LogLevel, ...args: unknown[]): void {
    const state = lazyState.force();

    // 1. 控制台输出
    if (state.console.enabled
        && shouldLog(level, state.console.level)
        && (!state.console.filter || state.console.filter(level, ...args))) {
        CONSOLE_FN[level](...args);
    }

    // 2. 插件回调
    for (const plugin of state.plugins) {
        plugin.onLog?.(level, ...args);
    }
}

// #endregion
