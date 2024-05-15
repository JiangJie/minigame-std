import { isMinaEnv } from '../../macros/env.ts';
import { addErrorListener as minaAddErrorListener, addUnhandledrejectionListener as minaAddUnhandledrejectionListener, removeErrorListener as minaRemoveErrorListener, removeUnhandledrejectionListener as minaRemoveUnhandledrejectionListener } from './mina_event.ts';
import { addErrorListener as webAddErrorListener, addUnhandledrejectionListener as webAddUnhandledrejectionListener, removeErrorListener as webRemoveErrorListener, removeUnhandledrejectionListener as webRemoveUnhandledrejectionListener } from './web_event.ts';

export function addErrorListener(listener: (ev: WechatMinigame.Error) => void): () => void {
    if (isMinaEnv()) {
        minaAddErrorListener(listener);

        return () => {
            minaRemoveErrorListener(listener);
        };
    }

    const webListener = (ev: ErrorEvent) => {
        listener({
            message: ev.message,
            stack: ev.error.stack,
        });
    };

    webAddErrorListener(webListener);

    return () => {
        webRemoveErrorListener(webListener);
    };
}

export function addUnhandledrejectionListener(listener: (ev: Pick<PromiseRejectionEvent, 'reason' | 'promise'>) => void): () => void {
    if (isMinaEnv()) {
        minaAddUnhandledrejectionListener(listener as unknown as WechatMinigame.OnUnhandledRejectionCallback);

        return () => {
            minaRemoveUnhandledrejectionListener(listener as unknown as WechatMinigame.OnUnhandledRejectionCallback);
        };
    }

    webAddUnhandledrejectionListener(listener);

    return () => {
        webRemoveUnhandledrejectionListener(listener);
    };
}