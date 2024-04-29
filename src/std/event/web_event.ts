export function addErrorListener(listener: (ev: ErrorEvent) => void): void {
    addEventListener('error', listener);
}

export function removeErrorListener(listener: (ev: ErrorEvent) => void): void {
    removeEventListener('error', listener);
}

export function addUnhandledrejectionListener(listener: (ev: PromiseRejectionEvent) => void): void {
    addEventListener('unhandledrejection', listener);
}

export function removeUnhandledrejectionListener(listener: (ev: PromiseRejectionEvent) => void): void {
    removeEventListener('unhandledrejection', listener);
}