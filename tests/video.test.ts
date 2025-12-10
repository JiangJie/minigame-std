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

test('video play method', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        muted: true, // Muted to allow autoplay in browser
    });

    // play() returns a promise that may reject if not allowed
    try {
        await v.play();
    } catch {
        // Browser may block autoplay, that's fine
    }

    v.destroy();
});

test('video requestFullScreen method', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // requestFullScreen will likely fail in test environment
    try {
        await v.requestFullScreen(0);
    } catch {
        // Expected to fail in test environment
    }

    v.destroy();
});

test('video requestFullScreen with direction 0 (portrait)', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    // Mock requestFullscreen
    videoEl.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock screen.orientation.lock
    const mockLock = vi.fn().mockResolvedValue(undefined);
    const originalOrientation = screen.orientation;
    Object.defineProperty(screen, 'orientation', {
        value: { ...originalOrientation, lock: mockLock },
        configurable: true,
    });

    await v.requestFullScreen(0);

    expect(videoEl.requestFullscreen).toHaveBeenCalled();
    expect(mockLock).toHaveBeenCalledWith('portrait');

    // Restore
    Object.defineProperty(screen, 'orientation', {
        value: originalOrientation,
        configurable: true,
    });

    v.destroy();
});

test('video requestFullScreen with direction 90 (landscape-secondary)', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    videoEl.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const mockLock = vi.fn().mockResolvedValue(undefined);
    const originalOrientation = screen.orientation;
    Object.defineProperty(screen, 'orientation', {
        value: { ...originalOrientation, lock: mockLock },
        configurable: true,
    });

    await v.requestFullScreen(90);

    expect(videoEl.requestFullscreen).toHaveBeenCalled();
    expect(mockLock).toHaveBeenCalledWith('landscape-secondary');

    Object.defineProperty(screen, 'orientation', {
        value: originalOrientation,
        configurable: true,
    });

    v.destroy();
});

test('video requestFullScreen with direction -90 (landscape-primary)', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    videoEl.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const mockLock = vi.fn().mockResolvedValue(undefined);
    const originalOrientation = screen.orientation;
    Object.defineProperty(screen, 'orientation', {
        value: { ...originalOrientation, lock: mockLock },
        configurable: true,
    });

    await v.requestFullScreen(-90);

    expect(videoEl.requestFullscreen).toHaveBeenCalled();
    expect(mockLock).toHaveBeenCalledWith('landscape-primary');

    Object.defineProperty(screen, 'orientation', {
        value: originalOrientation,
        configurable: true,
    });

    v.destroy();
});

test('video requestFullScreen without direction does not lock orientation', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    videoEl.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const mockLock = vi.fn().mockResolvedValue(undefined);
    const originalOrientation = screen.orientation;
    Object.defineProperty(screen, 'orientation', {
        value: { ...originalOrientation, lock: mockLock },
        configurable: true,
    });

    // Call without direction parameter
    await v.requestFullScreen(undefined as unknown as 0);

    expect(videoEl.requestFullscreen).toHaveBeenCalled();
    expect(mockLock).not.toHaveBeenCalled();

    Object.defineProperty(screen, 'orientation', {
        value: originalOrientation,
        configurable: true,
    });

    v.destroy();
});

test('video requestFullScreen handles orientation lock failure gracefully', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    videoEl.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock lock to reject
    const mockLock = vi.fn().mockRejectedValue(new Error('Orientation lock not supported'));
    const originalOrientation = screen.orientation;
    Object.defineProperty(screen, 'orientation', {
        value: { ...originalOrientation, lock: mockLock },
        configurable: true,
    });

    // Should not throw even if lock fails
    await v.requestFullScreen(0);

    expect(videoEl.requestFullscreen).toHaveBeenCalled();
    expect(mockLock).toHaveBeenCalledWith('portrait');

    Object.defineProperty(screen, 'orientation', {
        value: originalOrientation,
        configurable: true,
    });

    v.destroy();
});

test('video requestFullScreen works when orientation.lock is not available', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    videoEl.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock orientation without lock method
    const originalOrientation = screen.orientation;
    Object.defineProperty(screen, 'orientation', {
        value: { type: 'portrait-primary', angle: 0 },
        configurable: true,
    });

    // Should not throw when lock is not available
    await v.requestFullScreen(0);

    expect(videoEl.requestFullscreen).toHaveBeenCalled();

    Object.defineProperty(screen, 'orientation', {
        value: originalOrientation,
        configurable: true,
    });

    v.destroy();
});

