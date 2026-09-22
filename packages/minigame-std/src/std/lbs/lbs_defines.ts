/**
 * geo 坐标。
 * @since 1.7.0
 * @example
 * ```ts
 * import { lbs } from 'minigame-std';
 *
 * const result = await lbs.getCurrentPosition();
 * if (result.isOk()) {
 *     const pos: lbs.GeoPosition = result.unwrap();
 *     console.log('纬度:', pos.latitude, '经度:', pos.longitude);
 * }
 * ```
 */
export interface GeoPosition {
    /**
     * 纬度。
     */
    latitude: number;

    /**
     * 经度。
     */
    longitude: number;
}
