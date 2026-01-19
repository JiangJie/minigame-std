/**
 * 测试运行器 - 管理测试注册和UI绘制
 */

export interface TestSuite {
    name: string;
    run: () => void | Promise<void>;
}

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed';

interface TestState {
    suite: TestSuite;
    status: TestStatus;
    error?: Error;
}

// 存储所有注册的测试
const testStates: TestState[] = [];

// Canvas 和上下文
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

// 按钮布局配置
const BUTTON_CONFIG = {
    startX: 30,
    startY: 80,
    width: 160,
    height: 50,
    gap: 15,
    columns: 2,
    fontSize: 16,
    cornerRadius: 8,
};

// 颜色配置
const COLORS = {
    idle: '#4a90d9',
    running: '#f5a623',
    passed: '#7ed321',
    failed: '#d0021b',
    text: '#ffffff',
    background: '#f5f5f5',
    title: '#333333',
};

/**
 * 注册一个测试套件
 */
export function registerTest(name: string, run: () => void | Promise<void>): void {
    testStates.push({
        suite: { name, run },
        status: 'idle',
    });
}

/**
 * 初始化测试运行器
 */
export function initTestRunner(): void {
    canvas = wx.createCanvas() as unknown as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // 绑定触摸事件
    wx.onTouchEnd(handleTouch);

    // 初始渲染
    render();
}

/**
 * 获取按钮的位置
 */
function getButtonRect(index: number): { x: number; y: number; width: number; height: number; } {
    const col = index % BUTTON_CONFIG.columns;
    const row = Math.floor(index / BUTTON_CONFIG.columns);

    return {
        x: BUTTON_CONFIG.startX + col * (BUTTON_CONFIG.width + BUTTON_CONFIG.gap),
        y: BUTTON_CONFIG.startY + row * (BUTTON_CONFIG.height + BUTTON_CONFIG.gap),
        width: BUTTON_CONFIG.width,
        height: BUTTON_CONFIG.height,
    };
}

/**
 * 处理触摸事件
 */
function handleTouch(e: WechatMinigame.OnTouchStartListenerResult): void {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const x = touch.clientX;
    const y = touch.clientY;

    // 检查是否点击了某个按钮
    for (let i = 0; i < testStates.length; i++) {
        const rect = getButtonRect(i);
        if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
            runTest(i);
            break;
        }
    }
}

/**
 * 运行指定的测试
 */
async function runTest(index: number): Promise<void> {
    const state = testStates[index];
    if (state.status === 'running') return;

    state.status = 'running';
    state.error = undefined;
    render();

    console.log(`\n========== 开始测试: ${state.suite.name} ==========`);
    const startTime = Date.now();

    try {
        await state.suite.run();
        state.status = 'passed';
        console.log(`✅ ${state.suite.name} 通过 (${Date.now() - startTime}ms)`);
    } catch (error) {
        state.status = 'failed';
        state.error = error as Error;
        console.error(`❌ ${state.suite.name} 失败:`, error);
    }

    console.log(`========== 结束测试: ${state.suite.name} ==========\n`);
    render();
}

/**
 * 绘制圆角矩形
 */
function drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string,
): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

/**
 * 渲染UI
 */
function render(): void {
    // 清空画布
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制标题
    ctx.fillStyle = COLORS.title;
    ctx.font = 'bold 24px sans-serif';
    const title = 'minigame-std 测试';
    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, (canvas.width - titleWidth) / 2, 50);

    // 绘制按钮
    ctx.font = `${BUTTON_CONFIG.fontSize}px sans-serif`;

    for (let i = 0; i < testStates.length; i++) {
        const state = testStates[i];
        const rect = getButtonRect(i);

        // 根据状态选择颜色
        const color = COLORS[state.status];

        // 绘制按钮背景
        drawRoundRect(rect.x, rect.y, rect.width, rect.height, BUTTON_CONFIG.cornerRadius, color);

        // 绘制按钮文字
        ctx.fillStyle = COLORS.text;
        const text = state.suite.name;
        const textWidth = ctx.measureText(text).width;
        const textX = rect.x + (rect.width - textWidth) / 2;
        const textY = rect.y + rect.height / 2 + BUTTON_CONFIG.fontSize / 3;
        ctx.fillText(text, textX, textY);

        // 如果正在运行，绘制加载指示
        if (state.status === 'running') {
            ctx.fillStyle = COLORS.text;
            ctx.fillText('...', rect.x + rect.width - 25, textY);
        }
    }

    // 绘制统计信息
    const passed = testStates.filter(s => s.status === 'passed').length;
    const failed = testStates.filter(s => s.status === 'failed').length;
    const total = testStates.length;

    ctx.fillStyle = COLORS.title;
    ctx.font = '16px sans-serif';
    const statsY = BUTTON_CONFIG.startY + Math.ceil(total / BUTTON_CONFIG.columns) * (BUTTON_CONFIG.height + BUTTON_CONFIG.gap) + 20;
    ctx.fillText(`总计: ${total} | 通过: ${passed} | 失败: ${failed}`, BUTTON_CONFIG.startX, statsY);
}
