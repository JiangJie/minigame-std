/**
 * @internal
 * Web platform implementation for storage operations.
 */

import { Err, Ok, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';
import { tryDOMSyncOp } from '../utils/mod.ts';

function callOp<T>(op: () => T): IOResult<T> {
    const res = op();
    return Ok(res);
}

export function setItem(key: string, data: string): VoidIOResult {
    assertString(key);
    assertString(data);

    return tryDOMSyncOp(() => {
        localStorage.setItem(key, data);
    });
}

export function getItem(key: string): IOResult<string> {
    assertString(key);

    const data = localStorage.getItem(key);
    return data == null ? Err(new Error(`${ key } not exists`)) : Ok(data);
}

export function removeItem(key: string): VoidIOResult {
    assertString(key);

    return callOp(() => {
        localStorage.removeItem(key);
    });
}

export function clear(): VoidIOResult {
    return callOp(() => {
        localStorage.clear();
    });
}

export function getLength(): IOResult<number> {
    return callOp(() => {
        return localStorage.length;
    });
}

export function hasItem(key: string): IOResult<boolean> {
    assertString(key);

    return callOp(() => {
        return localStorage.getItem(key) != null;
    });
}