/**
 * @internal
 * 小游戏平台的地理位置服务实现。
 */

import { type AsyncResult } from 'happy-rusty';
import { asyncResultify } from '../utils/mod.ts';

export async function getCurrentPosition(): AsyncResult<WechatMinigame.GetFuzzyLocationSuccessCallbackResult, WechatMinigame.GeneralCallbackResult> {
    const hasFuzzy = typeof wx.getFuzzyLocation === 'function';

    const getLocation = hasFuzzy ? wx.getFuzzyLocation : wx.getLocation;
    const scope = hasFuzzy ? 'scope.userFuzzyLocation' : 'scope.userLocation';

    const res = await asyncResultify(wx.authorize)({
        scope,
    });

    if (res.isErr()) {
        return res.asErr();
    }

    return asyncResultify(getLocation)({
        type: 'wgs84',
    });
}