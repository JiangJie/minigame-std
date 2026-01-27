import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command }) => ({
    define: {
        // let `__MINIGAME_STD_MINA__` be `unknown` during build time
        ...(command === 'build' ? {} : { __MINIGAME_STD_MINA__: false }),
    },
    build: {
        target: 'esnext',
        minify: false,
        sourcemap: true,
        outDir: 'dist',
        lib: {
            entry: 'src/mod.ts',
            fileName: format => `main.${ format === 'esm' ? 'mjs' : 'cjs' }`,
        },
        rollupOptions: {
            output: [
                {
                    format: 'cjs',
                },
                {
                    format: 'esm',
                },
            ],
            external: [
                /^@std\/path/,
                'happy-rusty',
                'happy-opfs',
                '@happy-ts/fetch-t',
                'tiny-future',
                /^fflate\//,
                'rsa-oaep-encryption',
            ],
            treeshake: 'smallest',
        },
    },
    test: {
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
        },
        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: [
                // Mina files that use wx API (cannot be tested in browser)
                'src/std/clipboard/mina_clipboard.ts',
                'src/std/crypto/random/mina_random.ts',
                'src/std/event/mina_event.ts',
                'src/std/fetch/mina_fetch.ts',
                'src/std/fs/fs_async.ts',
                'src/std/fs/fs_sync.ts',
                'src/std/fs/mina_fs_async.ts',
                'src/std/fs/mina_fs_shared.ts',
                'src/std/fs/mina_fs_sync.ts',
                'src/std/image/mina_image.ts',
                'src/std/lbs/mina_lbs.ts',
                'src/std/network/mina_network.ts',
                'src/std/platform/device.ts',
                'src/std/socket/mina_socket.ts',
                'src/std/storage/mina_storage.ts',
                // Note: base64.ts, hmac.ts, sha.ts (pure JS implementations)
                // use rsa-oaep-encryption library and CAN be tested in browser
            ],
        },
        // Test configuration
        include: ['**/*.test.ts'],
        globals: true,
        testTimeout: 30000,
        hookTimeout: 30000,
        sequence: {
            concurrent: false,
        },
        // Retry failed tests in CI
        retry: process.env['CI'] ? 2 : 0,
    },
}));