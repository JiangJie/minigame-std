import { type AsyncResult } from 'happy-rusty';
import { promisifyWithResult } from '../utils/mod.ts';

export async function getCurrentPosition(): AsyncResult<WechatMinigame.GetFuzzyLocationSuccessCallbackResult, WechatMinigame.GeneralCallbackResult> {
    const hasFuzzy = typeof wx.getFuzzyLocation === 'function';

    const getLocation = hasFuzzy ? wx.getFuzzyLocation : wx.getLocation;
    const scope = hasFuzzy ? 'scope.userFuzzyLocation' : 'scope.userLocation';

    const res = await promisifyWithResult(wx.authorize)({
        scope,
    });

    if (res.isErr()) {
        return res.asErr();
    }

    return promisifyWithResult(getLocation)({
        type: 'wgs84',
    });
}