import { assert } from '@std/assert';
import { platform, video } from 'minigame-std';

const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

async function waitForVideoFrame(source: video.VideoFrameSource, timeout = 5000): Promise<video.VideoFrameSourceFrame | null> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const frameRes = source.getFrame();
        assert(frameRes.isOk(), `getFrame 应该成功: ${ frameRes.isErr() ? frameRes.unwrapErr().message : '' }`);

        const frame = frameRes.unwrap();
        if (frame != null) return frame;

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
}

async function testVideoFrameSource(): Promise<void> {
    console.log('测试 VideoFrameSource...');

    if (!video.isVideoFrameSourceSupported()) {
        console.log('当前环境不支持 wx.createVideoDecoder，跳过 VideoFrameSource 测试');
        return;
    }

    const sourceRes = video.createVideoFrameSource({
        src: videoUrl,
    });

    assert(sourceRes.isOk(), `createVideoFrameSource 应该成功: ${ sourceRes.isErr() ? sourceRes.unwrapErr().message : '' }`);
    const source = sourceRes.unwrap();

    const playRes = await source.play();
    assert(playRes.isOk(), `VideoFrameSource.play 应该成功: ${ playRes.isErr() ? playRes.unwrapErr().message : '' }`);

    const frame = await waitForVideoFrame(source);
    assert(frame != null, 'VideoFrameSource 应该在超时时间内读取到视频帧');
    assert(frame.kind === 'pixels', '小游戏 VideoFrameSource 应该返回 pixels 帧');
    assert(frame.width > 0, '视频帧 width 应该大于 0');
    assert(frame.height > 0, '视频帧 height 应该大于 0');
    assert(frame.data.byteLength > 0, '视频帧 data 应该非空');
    frame.release();

    source.destroy();
    console.log('✅ VideoFrameSource 测试完成', frame.width, 'x', frame.height);
}

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

    await testVideoFrameSource();

    console.log('🎉 Video测试完成');
}
