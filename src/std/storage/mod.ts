import type { Option } from '@happy-js/happy-rusty';
import { isMinaEnv } from '../../macros/env.ts' with { type: 'macros' };
import { clear as minaClear, getItem as minaGetItem, removeItem as minaRemoveItem, setItem as minaSetItem } from './mina_storage.ts';
import { clear as webClear, getItem as webGetItem, removeItem as webRemoveItem, setItem as webSetItem } from './web_storage.ts';

export function setItem(key: string, data: string): Promise<void> {
    return isMinaEnv() ? minaSetItem(key, data) : webSetItem(key, data);
}

export function getItem(key: string): Promise<Option<string>> {
    return isMinaEnv() ? minaGetItem(key) : webGetItem(key);
}

export function removeItem(key: string): Promise<void> {
    return isMinaEnv() ? minaRemoveItem(key) : webRemoveItem(key);
}

export function clear(): Promise<void> {
    return isMinaEnv() ? minaClear() : webClear();
}