import { Err, Ok, RESULT_VOID, type IOResult, type VoidIOResult } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';

export function setItem(key: string, data: string): VoidIOResult {
    assertString(key);
    assertString(data);

    try {
        localStorage.setItem(key, data);
        return RESULT_VOID;
    } catch (e) {
        return Err(e as DOMException);
    }
}

export function getItem(key: string): IOResult<string> {
    assertString(key);

    const data = localStorage.getItem(key);
    return data == null ? Err(new Error(`${ key } not exists`)) : Ok(data);
}

export function removeItem(key: string): VoidIOResult {
    assertString(key);

    localStorage.removeItem(key);
    return RESULT_VOID;
}

export function clear(): VoidIOResult {
    localStorage.clear();
    return RESULT_VOID;
}

export function getLength(): IOResult<number> {
    return Ok(localStorage.length);
}