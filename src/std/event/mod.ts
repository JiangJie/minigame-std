import { isMinaEnv } from '../../macros/env.ts';
import { addErrorListener as minaAddErrorListener, addUnhandledrejectionListener as minaAddUnhandledrejectionListener } from './mina_event.ts';
import { addErrorListener as webAddErrorListener, addUnhandledrejectionListener as webAddUnhandledrejectionListener } from './web_event.ts';

/**
 * 添加错误监听器，用于监听标准的错误事件。
 * @param listener - 错误事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addErrorListener(listener: (ev: WechatMinigame.Error) => void): () => void {
    if (isMinaEnv()) {
        return minaAddErrorListener(listener);
    }

    const webListener = (ev: ErrorEvent) => {
        listener({
            message: ev.message,
            stack: ev.error.stack,
        });
    };

    return webAddErrorListener(webListener);
}

/**
 * 添加未处理的 Promise 拒绝事件监听器。
 * @param listener - 未处理的 Promise 拒绝事件的回调函数。
 * @returns  返回一个函数，调用该函数可以移除监听器。
 */
export function addUnhandledrejectionListener(listener: (ev: Pick<PromiseRejectionEvent, 'reason' | 'promise'>) => void): () => void {
    return isMinaEnv()
        ? minaAddUnhandledrejectionListener(listener as unknown as WechatMinigame.OnUnhandledRejectionCallback)
        : webAddUnhandledrejectionListener(listener);
}