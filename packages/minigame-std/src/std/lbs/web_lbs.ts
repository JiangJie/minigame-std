/**
 * @internal
 * Web 平台的地理位置服务实现。
 */

import { Err, Ok, type AsyncIOResult, type IOResult } from 'happy-rusty';
import { Future } from 'tiny-future';
import type { GeoPosition } from './lbs_defines';

/**
 * 获取当前 geo 坐标。
 * @returns 异步的经纬度结果。
 */
export function getCurrentPosition(): AsyncIOResult<GeoPosition> {
    const future = new Future<IOResult<GeoPosition>>();

    navigator.geolocation.getCurrentPosition(
        position => {
            future.resolve(Ok({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }));
        },
        err => {
            future.resolve(Err(new Error(err.message)));
        },
    );

    return future.promise;
}