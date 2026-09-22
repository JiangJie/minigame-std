import { assert } from '@std/assert';
import { platform } from 'minigame-std';

export async function testDevice(): Promise<void> {
    // 测试获取设备信息
    console.log('测试获取设备信息...');
    const deviceInfo = platform.getDeviceInfo();

    assert(deviceInfo !== null && deviceInfo !== undefined, 'deviceInfo不应该为空');
    assert(typeof deviceInfo.platform === 'string', 'platform应该是字符串');
    assert(typeof deviceInfo.model === 'string', 'model应该是字符串');
    assert(typeof deviceInfo.system === 'string', 'system应该是字符串');
    assert(typeof deviceInfo.brand === 'string', 'brand应该是字符串');
    assert(typeof deviceInfo.memorySize === 'number', 'memorySize应该是数字');

    console.log('✅ 设备信息:');
    console.log('  - 平台:', deviceInfo.platform);
    console.log('  - 品牌:', deviceInfo.brand);
    console.log('  - 型号:', deviceInfo.model);
    console.log('  - 系统:', deviceInfo.system);
    console.log('  - 内存:', deviceInfo.memorySize, 'MB');

    // 测试平台类型
    console.log('测试平台类型...');
    const validPlatforms = [
        'ios',
        'android',
        'mac',
        'windows',
        'ohos',
        'ohos_pc',
        'devtools',
        'linux',
        'unknown',
    ];
    assert(
        validPlatforms.includes(deviceInfo.platform),
        `platform应该是有效的平台类型，当前值: ${deviceInfo.platform}`,
    );
    console.log('✅ 平台类型有效');

    // 测试获取设备性能等级
    console.log('测试获取设备性能等级...');
    const benchmarkResult = await platform.getDeviceBenchmarkLevel();
    assert(benchmarkResult.isOk(), '获取设备性能等级应该成功');

    const level = benchmarkResult.unwrap();
    assert(typeof level === 'number', '性能等级应该是数字');
    // 小游戏环境下 level >= -1，web环境下 level === -2
    console.log('✅ 设备性能等级:', level);

    // 测试窗口信息
    console.log('测试获取窗口信息...');
    const windowInfo = platform.getWindowInfo();

    assert(windowInfo !== null && windowInfo !== undefined, 'windowInfo不应该为空');
    assert(typeof windowInfo.screenWidth === 'number', 'screenWidth应该是数字');
    assert(typeof windowInfo.screenHeight === 'number', 'screenHeight应该是数字');
    assert(typeof windowInfo.windowWidth === 'number', 'windowWidth应该是数字');
    assert(typeof windowInfo.windowHeight === 'number', 'windowHeight应该是数字');
    assert(typeof windowInfo.pixelRatio === 'number', 'pixelRatio应该是数字');

    assert(windowInfo.screenWidth > 0, 'screenWidth应该大于0');
    assert(windowInfo.screenHeight > 0, 'screenHeight应该大于0');
    assert(windowInfo.windowWidth > 0, 'windowWidth应该大于0');
    assert(windowInfo.windowHeight > 0, 'windowHeight应该大于0');
    assert(windowInfo.pixelRatio > 0, 'pixelRatio应该大于0');

    console.log('✅ 窗口信息:');
    console.log('  - 屏幕尺寸:', windowInfo.screenWidth, 'x', windowInfo.screenHeight);
    console.log('  - 窗口尺寸:', windowInfo.windowWidth, 'x', windowInfo.windowHeight);
    console.log('  - 像素比:', windowInfo.pixelRatio);
    console.log('  - 状态栏高度:', windowInfo.statusBarHeight);

    // 测试安全区域
    if (windowInfo.safeArea) {
        console.log('✅ 安全区域:');
        console.log('  - left:', windowInfo.safeArea.left);
        console.log('  - right:', windowInfo.safeArea.right);
        console.log('  - top:', windowInfo.safeArea.top);
        console.log('  - bottom:', windowInfo.safeArea.bottom);
        console.log('  - width:', windowInfo.safeArea.width);
        console.log('  - height:', windowInfo.safeArea.height);
    }

    console.log('🎉 Device测试完成');
}
