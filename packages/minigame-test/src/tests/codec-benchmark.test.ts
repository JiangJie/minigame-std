import { decodeUtf8, encodeUtf8, getPerformanceNow } from 'minigame-std';

/**
 * Benchmark 结果类型
 */
interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    avgTime: number;
    opsPerSecond: number;
}

/**
 * 运行简单的 benchmark
 * @param name - 测试名称
 * @param fn - 要测试的函数
 * @param iterations - 迭代次数
 * @returns Benchmark 结果
 */
function runBenchmark(name: string, fn: () => void, iterations: number): BenchmarkResult {
    // Warmup
    for (let i = 0; i < Math.min(100, iterations / 10); i++) {
        fn();
    }

    const start = getPerformanceNow();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const totalTime = getPerformanceNow() - start;

    const avgTime = totalTime / iterations;
    const opsPerSecond = 1000 / avgTime;

    return {
        name,
        iterations,
        totalTime,
        avgTime,
        opsPerSecond,
    };
}

/**
 * 格式化 benchmark 结果
 */
function formatResult(result: BenchmarkResult): string {
    return `${result.name}:
    总耗时: ${result.totalTime.toFixed(2)}ms
    平均耗时: ${result.avgTime.toFixed(4)}ms
    ops/sec: ${result.opsPerSecond.toFixed(2)}`;
}

/**
 * 对比两个 benchmark 结果
 */
function compareResults(baseline: BenchmarkResult, target: BenchmarkResult): string {
    const speedup = baseline.avgTime / target.avgTime;
    const percentFaster = ((speedup - 1) * 100).toFixed(2);
    const comparison =
        speedup > 1
            ? `${target.name} 比 ${baseline.name} 快 ${percentFaster}%`
            : `${target.name} 比 ${baseline.name} 慢 ${Math.abs(Number.parseFloat(percentFaster)).toFixed(2)}%`;

    return `📊 对比结果: ${comparison} (${speedup.toFixed(2)}x)`;
}

export function testCodecBenchmark(): void {
    console.log('='.repeat(60));
    console.log('UTF-8 编解码 Benchmark 测试');
    console.log('='.repeat(60));

    const ITERATIONS = 10000;

    // 测试数据
    const testCases = {
        ascii: 'Hello, World! This is a simple ASCII string for testing.',
        chinese: '你好世界！这是一段用于测试的中文文本。微信小游戏开发真有趣。',
        mixed: 'Hello 你好 World 世界! 🎉 Mixed content with emoji 表情符号',
        emoji: '😀🎉🚀💻🎮🌟🔥💯🎯🏆',
        long: 'a'.repeat(1000),
        longChinese: '中'.repeat(500),
    };

    for (const [caseName, testData] of Object.entries(testCases)) {
        console.log(`\n${'-'.repeat(60)}`);
        console.log(`测试用例: ${caseName} (长度: ${testData.length} 字符)`);
        console.log('-'.repeat(60));

        // ==================== Encode 测试 ====================
        console.log('\n【编码测试 Encode】');

        // wx.encode (通过 encodeUtf8)
        const wxEncodeResult = runBenchmark('wx.encode', () => encodeUtf8(testData), ITERATIONS);
        console.log(formatResult(wxEncodeResult));

        const wxEncode = wx.encode;
        // @ts-expect-error: 临时替换 wx.encode, 让 encodeUtf8 走纯 JS 实现
        wx.encode = null;

        // encodeUtf8 (纯 JS 实现)
        const jsEncodeResult = runBenchmark(
            'encodeUtf8 (JS)',
            () => encodeUtf8(testData),
            ITERATIONS,
        );
        console.log(`\n${formatResult(jsEncodeResult)}`);

        console.log(`\n${compareResults(jsEncodeResult, wxEncodeResult)}`);
        // 恢复 wx.encode
        wx.encode = wxEncode;

        // ==================== Decode 测试 ====================
        console.log('\n【解码测试 Decode】');

        // 预先编码数据用于解码测试
        const encodedData = encodeUtf8(testData);

        // wx.decode (通过 decodeUtf8)
        const wxDecodeResult = runBenchmark('wx.decode', () => decodeUtf8(encodedData), ITERATIONS);
        console.log(formatResult(wxDecodeResult));

        const wxDecode = wx.decode;
        // @ts-expect-error: 临时替换 wx.decode, 让 decodeUtf8 走纯 JS 实现
        wx.decode = null;
        // decodeUtf8 (纯 JS 实现)
        const jsDecodeResult = runBenchmark(
            'decodeUtf8 (JS)',
            () => decodeUtf8(encodedData),
            ITERATIONS,
        );
        console.log(`\n${formatResult(jsDecodeResult)}`);

        console.log(`\n${compareResults(jsDecodeResult, wxDecodeResult)}`);
        // 恢复 wx.decode
        wx.decode = wxDecode;

        // ==================== 往返测试 ====================
        console.log('\n【往返测试 Roundtrip】');

        // wx.encode + wx.decode
        const wxRoundtripResult = runBenchmark(
            'wx.encode + wx.decode',
            () => decodeUtf8(encodeUtf8(testData)),
            ITERATIONS,
        );
        console.log(formatResult(wxRoundtripResult));

        // @ts-expect-error: 临时替换 wx.encode, 让 encodeUtf8 走纯 JS 实现
        wx.encode = null;
        // @ts-expect-error: 临时替换 wx.decode, 让 decodeUtf8 走纯 JS 实现
        wx.decode = null;
        // encodeUtf8 + decodeUtf8
        const jsRoundtripResult = runBenchmark(
            'encodeUtf8 + decodeUtf8 (JS)',
            () => decodeUtf8(encodeUtf8(testData)),
            ITERATIONS,
        );
        console.log(`\n${formatResult(jsRoundtripResult)}`);

        console.log(`\n${compareResults(jsRoundtripResult, wxRoundtripResult)}`);
        // 恢复 wx.encode 和 wx.decode
        wx.encode = wxEncode;
        wx.decode = wxDecode;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 Codec Benchmark 测试完成');
    console.log('='.repeat(60));
}
