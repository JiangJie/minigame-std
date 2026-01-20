/**
 * @internal
 * 小游戏平台的地理位置服务实现。
 */

import { type AsyncIOResult } from 'happy-rusty';
import { asyncIOResultify } from '../utils/mod.ts';
import type { GeoPosition } from './lbs_defines.ts';

export async function getCurrentPosition(): AsyncIOResult<GeoPosition> {
    const hasFuzzy = typeof wx.getFuzzyLocation === 'function';

    const getLocation = hasFuzzy ? wx.getFuzzyLocation : wx.getLocation;
    const scope = hasFuzzy ? 'scope.userFuzzyLocation' : 'scope.userLocation';

    const authRes = await asyncIOResultify(wx.authorize)({
        scope,
    });

    if (authRes.isErr()) {
        return authRes.asErr();
    }

    const locationRes = await asyncIOResultify(getLocation)({
        type: 'wgs84',
    });

    return locationRes.map(pos => ({
        latitude: pos.latitude,
        longitude: pos.longitude,
    }));
}