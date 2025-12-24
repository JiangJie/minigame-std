const canvas = wx.createCanvas() as unknown as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// window.requestAnimationFrame(loop)

function loop() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 750, 1334);

    ctx.fillStyle = '#000000';
    ctx.font = `20px`;

    const text = 'minigame-std 小游戏环境测试用例';
    const textWidth = ctx.measureText(text).width;
    const x = (canvas.width - textWidth) / 2;

    ctx.fillText(text, x, 300);

    // window.requestAnimationFrame(loop)
}

loop();