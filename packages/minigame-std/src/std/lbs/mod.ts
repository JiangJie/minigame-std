import { type AsyncIOResult } from 'happy-rusty';
import { isMinaEnv } from '../../macros/env.ts';
import type { GeoPosition } from './lbs_defines.ts';
import { getCurrentPosition as minaGetCurrentPosition } from './mina_lbs.ts';
import { getCurrentPosition as webGetCurrentPosition } from './web_lbs.ts';

export * from './lbs_defines.ts';

/**
 * 获取当前 geo 坐标。
 * @returns 当前经纬度。
 * @since 1.7.0
 * @example
 * ```ts
 * const result = await getCurrentPosition();
 * if (result.isOk()) {
 *     const pos = result.unwrap();
 *     console.log('纬度:', pos.latitude);
 *     console.log('经度:', pos.longitude);
 * } else {
 *     console.error('获取位置失败:', result.unwrapErr());
 * }
 * ```
 */
export function getCurrentPosition(): AsyncIOResult<GeoPosition> {
    return isMinaEnv()
        ? minaGetCurrentPosition()
        : webGetCurrentPosition();
}