import { addErrorListener, addResizeListener, addUnhandledrejectionListener } from 'minigame-std';

export function testEvent(): void {
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