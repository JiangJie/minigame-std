import { Err, Ok, type AsyncResult, type Result } from 'happy-rusty';
import { Future } from 'tiny-future';

export async function getCurrentPosition(): AsyncResult<WechatMinigame.GetFuzzyLocationSuccessCallbackResult, WechatMinigame.GeneralCallbackResult> {
    const future = new Future<Result<WechatMinigame.GetFuzzyLocationSuccessCallbackResult, WechatMinigame.GeneralCallbackResult>>();

    try {
        await wx.authorize({
            scope: 'scope.userFuzzyLocation',
        });

        wx.getFuzzyLocation({
            type: 'wgs84',
            success(res) {
                future.resolve(Ok(res));
            },
            fail(err) {
                future.resolve(Err(err));
            },
        });
    } catch (e) {
        future.resolve(Err(e as WechatMinigame.GeneralCallbackResult));
    }

    return future.promise;
}