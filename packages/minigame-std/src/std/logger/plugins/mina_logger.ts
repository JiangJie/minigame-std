/**
 * wx.getLogManager 插件：声明式创建 wxLog。
 */

import { Lazy } from 'happy-rusty';
import type { LogFilter, LoggerPlugin, LogLevel, PluginContext } from '../defines.ts';
import { shouldLog } from '../helpers.ts';
import type { PluginConfigBase } from './defines.ts';

// ── Plugin Types ─────────────────────────────────────────────────

/**
 * wx.getLogManager 插件配置（仅小游戏生效）。
 *
 * @since unreleased
 */
export interface WxLogPluginConfig extends PluginConfigBase {
    /**
     * 透传给 `wx.getLogManager` 的参数。
     *
     * {@link WechatMinigame.GetLogManagerOption.level}
     *
     * @defaultValue `0`
     */
    rawLevel?: 0 | 1;
}

// ── Plugin API ───────────────────────────────────────────────────

/**
 * 创建 wx.getLogManager 插件（仅小游戏生效）。
 *
 * @param config - 插件配置。
 * @returns LoggerPlugin 实例。
 * @since unreleased
 * @example
 * ```ts
 * logger.init({ plugins: [wxLog({ level: 'warn' })] });
 * ```
 */
export function wxLog(config: WxLogPluginConfig = {}): LoggerPlugin {
    const logManager = Lazy(() => wx.getLogManager({ level: config.rawLevel ?? 0 }));

    let level: LogLevel;
    let filter: LogFilter | null | undefined;

    return {
        name: 'wxLog',

        onInit(ctx: PluginContext): void {
            level = config.level ?? ctx.globalLevel;
            filter = config.filter !== undefined ? config.filter : ctx.filter;
        },

        onLog(lvl: LogLevel, ...args: unknown[]): void {
            if (!shouldLog(lvl, level)) return;
            if (filter && !filter(lvl, ...args)) return;

            const manager = logManager.force();

            switch (lvl) {
                case 'debug':
                    manager.debug(...args);
                    break;
                case 'info':
                    manager.info(...args);
                    break;
                case 'warn':
                    manager.warn(...args);
                    break;
                case 'error':
                    // wx.getLogManager 没有 error 方法，故降级为 warn
                    manager.warn('[ERROR]', ...args);
                    break;
            }
        },
    };
}
