import { assert } from '@std/assert';
import { getPerformanceNow } from 'minigame-std';

export async function testPerformance(): Promise<void> {
    // 测试返回时间戳
    console.log('测试getPerformanceNow返回时间戳...');
    const now = getPerformanceNow();
    assert(typeof now === 'number', 'getPerformanceNow应该返回number类型');
    assert(now > 0, 'getPerformanceNow应该返回正数');
    console.log('✅ 当前时间戳:', now);

    // 测试时间递增
    console.log('测试时间递增...');
    const time1 = getPerformanceNow();
    await new Promise(resolve => setTimeout(resolve, 10));
    const time2 = getPerformanceNow();
    assert(time2 > time1, 'time2应该大于time1');
    console.log('✅ 时间递增正确 - time1:', time1, 'time2:', time2, '差值:', time2 - time1);

    // 测试精度
    console.log('测试精度...');
    const measurements: number[] = [];
    for (let i = 0; i < 5; i++) {
        measurements.push(getPerformanceNow());
        await new Promise(resolve => setTimeout(resolve, 1));
    }

    for (let i = 1; i < measurements.length; i++) {
        assert(measurements[i] > measurements[i - 1], `measurements[${i}]应该大于measurements[${i - 1}]`);
    }
    console.log('✅ 精度测试通过，测量值:', measurements);

    // 测试耗时计算
    console.log('测试耗时计算...');
    const start = getPerformanceNow();
    await new Promise(resolve => setTimeout(resolve, 50));
    const end = getPerformanceNow();
    const elapsed = end - start;

    assert(elapsed >= 45, '耗时应该至少45ms');
    assert(elapsed < 150, '耗时应该小于150ms');
    console.log('✅ 耗时计算正确 - 预期~50ms，实际:', elapsed.toFixed(2), 'ms');

    console.log('🎉 Performance测试完成');
}
