import { addErrorListener, addHideListener, addResizeListener, addShowListener, addUnhandledrejectionListener } from 'minigame-std';

export function testEvent(): void {
    addShowListener((options) => {
        console.log('addShowListener', options?.scene, options?.query);
    });

    addHideListener(() => {
        console.log('addHideListener');
    });

    console.log('前后台监听器已注册');

    addErrorListener((err) => {
        console.error('addErrorListener message', err.message);
    });

    addUnhandledrejectionListener((err) => {
        console.error('addUnhandledrejectionListener reason', err.reason);
    });

    addResizeListener(size => {
        console.log('addResizeListener', size.windowWidth, size.windowHeight);
    });

    console.log('事件监听器已注册');
}