import { assert } from '@std/assert';
import { asyncIOResultify, asyncResultify, syncIOResultify } from 'minigame-std';

export async function testResultify(): Promise<void> {
    // 测试 asyncResultify - 成功场景
    console.log('测试 asyncResultify 成功场景...');
    const mockSuccessApi = (params: { success?: (res: { data: string; }) => void; fail?: (err: { code: number; }) => void; }) => {
        setTimeout(() => {
            params.success?.({ data: 'success data' });
        }, 10);
    };

    const promisifiedSuccess = asyncResultify(mockSuccessApi);
    const successResult = await promisifiedSuccess({});
    assert(successResult.isOk(), 'asyncResultify成功场景应该返回Ok');
    assert(successResult.unwrap().data === 'success data', '数据应该正确');
    console.log('✅ asyncResultify 成功场景测试通过');

    // 测试 asyncResultify - 失败场景
    console.log('测试 asyncResultify 失败场景...');
    const mockFailApi = (params: { success?: (res: { data: string; }) => void; fail?: (err: { code: number; }) => void; }) => {
        setTimeout(() => {
            params.fail?.({ code: 500 });
        }, 10);
    };

    const promisifiedFail = asyncResultify(mockFailApi);
    const failResult = await promisifiedFail({});
    assert(failResult.isErr(), 'asyncResultify失败场景应该返回Err');
    assert(failResult.unwrapErr().code === 500, '错误码应该正确');
    console.log('✅ asyncResultify 失败场景测试通过');

    // 测试 asyncResultify - 保留原始成功回调
    console.log('测试 asyncResultify 保留原始回调...');
    let originalSuccessCalled = false;
    const resultWithCallback = await promisifiedSuccess({
        success: () => { originalSuccessCalled = true; },
    });
    assert(resultWithCallback.isOk(), '结果应该成功');
    assert(originalSuccessCalled, '原始success回调应该被调用');
    console.log('✅ asyncResultify 保留原始回调测试通过');

    // 测试 asyncIOResultify - 成功场景
    console.log('测试 asyncIOResultify 成功场景...');
    const mockIOSuccessApi = (params: { success?: (res: { data: string; }) => void; fail?: (err: WechatMinigame.GeneralCallbackResult) => void; }) => {
        setTimeout(() => {
            params.success?.({ data: 'io success data' });
        }, 10);
    };

    const ioPromisifiedSuccess = asyncIOResultify(mockIOSuccessApi);
    const ioSuccessResult = await ioPromisifiedSuccess({});
    assert(ioSuccessResult.isOk(), 'asyncIOResultify成功场景应该返回Ok');
    assert(ioSuccessResult.unwrap().data === 'io success data', '数据应该正确');
    console.log('✅ asyncIOResultify 成功场景测试通过');

    // 测试 asyncIOResultify - 失败场景（转换为Error）
    console.log('测试 asyncIOResultify 失败场景（错误转换）...');
    const mockIOFailApi = (params: { success?: (res: { data: string; }) => void; fail?: (err: WechatMinigame.GeneralCallbackResult) => void; }) => {
        setTimeout(() => {
            params.fail?.({ errMsg: 'test error message' });
        }, 10);
    };

    const ioPromisifiedFail = asyncIOResultify(mockIOFailApi);
    const ioFailResult = await ioPromisifiedFail({});
    assert(ioFailResult.isErr(), 'asyncIOResultify失败场景应该返回Err');
    const ioError = ioFailResult.unwrapErr();
    assert(ioError instanceof Error, '错误应该是Error类型');
    assert(ioError.message === 'test error message', '错误信息应该正确');
    console.log('✅ asyncIOResultify 失败场景测试通过');

    // 测试 syncIOResultify - 成功场景
    console.log('测试 syncIOResultify 成功场景...');
    const mockSyncApi = (key: string) => {
        return `value for ${key}`;
    };

    const wrappedSync = syncIOResultify(mockSyncApi);
    const syncResult = wrappedSync('testKey');
    assert(syncResult.isOk(), 'syncIOResultify成功场景应该返回Ok');
    assert(syncResult.unwrap() === 'value for testKey', '返回值应该正确');
    console.log('✅ syncIOResultify 成功场景测试通过');

    // 测试 syncIOResultify - 失败场景
    console.log('测试 syncIOResultify 失败场景...');
    const mockSyncFailApi = (_key: string): string => {
        throw { errMsg: 'sync error message' } as WechatMinigame.GeneralCallbackResult;
    };

    const wrappedSyncFail = syncIOResultify(mockSyncFailApi);
    const syncFailResult = wrappedSyncFail('testKey');
    assert(syncFailResult.isErr(), 'syncIOResultify失败场景应该返回Err');
    const syncError = syncFailResult.unwrapErr();
    assert(syncError instanceof Error, '错误应该是Error类型');
    assert(syncError.message === 'sync error message', '错误信息应该正确');
    console.log('✅ syncIOResultify 失败场景测试通过');

    // 测试 syncIOResultify - Error异常
    console.log('测试 syncIOResultify Error异常...');
    const mockSyncErrorApi = (_key: string): string => {
        throw new Error('native error');
    };

    const wrappedSyncError = syncIOResultify(mockSyncErrorApi);
    const syncErrorResult = wrappedSyncError('testKey');
    assert(syncErrorResult.isErr(), 'syncIOResultify异常应该返回Err');
    const nativeError = syncErrorResult.unwrapErr();
    assert(nativeError instanceof Error, '错误应该是Error类型');
    assert(nativeError.message === 'native error', '错误信息应该正确');
    console.log('✅ syncIOResultify Error异常测试通过');

    console.log('🎉 Resultify测试完成');
}
