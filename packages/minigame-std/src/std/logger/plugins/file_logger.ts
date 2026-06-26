/**
 * 文件日志插件：fileLog 工厂，提供缓冲写入、日志分割（period + size）、旧文件清理。
 */

import { gzipSync } from 'fflate/browser';
import type { AsyncIOResult } from 'happy-rusty';
import { encodeUtf8 } from '../../codec/mod.ts';
import { addHideListener } from '../../event/mod.ts';
import {
    appendFile,
    readDir,
    readFile,
    remove,
    stat,
    writeFile,
} from '../../fs/mod.ts';
import type {
    LogEntry,
    LogFilter,
    LogFormatter,
    LoggerPlugin,
    LogLevel,
    PluginContext,
} from '../defines.ts';
import { buildMessage, shouldLog } from '../helpers.ts';
import type { PluginConfigBase } from './defines.ts';

// #region Internal Variables

/**
 * 默认日志文件根目录。
 */
const DEFAULT_ROOT_DIR = '/.minigame-std-logs';

/**
 * 日志级别标签。
 */
const LEVEL_LABELS: Record<LogLevel, string> = {
    debug: 'DEBUG',
    info: 'INFO ',
    warn: 'WARN ',
    error: 'ERROR',
};

// #endregion

/**
 * 日志分割（split）配置。
 *
 * @since unreleased
 */
export interface FileSplitConfig {
    /**
     * 日志文件分割的时间粒度（毫秒）。
     *
     * 同一 period 内的日志写入同一个文件，到期自动切换。
     *
     * @defaultValue `3600000`（1 小时）
     */
    period?: number;
    /**
     * 单个日志文件最大大小（字节）。
     *
     * @defaultValue `10 * 1024 * 1024`（10MB）
     */
    maxSize?: number;
    /**
     * 最多保留的日志文件数。
     *
     * @defaultValue `24`（period 为 1 小时时即一天的日志量）
     */
    maxCount?: number;
    /**
     * 文件最大保留时间（毫秒），创建时间超过此值的文件将被删除。
     *
     * 与 `maxCount` 叠加：先按时间过期删除，剩余文件若仍超 `maxCount` 再按数量删最旧的。
     *
     * @defaultValue `undefined`（不按时间清理）
     */
    maxAge?: number;
    /**
     * 是否使用 UTF-8 字节数计算文件大小（`true`）而非字符数（`false`）。
     *
     * @defaultValue `false`
     */
    useByteSize?: boolean;
    /**
     * 是否在切分时压缩旧日志文件（`.log` → `.log.gz`）。
     *
     * 压缩后原始 `.log` 被删除，压缩是 fire-and-forget，不阻塞日志写入。
     * 注意：压缩后文件变为 `.log.gz`，读取/合并时需先解压。
     *
     * @defaultValue `false`
     */
    compress?: boolean;
}

/**
 * 文件插件配置。
 *
 * @since unreleased
 */
export interface FilePluginConfig extends PluginConfigBase {
    /**
     * 日志格式化器。
     *
     * @defaultValue `defaultFormatter`（`[时间] [级别] 消息\n`）
     */
    formatter?: LogFormatter;
    /**
     * 日志文件根目录。
     *
     * @defaultValue `'/.minigame-std-logs'`
     */
    rootDir?: string;
    /**
     * 日志分割配置。
     */
    split?: FileSplitConfig;
    /**
     * 缓冲区最大条目数，达到后触发 flush。
     *
     * @defaultValue `100`
     */
    maxBufferSize?: number;
    /**
     * 定时 flush 间隔（毫秒），`0` 表示仅靠缓冲区阈值触发。
     *
     * @defaultValue `5000`
     */
    flushInterval?: number;
}

/**
 * 日志文件查询条件。
 *
 * @since unreleased
 */
export interface LogFileQuery {
    /**
     * 起始时间戳（毫秒，含）。按文件创建时间（文件名时间戳）筛选。
     */
    from?: number;
    /**
     * 结束时间戳（毫秒，含）。按文件创建时间（文件名时间戳）筛选。
     */
    to?: number;
}

/**
 * 文件插件 API 接口。
 *
 * @since unreleased
 */
