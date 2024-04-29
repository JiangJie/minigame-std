/* eslint-disable @typescript-eslint/no-explicit-any */
import { Err, Ok, type AsyncResult } from '@happy-js/happy-rusty';
import { assertString } from '../assert/assertions.ts';

export async function writeText(data: string): AsyncResult<boolean, DOMException> {
    assertString(data);

    try {
        await navigator.clipboard.writeText(data);
        return Ok(true);
    } catch (err) {
        return Err(err as DOMException);
    }
}

export async function readText(): AsyncResult<string, DOMException> {
    try {
        const data = await navigator.clipboard.readText();
        return Ok(data);
    } catch (err) {
        return Err(err as DOMException);
    }
}