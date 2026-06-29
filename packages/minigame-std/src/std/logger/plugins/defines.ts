/**
 * Plugin 相关类型定义。
 */

import type { LogFilter, LogLevel } from '../defines.ts';

/**
 * Plugin 可覆盖的基础配置，所有 plugin 配置应继承此接口。
 *
 * @since 2.6.0
 */
export interface PluginConfigBase {
    /**
     * 最低日志级别。
     *
     * @defaultValue 继承全局 `LoggerConfig.level`
     */
    level?: LogLevel;
    /**
     * 日志过滤函数。
     *
     * - `undefined`：继承全局 `LoggerConfig.filter`
     * - `null`：显式禁用过滤
     * - 函数：使用自定义过滤逻辑
     */
    filter?: LogFilter | null;
}