export interface FilePluginAPI extends LoggerPlugin {
    /**
     * 立即将缓冲区内容写入文件，并等待所有在途写入完成。
     *
     * 写入失败不会 reject，也不会返回错误（错误由内部统一处理）。
     */
    flush(): Promise<void>;
    /**
     * 获取日志文件列表，可按文件创建时间筛选。
     *
     * 返回完整路径（`rootDir/文件名.log`），结果按文件名排序。
     * 文件名无法解析时间戳的文件不受 `query` 过滤，始终包含在结果中。
     */
    getFiles(query?: LogFileQuery): AsyncIOResult<string[]>;
    /**
     * 获取日志文件根目录。
     */
    getRootDir(): string;
}

/**
 * 创建文件日志插件。
 *
 * 插件在创建时即完成初始化（恢复/创建活跃文件、启动定时 flush、注册切后台监听），
 * 因此即使不传给 `logger.init()` 也能独立工作。传给 `logger.init()` 后，
 * `onInit` 会用全局配置（`level`/`filter`）refinement 自身配置。
 *
 * **注意**：`onInit`/`onLog` 由 logger 核心调度，不应手动调用。
 *
 * @param config - 文件插件配置。
 * @returns 支持 LoggerPlugin 和文件管理 API 的插件实例。
 * @since unreleased
 * @example
 * ```ts
 * const file = fileLog({ level: 'debug' });
 * logger.init({ plugins: [file] });
 * await file.flush();
 * ```
 */
