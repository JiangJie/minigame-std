/**
 * 跨平台统一的日志模块，提供贴近 `console` 的日志 API，支持插件化扩展。
 *
 * @module
 * @example
 * ```ts
 * import { logger, fileLog, wxLog } from 'minigame-std';
 *
 * const file = fileLog({ level: 'debug' });
 *
 * logger.init({
 *     level: 'info',
 *     console: { level: 'warn' },
 *     plugins: [file, wxLog({ level: 'warn' })],
 * });
 *
 * logger.info('App started');
 * await file.flush();
 * ```
 */

export * from './defines.ts';
export * from './logger_core.ts';
export * from './plugins/defines.ts';
export * from './plugins/file_logger.ts';
export * from './plugins/mina_logger.ts';
