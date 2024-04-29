import { None, Some, type Option } from '@happy-js/happy-rusty';
import { assertString } from '../assert/assertions.ts';

export function setItem(key: string, data: string): Promise<void> {
    assertString(key);
    assertString(data);

    localStorage.setItem(key, data);
    // 为了跟小游戏的异步API一致
    return Promise.resolve();
}

export function getItem(key: string): Promise<Option<string>> {
    assertString(key);

    const data = localStorage.getItem(key);
    return Promise.resolve(data == null ? None : Some(data));
}

export function removeItem(key: string): Promise<void> {
    assertString(key);

    localStorage.removeItem(key);
    return Promise.resolve();
}

export function clear(): Promise<void> {
    localStorage.clear();
    return Promise.resolve();
}