export function fileLog(config: FilePluginConfig = {}): FilePluginAPI {
    // ── 解析配置 ──
    const rootDir = config.rootDir ?? DEFAULT_ROOT_DIR;
    const split = {
        period: config.split?.period ?? 3600000,
        maxSize: config.split?.maxSize ?? 10 * 1024 * 1024,
        maxCount: config.split?.maxCount ?? 24,
        maxAge: config.split?.maxAge,
        useByteSize: config.split?.useByteSize ?? false,
        compress: config.split?.compress ?? false,
    };
    const maxBufferSize = config.maxBufferSize ?? 100;
    const flushInterval = config.flushInterval ?? 5000;

    // ── 运行时状态（创建即用 config 初始化，不依赖 onInit）──
    // buffer 存预格式化结果，避免 flush 时重复格式化
    const buffer: BufferedEntry[] = [];
    let level: LogLevel = config.level ?? 'info';
    let filter: LogFilter | null | undefined = config.filter;
    const formatter: LogFormatter = config.formatter ?? defaultFormatter;
    // 默认用当前时间戳做文件名，resumeOrCreate 可能改为续写
    let currentFile = newLogPath();
    // 同步累加：writeEntry 时即计入，appendFile 失败会导致 size 偏大但不回滚
    let currentFileSize = 0;
    let currentFileStartTime = Date.now();
    // 定时 flush 定时器，onDestroy 时清理
    let flushTimer: ReturnType<typeof setInterval> | null = null;
    // 切后台监听移除器，onDestroy 时清理
    let hideListenerRemover: (() => void) | null = null;

    // init 异步过程中暂存日志（带原始 timestamp），完成后回放
    const pending: [LogLevel, unknown[], number][] = [];
    let initPromise: Promise<void> | null = null;

    // fire-and-forget 的在途 append，flush() 等待它们完成
    const inFlight = new Set<Promise<void>>();
    // 当前 prune 链的 Promise，null 表示无 prune 在跑
    // 多次 schedulePrune 调用串行链接（chain），避免并发 prune 的重复 IO
    let prunePromise: Promise<void> | null = null;

    // 时间戳对应的 period 序号
    function periodIndex(ts: number): number {
        return Math.floor(ts / split.period);
    }

    // 时间戳是否在当前或未来的 period 内（>= 兼容时间回拨，保证最新日志写最新文件）
    function inCurrentPeriod(ts: number): boolean {
        return periodIndex(ts) >= periodIndex(Date.now());
    }

    // 当前活跃文件是否已离开 period
    function isFileExpired(): boolean {
        return !inCurrentPeriod(currentFileStartTime);
    }

    // 创建新日志文件路径（ISO 时间戳命名，永不碰撞）
    function newLogPath(): string {
        return `${rootDir}/${toLogName()}`;
    }

    // 同步切文件：重置文件路径、period 起点、size
    function newFile(): void {
        if (split.compress && currentFileSize > 0) {
            // currentFile 是 string，传参时值已复制，后续 reassign 不影响
            // Promise.all 调用时同步迭代 inFlight，调用后的新增 append 不影响
            void compressOldFile(currentFile, inFlight)
                .catch(() => {
                    // 压缩失败——原始 .log 仍存在，下次 prune 清理
                });
        }
        currentFile = newLogPath();
        currentFileStartTime = Date.now();
        currentFileSize = 0;
        void schedulePrune();
    }

    // 触发当前 buffer 的 flush（fire-and-forget）
    // 同步 splice + 快照 targetFile，appendFile 并发安全
    function flushCurrent(): void {
        if (buffer.length === 0) return;

        const entries = buffer.splice(0);
        const content = entries.map(e => e.formatted).join('');

        const p = appendFile(currentFile, content)
            .then(() => {
                // 不关心返回值
            })
            .finally(() => {
                // 无论成功失败，都从 inFlight 移除自己
                inFlight.delete(p);
            })
            .catch(() => {
                // 吞掉意外 rejection，保证 flush() 的 Promise.all 不被 reject
            });

        inFlight.add(p);
    }

    // 调度 prune：串行链接（chain），避免并发 prune 的重复 IO
    // 每次调用链接到前一个 prune 之后，先等在途 append 完成再读目录
    function schedulePrune(): Promise<void> {
        const prev = prunePromise;
        const p = (prev ?? Promise.resolve())
            .then(() => Promise.all(inFlight))
            .then(tryReadLogFiles)
            .then(pruneOldFiles)
            .catch(() => {
                // 吞掉意外 rejection，防止 unhandled rejection
            })
            .finally(() => {
                // 只有最后一个链才清除，中间链不清除（已被新链覆盖）
                if (prunePromise === p) {
                    prunePromise = null;
                }
            });
        prunePromise = p;
        return p;
    }

    // 读取目录下排序后的日志文件名列表（含 .log 和 .log.gz）
    async function readLogFiles(): AsyncIOResult<string[]> {
        const dirResult = await readDir(rootDir);
        return dirResult.map(files => files
            .filter(n => n.endsWith('.log') || n.endsWith('.log.gz'))
            .sort(),
        );
    }

    // readLogFiles 的便利包装：错误时返回空数组（调用方按"无文件"处理）
    async function tryReadLogFiles(): Promise<string[]> {
        return (await readLogFiles()).unwrapOr([]);
    }

    // 清理超量旧文件：按文件名排序，保留最新的 maxCount 个
    // best-effort：失败不处理，下次切文件时会重试
    // logFiles 由调用方通过 tryReadLogFiles 预先读取（避免隐藏 IO）
    // logFiles 已排序（oldest first），先按 maxAge 过期删除，剩余若超 maxCount 再删最旧的
    async function pruneOldFiles(logFiles: string[]): Promise<void> {
        if (logFiles.length === 0) return;

        const { maxAge, maxCount } = split;

        // currentFile 可能还没落盘（newFile 刚创建），不在 logFiles 中
        // 但它即将写入磁盘，需要为其预留一个 maxCount 名额
        const currentFileName = currentFile.substring(rootDir.length + 1);
        const reserveActive = !logFiles.includes(currentFileName);
        const effectiveMaxCount = reserveActive ? maxCount - 1 : maxCount;

        // 无 maxAge 且未超 effectiveMaxCount，直接返回
        if (maxAge == null && logFiles.length <= effectiveMaxCount) return;

        const now = Date.now();
        const toDelete: string[] = [];
        let remaining: string[];

        // 1. 按时间过期删除（maxAge）
        if (maxAge != null) {
            remaining = [];
            for (const name of logFiles) {
                const ts = parseTimestamp(name);
                if (ts != null && now - ts > maxAge) {
                    toDelete.push(name);
                } else {
                    remaining.push(name);
                }
            }
        } else {
            remaining = logFiles;
        }

        // 2. 剩余文件若仍超 effectiveMaxCount，删最旧的（remaining 保持有序）
        if (remaining.length > effectiveMaxCount) {
            const excess = remaining.slice(0, remaining.length - effectiveMaxCount);
            toDelete.push(...excess);
        }

        if (toDelete.length === 0) return;

        await Promise.all(toDelete.map(name => remove(`${rootDir}/${name}`)));
    }

    // 将过滤后的日志条目加入缓冲，同步决策切分 + 累加 size
    function writeEntry(level: LogLevel, args: unknown[], timestamp: number = Date.now()): void {
        const entry: LogEntry = { timestamp, level, message: buildMessage(args) };
        const formatted = formatter(entry);
        const entryLen = split.useByteSize ? encodeUtf8(formatted).length : formatted.length;

        // 写入前决策：period 过期或超限 → 先 flush 旧 buffer 到旧文件，再切新文件
        if (isFileExpired() || currentFileSize + entryLen > split.maxSize) {
            flushCurrent();
            newFile();
        }

        buffer.push({ entry, formatted });
        currentFileSize += entryLen;

        if (buffer.length >= maxBufferSize) {
            flushCurrent();
        }
    }

    // 启动定时 flush，flushInterval 为 0 时仅靠 buffer 阈值触发
    // timer 存储到 flushTimer，onDestroy 时 clearInterval
    function startAutoFlush(): void {
        if (flushInterval > 0) {
            flushTimer = setInterval(flushCurrent, flushInterval);
        }
    }

    // 查找当前 period 内的文件续写（检查最新文件的 mtime），没有则创建新文件
    // 同时清理超量旧文件（复用已读取的 logFiles，避免二次 readDir）
    // 用 mtime 而非文件名时间戳：防篡改；同一 period 内创建时间和 mtime 必定同 period
    async function resumeOrCreate(): Promise<void> {
        const logFiles = await tryReadLogFiles();
        // 只考虑未压缩的 .log 文件用于续写（不能 append 到 .log.gz）
        const resumable = logFiles.filter(n => n.endsWith('.log'));

        if (resumable.length === 0) {
            newFile();
        } else {
            // 检查最新文件的 mtime 是否在当前 period 内
            const latestPath = `${rootDir}/${resumable[resumable.length - 1]}`;
            const statResult = await stat(latestPath);
            if (statResult.isOkAnd(x => inCurrentPeriod(x.lastModifiedTime))) {
                const s = statResult.unwrap();
                currentFile = latestPath;
                currentFileStartTime = s.lastModifiedTime;
                currentFileSize = s.size;
            } else {
                newFile();
            }
        }

        // 清理超量文件（复用 logFiles 含 .log.gz，避免二次 readDir）
        await pruneOldFiles(logFiles);
    }

    // ── 启动初始化（创建即就绪，不依赖 onInit）──
    // 查找或创建活跃文件（同时清理超量旧文件）→ 启动定时器 → 回放 pending
    // 目录由首次 appendFile 自动创建（writeFile 内部会 mkdir parent）
    // .finally：无论 resumeOrCreate 成功失败都继续初始化（启动定时器、回放 pending）
    // .catch：吞掉意外 rejection，防止 unhandled rejection
    initPromise = resumeOrCreate()
        .finally(() => {
            startAutoFlush();
            hideListenerRemover = addHideListener(flushCurrent);
            // 回放 init 期间暂存的日志
            for (const [lvl, args, ts] of pending) {
                writeEntry(lvl, args, ts);
            }
            pending.length = 0;
            initPromise = null;
        })
        .catch(() => {
            // 吞掉意外 rejection，防止 unhandled rejection
        });

    // ── API ──

    return {
        name: 'fileLog',

        onInit(ctx: PluginContext): void {
            // 用全局配置 refinement 自身配置：自身 > 全局 > 默认
            // 创建时已用 config 初始化，这里仅补全 config 未指定时从全局继承
            level = config.level ?? ctx.globalLevel;
            filter = config.filter !== undefined ? config.filter : ctx.filter;
        },

        onLog(lvl: LogLevel, ...args: unknown[]): void {
            // 级别过滤 → 自定义过滤
            if (!shouldLog(lvl, level)) return;
            if (filter && !filter(lvl, ...args)) return;

            // init 尚未完成，暂存（带原始 timestamp）后回放
            if (initPromise != null) {
                pending.push([lvl, args, Date.now()]);
                return;
            }

            writeEntry(lvl, args);
        },

        onDestroy(): void {
            // 清理定时器和事件监听，防止 re-init 后资源泄漏
            if (flushTimer != null) {
                clearInterval(flushTimer);
                flushTimer = null;
            }
            hideListenerRemover?.();
            hideListenerRemover = null;
        },

        async flush(): Promise<void> {
            // 等 init 完成，确保 pending 已回放到 buffer
            if (initPromise != null) {
                await initPromise;
            }

            // 触发当前 buffer flush
            flushCurrent();
            // 等待在途 append 完成 + 触发 prune 并等待
            // schedulePrune 内部 Promise.all(inFlight) 等所有 append，
            // 链式确保串行 prune，flush 返回时文件数已不超过 maxCount
            await schedulePrune();
        },

        async getFiles(query?: LogFileQuery): AsyncIOResult<string[]> {
            return (await readLogFiles()).map(logFiles => {
                const from = query?.from;
                const to = query?.to;
                const needFilter = from != null || to != null;

                const files: string[] = [];
                for (const name of logFiles) {
                    // 仅在有时间范围过滤时才解析时间戳，避免无谓的正则匹配
                    if (needFilter) {
                        const fileTimestamp = parseTimestamp(name);
                        if (fileTimestamp != null) {
                            if (from != null && fileTimestamp < from) continue;
                            if (to != null && fileTimestamp > to) continue;
                        }
                    }

                    files.push(`${rootDir}/${name}`);
                }

                // readLogFiles 已排序，prepend 统一前缀不改变顺序
                return files;
            });
        },

        getRootDir(): string {
            return rootDir;
        },
    };
}

