import { afterEach, expect, test, vi } from 'vitest';
import { video } from 'minigame-std';

// Clean up video elements after each test
afterEach(() => {
    document.querySelectorAll('video').forEach(v => v.remove());
});

test('createVideo creates a video element with basic options', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        width: 640,
        height: 480,
    });

    expect(v.src).toContain('video.mp4');
    expect(v.width).toBe(640);
    expect(v.height).toBe(480);

    // Clean up
    v.destroy();
});

test('createVideo sets autoplay, loop, muted, controls', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        autoplay: true,
        loop: true,
        muted: true,
        controls: true,
    });

    expect(v.autoplay).toBe(true);
    expect(v.loop).toBe(true);
    expect(v.muted).toBe(true);
    expect(v.controls).toBe(true);

    v.destroy();
});

test('createVideo sets playbackRate', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        playbackRate: 1.5,
    });

    expect(v.playbackRate).toBe(1.5);

    v.destroy();
});

test('createVideo sets poster', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
    });

    expect(v.poster).toContain('poster.jpg');

    v.destroy();
});

test('createVideo sets backgroundColor and objectFit', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        backgroundColor: '#000000',
        objectFit: 'cover',
    });

    expect(v.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(v.objectFit).toBe('cover');

    v.destroy();
});

test('createVideo sets position (x, y)', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        x: 100,
        y: 200,
    });

    expect(v.x).toBe(100);
    expect(v.y).toBe(200);

    v.destroy();
});

test('video properties can be modified', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // Modify properties
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.controls = true;
    v.width = 800;
    v.height = 600;
    v.x = 50;
    v.y = 100;
    v.backgroundColor = 'red';
    v.objectFit = 'contain';
    v.poster = 'https://example.com/new-poster.jpg';
    v.src = 'https://example.com/new-video.mp4';

    expect(v.autoplay).toBe(true);
    expect(v.loop).toBe(true);
    expect(v.muted).toBe(true);
    expect(v.controls).toBe(true);
    expect(v.width).toBe(800);
    expect(v.height).toBe(600);
    expect(v.x).toBe(50);
    expect(v.y).toBe(100);
    expect(v.backgroundColor).toBe('red');
    expect(v.objectFit).toBe('contain');
    expect(v.poster).toContain('new-poster.jpg');
    expect(v.src).toContain('new-video.mp4');

    v.destroy();
});

test('video unsupported properties return false', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // These properties are not supported on web
    expect(v.enablePlayGesture).toBe(false);
    expect(v.enableProgressGesture).toBe(false);
    expect(v.live).toBe(false);
    expect(v.obeyMuteSwitch).toBe(false);
    expect(v.showCenterPlayBtn).toBe(false);

    // Setting them should not throw
    v.enablePlayGesture = true;
    v.enableProgressGesture = true;
    v.live = true;
    v.obeyMuteSwitch = true;
    v.showCenterPlayBtn = true;

    // They still return false (not supported)
    expect(v.enablePlayGesture).toBe(false);

    v.destroy();
});

test('video showProgress and showProgressInControlMode', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        controls: true,
    });

    expect(v.showProgress).toBe(true);
    expect(v.showProgressInControlMode).toBe(true);

    v.showProgress = false;
    v.showProgressInControlMode = false;

    v.destroy();
});

test('video initialTime property', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        initialTime: 10,
    });

    expect(v.initialTime).toBe(10);

    v.initialTime = 20;

    v.destroy();
});

test('video pause method', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    await v.pause();
    // Should not throw

    v.destroy();
});

test('video stop method', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    await v.stop();
    // Should not throw

    v.destroy();
});

test('video seek method', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    await v.seek(5);
    // Should not throw

    v.destroy();
});

test('video destroy removes element from DOM', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoElements = document.querySelectorAll('video');
    expect(videoElements.length).toBeGreaterThan(0);

    v.destroy();

    // After destroy, video should be removed
    const remainingVideos = document.querySelectorAll('video[src*="video.mp4"]');
    expect(remainingVideos.length).toBe(0);
});

test('video event listeners can be added and removed', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const playListener = vi.fn();
    const pauseListener = vi.fn();
    const endedListener = vi.fn();
    const errorListener = vi.fn();
    const timeUpdateListener = vi.fn();
    const waitingListener = vi.fn();
    const progressListener = vi.fn();

    // Add listeners
    v.onPlay(playListener);
    v.onPause(pauseListener);
    v.onEnded(endedListener);
    v.onError(errorListener);
    v.onTimeUpdate(timeUpdateListener);
    v.onWaiting(waitingListener);
    v.onProgress(progressListener);

    // Remove specific listeners
    v.offPlay(playListener);
    v.offPause(pauseListener);
    v.offEnded(endedListener);
    v.offError(errorListener);
    v.offTimeUpdate(timeUpdateListener);
    v.offWaiting(waitingListener);
    v.offProgress(progressListener);

    v.destroy();
});

test('video off* methods can clear all listeners', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    v.onPlay(listener1);
    v.onPlay(listener2);

    // Remove all play listeners
    v.offPlay();

    // Also test other off methods without arguments
    v.offPause();
    v.offEnded();
    v.offError();
    v.offTimeUpdate();
    v.offWaiting();
    v.offProgress();

    v.destroy();
});

test('video on* property callbacks', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const endedCallback = vi.fn();
    const errorCallback = vi.fn();
    const pauseCallback = vi.fn();
    const playCallback = vi.fn();
    const progressCallback = vi.fn();
    const timeUpdateCallback = vi.fn();
    const waitingCallback = vi.fn();

    // Set callbacks via properties
    v.onended = endedCallback;
    v.onerror = errorCallback;
    v.onpause = pauseCallback;
    v.onplay = playCallback;
    v.onprogress = progressCallback;
    v.ontimeupdate = timeUpdateCallback;
    v.onwaiting = waitingCallback;

    // Get callbacks
    expect(v.onended).toBe(endedCallback);
    expect(v.onerror).toBe(errorCallback);
    expect(v.onpause).toBe(pauseCallback);
    expect(v.onplay).toBe(playCallback);
    expect(v.onprogress).toBe(progressCallback);
    expect(v.ontimeupdate).toBe(timeUpdateCallback);
    expect(v.onwaiting).toBe(waitingCallback);

    v.destroy();
});

test('video exitFullScreen method', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // Mock exitFullscreen since we're not actually in fullscreen
    const originalExitFullscreen = document.exitFullscreen;
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    await v.exitFullScreen();
    expect(document.exitFullscreen).toHaveBeenCalled();

    document.exitFullscreen = originalExitFullscreen;
    v.destroy();
});

test('createVideo with no optional properties', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // Default values
    expect(v.autoplay).toBe(false);
    expect(v.controls).toBe(false);
    expect(v.loop).toBe(false);
    expect(v.muted).toBe(false);
    expect(v.playbackRate).toBe(1);
    expect(v.initialTime).toBe(0);

    v.destroy();
});
