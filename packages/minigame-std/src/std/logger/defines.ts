/**
 * 日志系统核心类型定义。
 */

/**
 * 日志级别，从低到高排列。
 *
 * @since unreleased
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';


/**
 * 单条日志记录。
 *
 * @since unreleased
 */
export interface LogEntry {
    /**
     * 日志时间戳（毫秒，epoch millis）。
     *
     * 使用 `number` 而非 `Date` 以减少 GC 开销，并保证 JSON 序列化无歧义。
     */
    timestamp: number;
    level: LogLevel;
    message: string;
}

/**
 * 日志过滤函数。
 *
 * @since unreleased
 */
export type LogFilter = (level: LogLevel, ...args: unknown[]) => boolean;

/**
 * 日志格式化函数。
 *
 * @since unreleased
 */
export type LogFormatter = (entry: LogEntry) => string;


// ── Plugin Types ────────────────────────────────────────────────

/**
 * Plugin 初始化上下文。
 *
 * @since unreleased
 */
export interface PluginContext {
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
 * @since unreleased
 */
export interface LoggerPlugin {
    readonly name: string;
    onInit?: (ctx: PluginContext) => void;
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
 * @since unreleased
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
 * @since unreleased
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
}