// #region Internal Types

/**
 * 缓冲区条目：预格式化的 LogEntry。
 *
 * flush 时直接 join，避免重复格式化。
 */
interface BufferedEntry {
    entry: LogEntry;
    formatted: string;
}

// #endregion

// #region Internal Functions

/**
 * 默认日志格式化器。
 *
 * 输出格式：`[2026-06-18 14:30:00.123] [INFO ] 消息内容\n`
 */
function defaultFormatter(entry: LogEntry): string {
    const time = formatTimestamp(entry.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
    return `[${time}] [${LEVEL_LABELS[entry.level]}] ${entry.message}\n`;
}

/**
 * 格式化时间戳为指定模式。
 */
function formatTimestamp(timestamp: number, pattern: string): string {
    const date = new Date(timestamp);

    const tokens: Record<string, string> = {
        'yyyy': date.getFullYear().toString(),
        'MM': pad2(date.getMonth() + 1),
        'dd': pad2(date.getDate()),
        'HH': pad2(date.getHours()),
        'mm': pad2(date.getMinutes()),
        'ss': pad2(date.getSeconds()),
        'SSS': pad3(date.getMilliseconds()),
    };

    return pattern.replace(/yyyy|MM|dd|HH|mm|ss|SSS/g, matched => tokens[matched]);
}

/**
 * 用当前时间戳生成独一无二的日志文件名（本地时间）。
 *
 * 全部使用 `-` 分隔，避免 ISO 8601 的 `T` 误导（文件名是本地时间，无时区后缀）。
 * 排序友好：`localeCompare` 按年-月-日-时-分-秒.毫秒逐位递减排序。
 *
 * 跨时区场景下应以 `LogEntry.timestamp`（epoch 毫秒）为准。
 */
function toLogName(): string {
    return `${formatTimestamp(Date.now(), 'yyyy-MM-dd-HH-mm-ss.SSS')}.log`;
}

/**
 * 从日志文件名解析时间戳（按本地时间）。
 *
 * 文件名由 {@link toLogName} 生成：`yyyy-MM-dd-HH-mm-ss.SSS.log`。
 * 用 `new Date(y, mo-1, d, h, mi, s, ms)` 显式按本地时间构造，避免
 * `new Date(string)` 在不同运行时对无时区字符串的解析差异。
 */
function parseTimestamp(name: string): number | null {
    const match = name.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.(\d{3})\.log(?:\.gz)?$/);
    if (!match) return null;

    const [, y, mo, d, h, mi, s, ms] = match.map(Number);
    return new Date(y, mo - 1, d, h, mi, s, ms).getTime();
}

function pad2(n: number): string {
    return pad(n, 2);
}

function pad3(n: number): string {
    return pad(n, 3);
}

function pad(n: number, maxLength: number): string {
    return n.toString().padStart(maxLength, '0');
}

/**
 * 压缩旧日志文件：等待 in-flight append 完成 → 读 → gzipSync → 写 .log.gz → 删 .log
 */
async function compressOldFile(filePath: string, pending: Set<Promise<void>>): Promise<void> {
    await Promise.all(pending);

    const readResult = await readFile(filePath);
    if (readResult.isErr()) return;

    const compressed = gzipSync(readResult.unwrap());

    const gzPath = `${filePath}.gz`;
    const writeResult = await writeFile(gzPath, compressed);
    if (writeResult.isErr()) return;

    // 压缩成功后才删原始文件，保证不丢数据
    await remove(filePath);
}

// #endregion
