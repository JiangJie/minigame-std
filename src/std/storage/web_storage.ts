import { None, Some, type Option } from 'happy-rusty';
import { assertString } from '../assert/assertions.ts';

export function setItem(key: string, data: string): void {
    assertString(key);
    assertString(data);

    localStorage.setItem(key, data);
}

export function getItem(key: string): Option<string> {
    assertString(key);

    const data = localStorage.getItem(key);
    return data == null ? None : Some(data);
}

export function removeItem(key: string): void {
    assertString(key);

    localStorage.removeItem(key);
}

export function clear(): void {
    localStorage.clear();
}