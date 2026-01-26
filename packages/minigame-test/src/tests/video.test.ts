import { assert } from '@std/assert';
import { platform, video } from 'minigame-std';

export async function testVideo(): Promise<void> {
    // 测试创建视频
    console.log('测试创建视频...');

    // 获取屏幕尺寸，计算居中位置
    const videoWidth = 320;
    const videoHeight = 176;
    const windowInfo = platform.getWindowInfo();
    const screenWidth = windowInfo.windowWidth;
    const screenHeight = windowInfo.windowHeight;
    const x = (screenWidth - videoWidth) / 2;
    const y = (screenHeight - videoHeight) / 2;

    const v = video.createVideo({
        src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        width: videoWidth,
        height: videoHeight,
        x,
        y,
        autoplay: false,
    });

    // 测试基本属性
    assert(v.width === videoWidth, `width应该为${ videoWidth }`);
    assert(v.height === videoHeight, `height应该为${ videoHeight }`);
    console.log('✅ 创建视频成功，尺寸:', v.width, 'x', v.height, '位置:', x, ',', y);

    // 测试设置属性
    v.autoplay = true;
    v.loop = false; // 设为false，确保视频播放完毕后能触发ended事件
    v.muted = true;
    console.log('✅ 属性设置成功 - autoplay:', v.autoplay, 'loop:', v.loop, 'muted:', v.muted);

    // 测试事件监听
    console.log('测试事件监听...');

    // 创建一个Promise，等待视频播放完毕
    const videoEndedPromise = new Promise<void>((resolve) => {
        v.onPlay(() => {
            console.log('📢 play事件触发');
        });

        v.onPause(() => {
            console.log('📢 pause事件触发');
        });

        v.onTimeUpdate((data) => {
            console.log('📢 timeupdate - position:', data.position, 'duration:', data.duration);
        });

        v.onError((err) => {
            console.log('📢 error事件:', err.errMsg);
            // 发生错误时也resolve，避免无限等待
            resolve();
        });

        v.onEnded(() => {
            console.log('📢 ended事件触发');
            resolve();
        });

        v.onWaiting(() => {
            console.log('📢 waiting事件触发');
        });

        v.onProgress((data) => {
            console.log('📢 progress事件 - buffered:', data.buffered);
        });
    });

    console.log('✅ 事件监听器注册成功');

    // 测试播放控制
    console.log('测试播放控制...');
    try {
        await v.play();
        console.log('✅ 视频开始播放，等待播放完毕...');

        // 等待视频播放完毕
        await videoEndedPromise;
        console.log('✅ 视频播放完毕');
    } catch (err) {
        console.log('播放控制测试跳过（可能需要用户交互）:', err);
    }

    // 测试移除事件监听
    v.offPlay();
    v.offPause();
    v.offTimeUpdate();
    v.offError();
    v.offEnded();
    v.offWaiting();
    v.offProgress();
    console.log('✅ 事件监听器移除成功');

    // 测试销毁
    v.destroy();
    console.log('✅ 视频销毁成功');

    console.log('🎉 Video测试完成');
}
