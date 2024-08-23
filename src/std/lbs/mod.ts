import { type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import { miniGameFailureToError } from '../utils/mod.ts';
import type { GeoPosition } from './lbs_defines.ts';
import { getCurrentPosition as minaGetCurrentPosition } from './mina_lbs.ts';
import { getCurrentPosition as webGetCurrentPosition } from './web_lbs.ts';

export * from './lbs_defines.ts';

/**
 * 获取当前 geo 坐标。
 * @returns 当前经纬度。
 */
export async function getCurrentPosition(): AsyncIOResult<GeoPosition> {
    return isMinaEnv()
        ? (await minaGetCurrentPosition())
            .map(pos => ({ latitude: pos.latitude, longitude: pos.longitude }))
            .mapErr(miniGameFailureToError)
        : (await webGetCurrentPosition())
            .map(pos => ({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
            .mapErr(err => new Error(err.message));
}