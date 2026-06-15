/**
 * 事件监听模块，提供错误、未处理 Promise 拒绝、窗口大小变化等事件监听功能。
 * @module event
 */
import { IS_MINA } from '../../macros/env.ts';
import {
    addErrorListener as minaAddErrorListener,
    addHideListener as minaAddHideListener,
    addResizeListener as minaAddResizeListener,
    addShowListener as minaAddShowListener,
    addUnhandledrejectionListener as minaAddUnhandledrejectionListener,
    getEnterOptionsSync as minaGetEnterOptionsSync,
    getLaunchOptionsSync as minaGetLaunchOptionsSync,
} from './mina_event.ts';
import {
    addErrorListener as webAddErrorListener,
    addHideListener as webAddHideListener,
    addResizeListener as webAddResizeListener,
    addShowListener as webAddShowListener,
    addUnhandledrejectionListener as webAddUnhandledrejectionListener,
    getEnterOptionsSync as webGetEnterOptionsSync,
    getLaunchOptionsSync as webGetLaunchOptionsSync,
} from './web_event.ts';

/**
 * 添加错误监听器，用于监听标准的错误事件。
 * @param listener - 错误事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 * @since 1.0.0
 * @example
 * ```ts
 * const removeListener = addErrorListener((ev) => {
 *     console.error('捕获到错误:', ev.message);
 * });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addErrorListener(listener: (ev: WechatMinigame.ListenerError) => void): () => void {
    if (IS_MINA) {
        return minaAddErrorListener(listener);
    }

    const webListener = (ev: ErrorEvent) => {
        listener({
            message: `${ ev.message }${ ev.error?.stack ? `\n${ ev.error.stack }` : '' }`,
        });
    };

    return webAddErrorListener(webListener);
}

/**
 * 添加未处理的 Promise 拒绝事件监听器。
 * @param listener - 未处理的 Promise 拒绝事件的回调函数。
 * @returns  返回一个函数，调用该函数可以移除监听器。
 * @since 1.0.0
 * @example
 * ```ts
 * const removeListener = addUnhandledrejectionListener((ev) => {
 *     console.error('未处理的 Promise 拒绝:', ev.reason);
 * });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addUnhandledrejectionListener(listener: (ev: Pick<PromiseRejectionEvent, 'reason' | 'promise'>) => void): () => void {
    return IS_MINA
        ? minaAddUnhandledrejectionListener(listener as unknown as WechatMinigame.OnUnhandledRejectionCallback)
        : webAddUnhandledrejectionListener(listener);
}

/**
 * 添加窗口大小变化监听器。
 * @param listener - 窗口大小变化的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 * @since 1.7.0
 * @example
 * ```ts
 * const removeListener = addResizeListener((size) => {
 *     console.log('窗口大小变化:', size.windowWidth, 'x', size.windowHeight);
 * });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addResizeListener(listener: WechatMinigame.OnWindowResizeCallback): () => void {
    return IS_MINA
        ? minaAddResizeListener(listener)
        : webAddResizeListener(ev => {
            listener({
                windowWidth: (ev.target as Window).innerWidth,
                windowHeight: (ev.target as Window).innerHeight,
            });
        });
}

/**
 * 添加游戏回到前台事件监听器。
 * @param listener - 游戏回到前台事件的回调函数。Web 平台无启动参数，回调参数为 `undefined`。
 * @param options - 可选配置。
 * @param options.fireImmediately - 是否在注册时立即以当前进入参数回调一次（默认 `false`）。
 *  设置为 `true` 可实现"订阅即重放"模式，
 *  覆盖首次启动和后续切前台场景。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 * @since 2.2.0
 * @example
 * ```ts
 * // 默认：纯事件通知
 * const removeListener = addShowListener((options) => {
 *     console.log('游戏回到前台:', options?.scene);
 * });
 *
 * // 订阅即重放：注册时立即回调 + 后续切前台回调
 * addShowListener((options) => {
 *     console.log('进入参数:', options?.scene);
 * }, { fireImmediately: true });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addShowListener(
    listener: (ev?: WechatMinigame.OnShowListenerResult) => void,
    options?: { fireImmediately?: boolean; },
): () => void {
    return IS_MINA
        ? minaAddShowListener(listener, options)
        : webAddShowListener(listener, options);
}

/**
 * 添加游戏切到后台事件监听器。
 * @param listener - 游戏切到后台事件的回调函数。Web 平台无事件参数，回调参数为 `undefined`。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 * @since 2.2.0
 * @example
 * ```ts
 * const removeListener = addHideListener(() => {
 *     console.log('游戏切到后台');
 * });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addHideListener(listener: () => void): () => void {
    return IS_MINA
        ? minaAddHideListener(listener)
        : webAddHideListener(listener);
}

/**
 * 获取小游戏冷启动时的参数。生命周期内返回值始终不变。
 *
 * - 小游戏：对应 `wx.getLaunchOptionsSync()`，包含 `hostExtraData` 等完整字段。
 * - Web：首次调用时解析并缓存页面 URL 参数，后续调用始终返回缓存值，
 *   `hostExtraData` 无实际值。
 *
 * @returns 返回冷启动参数。
 * @since 2.5.0
 * @example
 * ```ts
 * const launchOptions = getLaunchOptionsSync();
 * console.log('冷启动场景值:', launchOptions.scene);
 * console.log('冷启动 query:', launchOptions.query);
 * // 仅小游戏环境有实际值
 * console.log('宿主数据:', launchOptions.hostExtraData?.host_scene);
 * ```
 */
export function getLaunchOptionsSync(): WechatMinigame.LaunchOptionsGame {
    return IS_MINA
        ? minaGetLaunchOptionsSync()
        : webGetLaunchOptionsSync();
}

/**
 * 获取小游戏最近一次进入的参数。热启动（切前台）时返回值可能更新。
 *
 * - 小游戏：对应 `wx.getEnterOptionsSync()`，包含 `apiCategory` 等完整字段。
 * - Web：每次调用实时解析当前页面 URL 参数，`apiCategory` 无实际值。
 *
 * @returns 返回当前进入参数。
 * @since 2.5.0
 * @example
 * ```ts
 * const enterOptions = getEnterOptionsSync();
 * console.log('当前场景值:', enterOptions.scene);
 * console.log('当前 query:', enterOptions.query);
 * // 仅小游戏环境有实际值，Web 为 undefined
 * console.log('API 类别:', enterOptions.apiCategory);
 * ```
 */
export function getEnterOptionsSync(): WechatMinigame.EnterOptionsGame {
    return IS_MINA
        ? minaGetEnterOptionsSync()
        : webGetEnterOptionsSync();
}
