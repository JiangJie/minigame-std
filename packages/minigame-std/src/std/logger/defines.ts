/**
 * 日志系统核心类型定义。
 */

/**
 * 日志级别，从低到高排列。
 *
 * @since 2.6.0
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';


/**
 * 单条日志记录。
 *
 * @since 2.6.0
 */
export interface LogEntry {
    /**
     * 日志时间戳（毫秒，epoch millis）。
     *
     * 使用 `number` 而非 `Date` 以减少 GC 开销，并保证 JSON 序列化无歧义。
     */
    timestamp: number;
    /**
     * 日志级别。
     */
    level: LogLevel;
    /**
     * 已格式化的日志消息。
     */
    message: string;
}

/**
 * 日志过滤函数。
 *
 * @since 2.6.0
 */
export type LogFilter = (level: LogLevel, ...args: unknown[]) => boolean;

/**
 * 日志格式化函数。
 *
 * @since 2.6.0
 */
export type LogFormatter = (entry: LogEntry) => string;


// ── Plugin Types ────────────────────────────────────────────────

/**
 * Plugin 初始化上下文。
 *
 * @since 2.6.0
 */
export interface PluginContext {
    /**
     * 全局最低日志级别（来自 `LoggerConfig.level`）。
     */
    globalLevel: LogLevel;
    /**
     * 全局日志过滤函数。
     *
     * 可能为 `undefined`（未设置全局 filter）。
     */
    filter?: LogFilter;
}

/**
 * 日志插件接口。
 *
 * @since 2.6.0
 */
export interface LoggerPlugin {
    /**
     * 插件名称，用于标识和调试。
     */
    readonly name: string;
    /**
     * 插件初始化回调。
     *
     * logger 核心在 `init` 时调用，传入全局上下文，插件可据此继承全局配置。
     */
    onInit?: (ctx: PluginContext) => void;
    /**
     * 日志分发回调。
     *
     * logger 核心在每条日志通过级别与 filter 后调用，接收原始参数
     *（`level, ...args`），由插件自行决定格式化与落盘策略。
     */
    onLog?: (level: LogLevel, ...args: unknown[]) => void;
    /**
     * 插件销毁回调。
     *
     * 由 logger 核心在 `init` 重新初始化时对旧插件调用，用于清理资源
     *（如 `clearInterval`、移除事件监听等）。
     */
    onDestroy?: () => void;
}

// ── Console Config ──────────────────────────────────────────────

/**
 * 控制台输出配置。
 *
 * @since 2.6.0
 */
export interface ConsolePluginConfig {
    /**
     * 是否启用控制台输出。
     *
     * @defaultValue `true`
     */
    enabled?: boolean;
    /**
     * 控制台最低输出级别。
     *
     * @defaultValue 继承 `LoggerConfig.level`
     */
    level?: LogLevel;
}

// ── Logger Config & State ───────────────────────────────────────

/**
 * 日志系统配置。
 *
 * @since 2.6.0
 */
export interface LoggerConfig {
    /**
     * 全局最低日志级别。
     *
     * @defaultValue `'info'`
     */
    level?: LogLevel;
    /**
     * 全局日志过滤函数。
     */
    filter?: LogFilter;
    /**
     * 控制台输出配置。
     */
    console?: ConsolePluginConfig;
    /**
     * 插件列表。
     *
     * @defaultValue `[]`
     */
    plugins?: LoggerPlugin[];
    /**
     * 是否拦截全局 `console` 方法并重定向到 logger。
     *
     * 设为 `true` 后，`console.debug`/`info`/`warn`/`error`/`log` 会经过
     * logger 的 `dispatchLog`，触发插件 pipeline。
     *
     * **注意**：此方式不提供 restore 功能。如需恢复原始 `console`，
     * 请使用独立的 {@link injectConsole} 函数（返回 restore 函数）。
     *
     * @defaultValue `false`
     */
    injectConsole?: boolean;
}
