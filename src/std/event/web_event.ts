/**
 * 添加错误监听器，用于监听标准的错误事件。
 * @param listener - 错误事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addErrorListener(listener: (ev: ErrorEvent) => void): () => void {
    addEventListener('error', listener);

    return (): void => {
        removeEventListener('error', listener);
    };
}

/**
 * 添加未处理的 Promise 拒绝事件监听器。
 * @param listener - 未处理的 Promise 拒绝事件的回调函数。
 * @returns 返回一个函数，调用该函数可以移除监听器。
 */
export function addUnhandledrejectionListener(listener: (ev: PromiseRejectionEvent) => void): () => void {
    addEventListener('unhandledrejection', listener);

    return (): void => {
        removeEventListener('unhandledrejection', listener);
    };
}

export function addResizeListener(listener: (ev: UIEvent) => void): () => void {
    addEventListener('resize', listener);

    return (): void => {
        removeEventListener('resize', listener);
    };
}