test('createVideo with only x position', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        x: 50,
    });

    expect(v.x).toBe(50);
    // y should default to 0
    expect(v.y).toBe(0);

    v.destroy();
});

test('createVideo with only y position', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        y: 100,
    });

    // x should default to 0
    expect(v.x).toBe(0);
    expect(v.y).toBe(100);

    v.destroy();
});

test('video playbackRate can be modified', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    v.playbackRate = 2;
    expect(v.playbackRate).toBe(2);

    v.playbackRate = 0.5;
    expect(v.playbackRate).toBe(0.5);

    v.destroy();
});

test('video event listeners are called when events fire', async () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        muted: true,
    });

    const playListener = vi.fn();
    const pauseListener = vi.fn();

    v.onPlay(playListener);
    v.onPause(pauseListener);

    // Get the actual video element to dispatch events
    const videoEl = document.querySelector('video') as HTMLVideoElement;

    // Dispatch play event
    videoEl.dispatchEvent(new Event('play'));
    expect(playListener).toHaveBeenCalled();

    // Dispatch pause event
    videoEl.dispatchEvent(new Event('pause'));
    expect(pauseListener).toHaveBeenCalled();

    v.destroy();
});

test('video ended event listener is called', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const endedListener = vi.fn();
    v.onEnded(endedListener);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('ended'));

    expect(endedListener).toHaveBeenCalled();

    v.destroy();
});

test('video waiting event listener is called', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const waitingListener = vi.fn();
    v.onWaiting(waitingListener);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('waiting'));

    expect(waitingListener).toHaveBeenCalled();

    v.destroy();
});

test('video timeupdate event listener receives position and duration', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const timeUpdateListener = vi.fn();
    v.onTimeUpdate(timeUpdateListener);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('timeupdate'));

    expect(timeUpdateListener).toHaveBeenCalledWith(expect.objectContaining({
        position: expect.any(Number),
        duration: expect.any(Number),
    }));

    v.destroy();
});

test('video error event listener receives error message', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const errorListener = vi.fn();
    v.onError(errorListener);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('error'));

    expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({
        errMsg: expect.any(String),
    }));

    v.destroy();
});

test('video progress event listener receives buffered percentage', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const progressListener = vi.fn();
    v.onProgress(progressListener);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('progress'));

    expect(progressListener).toHaveBeenCalledWith(expect.objectContaining({
        buffered: expect.any(Number),
    }));

    v.destroy();
});

test('video initialTime sets currentTime on loadedmetadata', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
        initialTime: 15,
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    // Dispatch loadedmetadata event
    videoEl.dispatchEvent(new Event('loadedmetadata'));

    // currentTime should be set to initialTime
    expect(videoEl.currentTime).toBe(15);

    v.destroy();
});

test('video with no initialTime does not set currentTime on loadedmetadata', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    // Store initial currentTime
    const initialCurrentTime = videoEl.currentTime;

    // Dispatch loadedmetadata event
    videoEl.dispatchEvent(new Event('loadedmetadata'));

    // currentTime should not have been changed by initialTime handling
    expect(videoEl.currentTime).toBe(initialCurrentTime);

    v.destroy();
});

test('video multiple listeners for same event type', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    v.onPlay(listener1);
    v.onPlay(listener2);
    v.onPlay(listener3);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('play'));

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();

    v.destroy();
});

test('video offPlay removes only specified listener', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    v.onPlay(listener1);
    v.onPlay(listener2);

    // Remove only listener1
    v.offPlay(listener1);

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.dispatchEvent(new Event('play'));

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();

    v.destroy();
});

test('video playsinline attributes are set', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;

    expect(videoEl.getAttribute('playsinline')).toBe('true');
    expect(videoEl.getAttribute('webkit-playsinline')).toBe('true');

    v.destroy();
});

test('video x getter returns 0 when style.left is not set', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // x should return 0 when not set
    expect(v.x).toBe(0);

    v.destroy();
});

test('video y getter returns 0 when style.top is not set', () => {
    const v = video.createVideo({
        src: 'https://example.com/video.mp4',
    });

    // y should return 0 when not set
    expect(v.y).toBe(0);

    v.destroy();
});
