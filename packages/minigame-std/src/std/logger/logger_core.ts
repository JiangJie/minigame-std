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
    // 清理旧插件资源（不触发默认 state 创建）
    lazyState.get().inspect(state => {
        for (const plugin of state.plugins) {
            plugin.onDestroy?.();
        }
    });

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

    // 拦截全局 console（不提供 restore，如需 restore 请用独立 injectConsole 函数）
    if (config.injectConsole) {
        injectConsole();
    }
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

/**
 * 拦截全局 `console` 方法，将其重定向到 logger。
 *
 * 调用后，`console.debug`/`info`/`warn`/`error`（以及 `console.log`）会经过
 * logger 的 `dispatchLog`，触发插件 pipeline（如 `fileLog`）。
 *
 * logger 自身的 console 输出使用模块加载时捕获的原始方法（`CONSOLE_FN`），
 * 不会递归。
 *
 * @returns restore 函数，调用后恢复原始 `console` 方法。
 * @since unreleased
 * @example
 * ```ts
 * logger.init({ plugins: [fileLog()] });
 * const restore = injectConsole();
 * // 之后所有 console.info(...) 会走 logger pipeline
 * console.info('App started'); // → file 写入 + console 输出
 * restore(); // 需要时恢复
 * ```
 */
export function injectConsole(): () => void {
    const original = {
        log: console.log,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };

    // console.log 映射到 info 级别（console.log ≈ console.info）
    console.log = (...args: unknown[]) => info(...args);
    console.debug = (...args: unknown[]) => debug(...args);
    console.info = (...args: unknown[]) => info(...args);
    console.warn = (...args: unknown[]) => warn(...args);
    console.error = (...args: unknown[]) => error(...args);

    return () => {
        console.log = original.log;
        console.debug = original.debug;
        console.info = original.info;
        console.warn = original.warn;
        console.error = original.error;
    };
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
