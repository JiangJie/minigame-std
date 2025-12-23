import { expect, test, describe } from 'vitest';
import { parseUserAgent } from '../src/std/platform/user_agent.ts';

describe('parseUserAgent', () => {
    describe('iOS devices', () => {
        test('parses iPhone userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('iPhone');
            expect(result.platform).toBe('ios');
            expect(result.system).toBe('iOS 18.7');
        });

        test('parses iPad userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('iPad');
            expect(result.platform).toBe('ios');
            expect(result.system).toBe('iOS 16.0');
        });

        test('parses iPod userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (iPod; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('iPod');
            expect(result.platform).toBe('ios');
            expect(result.system).toBe('iOS 14.0');
        });
    });

    describe('Android devices', () => {
        test('parses HUAWEI Android userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (Linux; Android 12; ELS-AN00 Build/HUAWEIELS-AN00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/142.0.7444.173 Mobile Safari/537.36';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('ELS-AN00');
            expect(result.platform).toBe('android');
            expect(result.system).toBe('Android 12');
        });

        test('parses Redmi Android userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (Linux; U; Android 13; zh-cn; 22127RK46C Build/TKQ1.220905.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.7049.79 Mobile Safari/537.36';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('22127RK46C');
            expect(result.platform).toBe('android');
            expect(result.system).toBe('Android 13');
        });

        test('parses Samsung Android userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (Linux; Android 13; SM-G998B Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('SM-G998B');
            expect(result.platform).toBe('android');
            expect(result.system).toBe('Android 13');
        });
    });

    describe('Desktop platforms', () => {
        test('parses macOS userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('Mac');
            expect(result.platform).toBe('mac');
            expect(result.system).toBe('macOS 10.15.7');
        });

        test('parses Windows userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('PC');
            expect(result.platform).toBe('windows');
            expect(result.system).toBe('Windows NT 10.0');
        });

        test('parses Linux userAgent correctly', () => {
            const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('Linux');
            expect(result.platform).toBe('linux');
            expect(result.system).toBe('Linux');
        });
    });

    describe('Edge cases', () => {
        test('returns unknown for unrecognized userAgent', () => {
            const ua = 'SomeUnknownBrowser/1.0';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('unknown');
            expect(result.platform).toBe('unknown');
            expect(result.system).toBe('unknown');
        });

        test('handles empty userAgent', () => {
            const ua = '';
            const result = parseUserAgent(ua);

            expect(result.model).toBe('unknown');
            expect(result.platform).toBe('unknown');
            expect(result.system).toBe('unknown');
        });
    });
});
