/**
 * 测试小游戏环境下的 video/mod.ts（isMinaEnv = true 分支）
 */
import { beforeEach, expect, test, vi } from 'vitest';

// 创建 mock 的 Video 对象
function createMockVideo(): WechatMinigame.Video {
    const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

    return {
        src: '',
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        autoplay: false,
        loop: false,
        muted: false,
        controls: false,
        poster: '',
        objectFit: 'contain',
        initialTime: 0,
        playbackRate: 1,
        backgroundColor: '#000000',
        play: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        seek: vi.fn(),
        requestFullScreen: vi.fn(),
        exitFullScreen: vi.fn(),
        destroy: vi.fn(),
        onPlay: vi.fn((callback) => {
            listeners['play'] = listeners['play'] || [];
            listeners['play'].push(callback);
        }),
        offPlay: vi.fn(),
        onPause: vi.fn((callback) => {
            listeners['pause'] = listeners['pause'] || [];
            listeners['pause'].push(callback);
        }),
        offPause: vi.fn(),
        onEnded: vi.fn((callback) => {
            listeners['ended'] = listeners['ended'] || [];
            listeners['ended'].push(callback);
        }),
        offEnded: vi.fn(),
        onTimeUpdate: vi.fn((callback) => {
            listeners['timeupdate'] = listeners['timeupdate'] || [];
            listeners['timeupdate'].push(callback);
        }),
        offTimeUpdate: vi.fn(),
        onError: vi.fn((callback) => {
            listeners['error'] = listeners['error'] || [];
            listeners['error'].push(callback);
        }),
        offError: vi.fn(),
        onWaiting: vi.fn((callback) => {
            listeners['waiting'] = listeners['waiting'] || [];
            listeners['waiting'].push(callback);
        }),
        offWaiting: vi.fn(),
        onProgress: vi.fn((callback) => {
            listeners['progress'] = listeners['progress'] || [];
            listeners['progress'].push(callback);
        }),
        offProgress: vi.fn(),
        enablePlayGesture: false,
        enableProgressGesture: false,
        live: false,
        obeyMuteSwitch: false,
        showCenterPlayBtn: false,
        showProgress: false,
        showProgressInControlMode: false,
        onended: vi.fn(),
        onerror: vi.fn(),
        onpause: vi.fn(),
        onplay: vi.fn(),
        onprogress: vi.fn(),
        ontimeupdate: vi.fn(),
        onwaiting: vi.fn(),
    };
}

let mockVideo: WechatMinigame.Video;

// Mock isMinaEnv 返回 true
vi.mock('../src/macros/env.ts', () => ({
    isMinaEnv: () => true,
}));

// Mock wx.createVideo
vi.stubGlobal('wx', {
    createVideo: vi.fn((options: WechatMinigame.CreateVideoOption) => {
        mockVideo = createMockVideo();
        // 应用选项
        mockVideo.src = options.src ?? '';
        mockVideo.width = options.width ?? 0;
        mockVideo.height = options.height ?? 0;
        mockVideo.x = options.x ?? 0;
        mockVideo.y = options.y ?? 0;
        mockVideo.autoplay = options.autoplay ?? false;
        mockVideo.loop = options.loop ?? false;
        mockVideo.muted = options.muted ?? false;
        mockVideo.controls = options.controls ?? false;
        mockVideo.poster = options.poster ?? '';
        mockVideo.objectFit = options.objectFit ?? 'contain';
        mockVideo.initialTime = options.initialTime ?? 0;
        mockVideo.playbackRate = options.playbackRate ?? 1;
        mockVideo.backgroundColor = options.backgroundColor ?? '#000000';
        return mockVideo;
    }),
});

// 动态导入 mod.ts（会使用 mock 的 isMinaEnv）
const { createVideo } = await import('../src/std/video/mod.ts');

beforeEach(() => {
    vi.clearAllMocks();
});

test('createVideo uses mina implementation when isMinaEnv returns true', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        width: 640,
        height: 360,
    };

    const video = createVideo(options);

    expect(wx.createVideo).toHaveBeenCalledWith(options);
    expect(video.src).toBe('https://example.com/video.mp4');
    expect(video.width).toBe(640);
    expect(video.height).toBe(360);
});

test('createVideo with autoplay and loop options', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        width: 320,
        height: 240,
        autoplay: true,
        loop: true,
    };

    const video = createVideo(options);

    expect(video.autoplay).toBe(true);
    expect(video.loop).toBe(true);
});

test('createVideo with muted and controls options', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        muted: true,
        controls: true,
    };

    const video = createVideo(options);

    expect(video.muted).toBe(true);
    expect(video.controls).toBe(true);
});

test('createVideo with position options', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        x: 100,
        y: 200,
    };

    const video = createVideo(options);

    expect(video.x).toBe(100);
    expect(video.y).toBe(200);
});

test('createVideo with poster and objectFit options', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        objectFit: 'cover',
    };

    const video = createVideo(options);

    expect(video.poster).toBe('https://example.com/poster.jpg');
    expect(video.objectFit).toBe('cover');
});

test('createVideo with playbackRate and initialTime options', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        playbackRate: 1.5,
        initialTime: 10,
    };

    const video = createVideo(options);

    expect(video.playbackRate).toBe(1.5);
    expect(video.initialTime).toBe(10);
});

test('createVideo with backgroundColor option', () => {
    const options: WechatMinigame.CreateVideoOption = {
        src: 'https://example.com/video.mp4',
        backgroundColor: '#FF0000',
    };

    const video = createVideo(options);

    expect(video.backgroundColor).toBe('#FF0000');
});

test('video play method is callable', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    video.play();
    expect(mockVideo.play).toHaveBeenCalled();
});

test('video pause method is callable', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    video.pause();
    expect(mockVideo.pause).toHaveBeenCalled();
});

test('video stop method is callable', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    video.stop();
    expect(mockVideo.stop).toHaveBeenCalled();
});

test('video destroy method is callable', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    video.destroy();
    expect(mockVideo.destroy).toHaveBeenCalled();
});

test('video seek method is callable', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    video.seek(30);
    expect(mockVideo.seek).toHaveBeenCalledWith(30);
});

test('video event listeners can be registered', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    const playCallback = vi.fn();
    const pauseCallback = vi.fn();
    const endedCallback = vi.fn();
    const errorCallback = vi.fn();

    video.onPlay(playCallback);
    video.onPause(pauseCallback);
    video.onEnded(endedCallback);
    video.onError(errorCallback);

    expect(mockVideo.onPlay).toHaveBeenCalledWith(playCallback);
    expect(mockVideo.onPause).toHaveBeenCalledWith(pauseCallback);
    expect(mockVideo.onEnded).toHaveBeenCalledWith(endedCallback);
    expect(mockVideo.onError).toHaveBeenCalledWith(errorCallback);
});

test('video requestFullScreen and exitFullScreen are callable', () => {
    const video = createVideo({
        src: 'https://example.com/video.mp4',
    });

    video.requestFullScreen(0);
    expect(mockVideo.requestFullScreen).toHaveBeenCalled();

    video.exitFullScreen();
    expect(mockVideo.exitFullScreen).toHaveBeenCalled();
});

test.afterAll(() => {
    vi.unstubAllGlobals();
});
