/**
 * @internal
 * Web 平台的地理位置服务实现。
 */

import { Err, Ok, type AsyncResult, type Result } from 'happy-rusty';
import { Future } from 'tiny-future';

export function getCurrentPosition(): AsyncResult<GeolocationPosition, GeolocationPositionError> {
    const future = new Future<Result<GeolocationPosition, GeolocationPositionError>>();

    navigator.geolocation.getCurrentPosition(
        position => {
            future.resolve(Ok(position));
        },
        err => {
            future.resolve(Err(err));
        },
    );

    return future.promise;
}