/**
 * Web平台创建视频播放器
 * @param options - 视频配置选项
 * @returns Video对象，模拟WechatMinigame.Video接口
 */
export function createVideo(options: WechatMinigame.CreateVideoOption): WechatMinigame.Video {
    const {
        autoplay = false,
        backgroundColor,
        controls = false,
        height,
        initialTime,
        loop = false,
        muted = false,
        objectFit,
        playbackRate = 1,
        poster,
        src,
        width,
        x,
        y,
    } = options;

    const video = document.createElement('video');

    // 设置基本属性
    video.src = src;
    video.autoplay = autoplay;
    video.controls = controls;
    video.loop = loop;
    video.muted = muted;
    video.playbackRate = playbackRate;

    // 设置移动端内联播放
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    if (poster) {
        video.poster = poster;
    }

    // 设置尺寸
    if (height != undefined) {
        video.height = height;
    }
    if (width != undefined) {
        video.width = width;
    }

    // 设置样式
    if (backgroundColor) {
        video.style.backgroundColor = backgroundColor;
    }
    if (objectFit) {
        video.style.objectFit = objectFit;
    }

    // 设置定位
    if (x != undefined || y != undefined) {
        video.style.position = 'absolute';
        if (x != undefined) {
            video.style.left = `${ x }px`;
        }
        if (y != undefined) {
            video.style.top = `${ y }px`;
        }
    }

    // 添加到DOM
    document.body.appendChild(video);

    // 如果设置了初始播放位置，在元数据加载后跳转
    if (initialTime != undefined) {
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = initialTime;
        }, {
            once: true,
        });
    }

    // 事件监听器存储
    type Callback = (...args: unknown[]) => void;
    const listeners = {
        ended: new Set<Callback>(),
        error: new Set<Callback>(),
        pause: new Set<Callback>(),
        play: new Set<Callback>(),
        progress: new Set<Callback>(),
        timeupdate: new Set<Callback>(),
        waiting: new Set<Callback>(),
    };

    // 绑定原生事件到监听器
    video.addEventListener('ended', () => {
        listeners.ended.forEach(cb => {
            cb();
        });
    });
    video.addEventListener('error', () => {
        const errMsg = video.error?.message ?? 'MEDIA_ERR_UNKNOWN';
        listeners.error.forEach(cb => cb({
            errMsg,
        }));
    });
    video.addEventListener('pause', () => {
        listeners.pause.forEach(cb => {
            cb();
        });
    });
    video.addEventListener('play', () => {
        listeners.play.forEach(cb => {
            cb();
        });
    });
    video.addEventListener('progress', () => {
        const buffered = video.buffered;
        const bufferedPercent = buffered.length > 0
            ? (buffered.end(buffered.length - 1) / video.duration) * 100
            : 0;
        listeners.progress.forEach(cb => cb({
            buffered: bufferedPercent,
        }));
    });
    video.addEventListener('timeupdate', () => {
        listeners.timeupdate.forEach(cb => cb({
            position: video.currentTime,
            duration: video.duration,
        }));
    });
    video.addEventListener('waiting', () => {
        listeners.waiting.forEach(cb => {
            cb();
        });
    });

    // 构建WechatMinigame.Video兼容对象
    const videoProxy: WechatMinigame.Video = {
        // 属性
        get autoplay() {
            return video.autoplay;
        },
        set autoplay(value) {
            video.autoplay = value;
        },

        get backgroundColor() {
            return video.style.backgroundColor;
        },
        set backgroundColor(value) {
            video.style.backgroundColor = value;
        },

        get controls() {
            return video.controls;
        },
        set controls(value) {
            video.controls = value;
        },

        get enablePlayGesture() {
            return false;
        },
        set enablePlayGesture(_value) {
            /* web不支持 */
        },

        get enableProgressGesture() {
            return false;
        },
        set enableProgressGesture(_value) {
            /* web不支持 */
        },

        get height() {
            return video.height;
        },
        set height(value) {
            video.height = value;
        },

        get initialTime() {
            return initialTime ?? 0;
        },
        set initialTime(value) {
            video.currentTime = value;
        },

        get live() {
            return false;
        },
        set live(_value) {
            /* web不支持 */
        },

        get loop() {
            return video.loop;
        },
        set loop(value) {
            video.loop = value;
        },

        get muted() {
            return video.muted;
        },
        set muted(value) {
            video.muted = value;
        },

        get obeyMuteSwitch() {
            return false;
        },
        set obeyMuteSwitch(_value) {
            /* web不支持 */
        },

        get objectFit() {
            return video.style.objectFit;
        },
        set objectFit(value) {
            video.style.objectFit = value;
        },

        get playbackRate() {
            return video.playbackRate;
        },
        set playbackRate(value) {
            video.playbackRate = value;
        },

        get poster() {
            return video.poster;
        },
        set poster(value) {
            video.poster = value;
        },

        get showCenterPlayBtn() {
            return false;
        },
        set showCenterPlayBtn(_value) {
            /* web不支持 */
        },

        get showProgress() {
            return video.controls;
        },
        set showProgress(_value) {
            /* web通过controls控制 */
        },

        get showProgressInControlMode() {
            return video.controls;
        },
        set showProgressInControlMode(_value) {
            /* web通过controls控制 */
        },

        get src() {
            return video.src;
        },
        set src(value) {
            video.src = value;
        },

        get width() {
            return video.width;
        },
        set width(value) {
            video.width = value;
        },

        get x() {
            return parseFloat(video.style.left) || 0;
        },
        set x(value) {
            video.style.position = 'absolute';
            video.style.left = `${ value }px`;
        },

        get y() {
            return parseFloat(video.style.top) || 0;
        },
        set y(value) {
            video.style.position = 'absolute';
            video.style.top = `${ value }px`;
        },

        // on* 属性形式的事件回调
        get onended() {
            return video.onended as WechatMinigame.Video['onended'];
        },
        set onended(value) {
            video.onended = value;
        },

        get onerror() {
            return video.onerror as WechatMinigame.Video['onerror'];
        },
        set onerror(value) {
            video.onerror = value as HTMLVideoElement['onerror'];
        },

        get onpause() {
            return video.onpause as WechatMinigame.Video['onpause'];
        },
        set onpause(value) {
            video.onpause = value;
        },

        get onplay() {
            return video.onplay as WechatMinigame.Video['onplay'];
        },
        set onplay(value) {
            video.onplay = value;
        },

        get onprogress() {
            return video.onprogress as WechatMinigame.Video['onprogress'];
        },
        set onprogress(value) {
            video.onprogress = value;
        },

        get ontimeupdate() {
            return video.ontimeupdate as WechatMinigame.Video['ontimeupdate'];
        },
        set ontimeupdate(value) {
            video.ontimeupdate = value;
        },

        get onwaiting() {
            return video.onwaiting as WechatMinigame.Video['onwaiting'];
        },
        set onwaiting(value) {
            video.onwaiting = value;
        },

        // 方法
        play(): Promise<void> {
            return video.play();
        },

        pause(): Promise<void> {
            video.pause();
            return Promise.resolve();
        },

        stop(): Promise<void> {
            video.pause();
            video.currentTime = 0;
            return Promise.resolve();
        },

        seek(time: number): Promise<void> {
            video.currentTime = time;
            return Promise.resolve();
        },

        async requestFullScreen(direction: 0 | 90 | -90): Promise<void> {
            // 先进入全屏
            await video.requestFullscreen();

            // 根据 direction 参数锁定屏幕方向
            // 0: 正常竖向 (portrait)
            // 90: 屏幕逆时针90度 (landscape-secondary，home键在右)
            // -90: 屏幕顺时针90度 (landscape-primary，home键在左)
            const orientationApi = screen.orientation as ScreenOrientation & {
                lock?: (orientation: string) => Promise<void>;
            };

            if (orientationApi?.lock) {
                try {
                    let orientation: string;
                    switch (direction) {
                        case 0:
                            orientation = 'portrait';
                            break;
                        case 90:
                            orientation = 'landscape-secondary';
                            break;
                        case -90:
                            orientation = 'landscape-primary';
                            break;
                        default:
                            return;
                    }
                    await orientationApi.lock(orientation);
                } catch {
                    // 屏幕方向锁定可能不被支持或被拒绝，忽略错误
                }
            }
        },

        exitFullScreen(): Promise<void> {
            document.exitFullscreen();
            return Promise.resolve();
        },

        destroy(): void {
            video.pause();
            video.src = '';
            video.load();
            video.remove();
            // 清理所有监听器
            Object.values(listeners).forEach(set => set.clear());
        },

        // on/off 方法形式的事件监听
        onEnded(listener: WechatMinigame.OnEndedCallback): void {
            listeners.ended.add(listener as Callback);
        },
        offEnded(listener?: WechatMinigame.OffEndedCallback): void {
            if (listener) {
                listeners.ended.delete(listener as Callback);
            } else {
                listeners.ended.clear();
            }
        },

        onError(listener: WechatMinigame.VideoOnErrorCallback): void {
            listeners.error.add(listener as Callback);
        },
        offError(listener?: WechatMinigame.VideoOffErrorCallback): void {
            if (listener) {
                listeners.error.delete(listener as Callback);
            } else {
                listeners.error.clear();
            }
        },

        onPause(listener: WechatMinigame.OnPauseCallback): void {
            listeners.pause.add(listener as Callback);
        },
        offPause(listener?: WechatMinigame.OffPauseCallback): void {
            if (listener) {
                listeners.pause.delete(listener as Callback);
            } else {
                listeners.pause.clear();
            }
        },

        onPlay(listener: WechatMinigame.OnPlayCallback): void {
            listeners.play.add(listener as Callback);
        },
        offPlay(listener?: WechatMinigame.OffPlayCallback): void {
            if (listener) {
                listeners.play.delete(listener as Callback);
            } else {
                listeners.play.clear();
            }
        },

        onProgress(listener: WechatMinigame.OnProgressCallback): void {
            listeners.progress.add(listener as Callback);
        },
        offProgress(listener?: WechatMinigame.OffProgressCallback): void {
            if (listener) {
                listeners.progress.delete(listener as Callback);
            } else {
                listeners.progress.clear();
            }
        },

        onTimeUpdate(listener: WechatMinigame.VideoOnTimeUpdateCallback): void {
            listeners.timeupdate.add(listener as Callback);
        },
        offTimeUpdate(listener?: WechatMinigame.VideoOffTimeUpdateCallback): void {
            if (listener) {
                listeners.timeupdate.delete(listener as Callback);
            } else {
                listeners.timeupdate.clear();
            }
        },

        onWaiting(listener: WechatMinigame.OnWaitingCallback): void {
            listeners.waiting.add(listener as Callback);
        },
        offWaiting(listener?: WechatMinigame.OffWaitingCallback): void {
            if (listener) {
                listeners.waiting.delete(listener as Callback);
            } else {
                listeners.waiting.clear();
            }
        },
    };

    return videoProxy;
}