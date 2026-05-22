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
} from './mina_event.ts';
import {
    addErrorListener as webAddErrorListener,
    addHideListener as webAddHideListener,
    addResizeListener as webAddResizeListener,
    addShowListener as webAddShowListener,
    addUnhandledrejectionListener as webAddUnhandledrejectionListener,
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
 * @returns 返回一个函数，调用该函数可以移除监听器。
 * @since 2.2.0
 * @example
 * ```ts
 * const removeListener = addShowListener((options) => {
 *     console.log('游戏回到前台:', options?.scene);
 * });
 *
 * // 移除监听器
 * removeListener();
 * ```
 */
export function addShowListener(listener: (ev?: WechatMinigame.OnShowListenerResult) => void): () => void {
    return IS_MINA
        ? minaAddShowListener(listener)
        : webAddShowListener(listener);
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
