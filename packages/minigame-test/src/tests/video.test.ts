import { assert } from '@std/assert';
import { platform, video } from 'minigame-std';

import { getMainCanvas, getMainCtx } from '../test-runner.ts';

const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
const videoPlaybackTimeout = 15000;

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

    // DevTools 不支持 wx.createVideoDecoder，跳过测试
    if (!platform.isMiniGameDevtools()) {
        const sourceRes = video.createVideoFrameSource({
            source: 'videos/mov_bbb.mp4',
        });

        assert(sourceRes.isOk(), `createVideoFrameSource 应该成功: ${sourceRes.isErr() ? sourceRes.unwrapErr().message : ''}`);
        const source = sourceRes.unwrap();

        const playRes = await source.play();
        assert(playRes.isOk(), `VideoFrameSource.play 应该成功: ${playRes.isErr() ? playRes.unwrapErr().message : ''}`);

        const frame = await waitForVideoFrame(source);
        assert(frame != null, 'VideoFrameSource 应该在超时时间内读取到视频帧');
        assert(frame.kind === 'pixels', '小游戏 VideoFrameSource 应该返回 pixels 帧');
        assert(frame.width > 0, '视频帧 width 应该大于 0');
        assert(frame.height > 0, '视频帧 height 应该大于 0');
        assert(frame.data.byteLength > 0, '视频帧 data 应该非空');
        frame.release();

        // 测试 seek（公开 API 单位为秒，底层转换为 ms）
        const seekTarget = 5;
        const seekRes = await source.seek(seekTarget);
        assert(seekRes.isOk(), `VideoFrameSource.seek 应该成功: ${ seekRes.isErr() ? seekRes.unwrapErr().message : '' }`);

        const seekFrame = await waitForVideoFrame(source, 3000);
        if (seekFrame != null) {
            assert(Math.abs(seekFrame.timestamp - seekTarget) < 1.5, `seek 后帧 timestamp 应接近 ${ seekTarget }s，实际 ${ seekFrame.timestamp }s`);
            console.log('✅ seek 验证通过，timestamp:', seekFrame.timestamp, 's');
            seekFrame.release();
        } else {
            console.log('seek 后未在超时时间内取到帧，跳过 timestamp 验证');
        }

        source.destroy();
        console.log('✅ VideoFrameSource 测试完成', frame.width, 'x', frame.height);
    }
}

/**
 * 解码视频帧并渲染到主屏画布播放。
 *
 * 流程：VideoFrameSource 解码出 RGBA 像素帧 → 写入离屏画布 → drawImage 居中等比缩放绘制到主屏。
 * 通过 requestAnimationFrame 驱动循环，直到播放结束或超时。
 */
async function testVideoFrameRender(): Promise<void> {
    console.log('测试解码视频帧并渲染到画布播放...');

    if (!video.isVideoFrameSourceSupported()) {
        console.log('当前环境不支持 wx.createVideoDecoder，跳过渲染测试');
        return;
    }

    // DevTools 不支持 wx.createVideoDecoder，跳过测试
    if (platform.isMiniGameDevtools()) {
        console.log('DevTools 不支持 wx.createVideoDecoder，跳过渲染测试');
        return;
    }

    const sourceRes = video.createVideoFrameSource({
        source: 'videos/mov_bbb.mp4',
        muted: true,
        loop: false,
    });
    assert(sourceRes.isOk(), `createVideoFrameSource 应该成功: ${ sourceRes.isErr() ? sourceRes.unwrapErr().message : '' }`);
    const source = sourceRes.unwrap();

    const mainCanvas = getMainCanvas();
    const mainCtx = getMainCtx();

    // 离屏画布：接收 putImageData，再 drawImage 到主屏以支持缩放
    const offCanvas = wx.createCanvas() as unknown as HTMLCanvasElement;
    const offCtx = offCanvas.getContext('2d') as CanvasRenderingContext2D;

    let imageData: ImageData | null = null;
    let rafId = 0;
    let stopped = false;

    const cleanup = (): void => {
        if (stopped) return;
        stopped = true;
        if (rafId !== 0) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        source.destroy();
    };

    const playRes = await source.play();
    assert(playRes.isOk(), `VideoFrameSource.play 应该成功: ${ playRes.isErr() ? playRes.unwrapErr().message : '' }`);
    console.log('开始渲染视频帧...');

    const renderTimeout = 15000;

    await new Promise<void>((resolve) => {
        const timeoutTimer = setTimeout(() => {
            console.log(`渲染播放达到超时 ${ renderTimeout }ms，停止`);
            cleanup();
            resolve();
        }, renderTimeout);

        source.onEnded(() => {
            console.log('视频播放结束');
            clearTimeout(timeoutTimer);
            cleanup();
            resolve();
        });

        source.onError((err) => {
            console.error('视频帧源错误:', err.message);
            clearTimeout(timeoutTimer);
            cleanup();
            resolve();
        });

        const renderFrame = (): void => {
            if (stopped) return;

            const frameRes = source.getFrame();
            assert(frameRes.isOk(), `getFrame 应该成功: ${ frameRes.isErr() ? frameRes.unwrapErr().message : '' }`);

            const frame = frameRes.unwrap();
            if (frame != null && frame.kind === 'pixels') {
                // 首帧初始化离屏画布尺寸和 ImageData
                if (offCanvas.width !== frame.width || offCanvas.height !== frame.height) {
                    offCanvas.width = frame.width;
                    offCanvas.height = frame.height;
                    imageData = offCtx.createImageData(frame.width, frame.height);
                }

                if (imageData != null) {
                    // 写入 RGBA 像素数据到离屏画布
                    imageData.data.set(frame.data);
                    offCtx.putImageData(imageData, 0, 0);

                    // 居中等比缩放绘制到主屏
                    mainCtx.fillStyle = '#000000';
                    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

                    const scale = Math.min(mainCanvas.width / frame.width, mainCanvas.height / frame.height);
                    const drawWidth = frame.width * scale;
                    const drawHeight = frame.height * scale;
                    const drawX = (mainCanvas.width - drawWidth) / 2;
                    const drawY = (mainCanvas.height - drawHeight) / 2;
                    mainCtx.drawImage(offCanvas, drawX, drawY, drawWidth, drawHeight);
                }

                frame.release();
            }

            rafId = requestAnimationFrame(renderFrame);
        };

        rafId = requestAnimationFrame(renderFrame);
    });

    console.log('✅ 视频帧渲染播放测试完成');
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
        src: videoUrl,
        width: videoWidth,
        height: videoHeight,
        x,
        y,
        autoplay: false,
        controls: false,
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

        // DevTools 可能不触发 ended 事件，避免测试一直等待。
        if (platform.isMiniGameDevtools()) {
            let videoEndedTimer: ReturnType<typeof setTimeout> | undefined;
            const waitResult = await Promise.race([
                videoEndedPromise.then(() => 'ended' as const),
                new Promise<'timeout'>((resolve) => {
                    videoEndedTimer = setTimeout(() => resolve('timeout'), videoPlaybackTimeout);
                }),
            ]);

            if (videoEndedTimer != null) clearTimeout(videoEndedTimer);

            if (waitResult === 'timeout') {
                console.log(`视频播放等待超过${ videoPlaybackTimeout }ms，可能是 DevTools 未触发 ended 事件`);
            } else {
                console.log('✅ 视频播放完毕');
            }
        } else {
            await videoEndedPromise;
            console.log('✅ 视频播放完毕');
        }
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
    await testVideoFrameRender();

    console.log('🎉 Video测试完成');
}
