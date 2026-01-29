/**
 * 事件监听模块，提供错误、未处理 Promise 拒绝、窗口大小变化等事件监听功能。
 * @module event
 */
import { isMinaEnv } from '../../macros/env.ts';
import {
    addErrorListener as minaAddErrorListener,
    addResizeListener as minaAddResizeListener,
    addUnhandledrejectionListener as minaAddUnhandledrejectionListener,
} from './mina_event.ts';
import {
    addErrorListener as webAddErrorListener,
    addResizeListener as webAddResizeListener,
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
    if (isMinaEnv()) {
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
    return isMinaEnv()
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
    return isMinaEnv()
        ? minaAddResizeListener(listener)
        : webAddResizeListener(ev => {
            listener({
                windowWidth: (ev.target as Window).innerWidth,
                windowHeight: (ev.target as Window).innerHeight,
            });
        });
}