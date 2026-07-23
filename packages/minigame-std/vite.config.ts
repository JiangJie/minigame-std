import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Note: Build configuration lives in `build.ts` (multi-entry bundles with shared internal modules).
// This config is used only for testing.
export default defineConfig(({ command }) => ({
    define: {
        // Set to `false` during test to use web code paths by default
        // Mina-specific tests should mock wx APIs directly
        // Let `__MINIGAME_STD_MINA__` be `unknown` during build time
        ...(command === 'build' ? {} : { __MINIGAME_STD_MINA__: false }),
    },
    test: {
        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: [
                // Mina files that use wx API (cannot be tested in browser)
                // Others can be tested by mocking wx APIs
                'src/std/fs/fs_async.ts',
                'src/std/fs/fs_sync.ts',
                'src/std/fs/mina_fs_async.ts',
                'src/std/fs/mina_fs_sync.ts',
            ],
        },
        globals: true,
        testTimeout: 30000,
        hookTimeout: 30000,
        sequence: {
            concurrent: false,
        },
        // Retry failed tests in CI
        retry: process.env['CI'] ? 2 : 0,
        projects: [
            {
                define: { __MINIGAME_STD_MINA__: false },
                test: {
                    name: 'browser',
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                        headless: true,
                    },
                    include: ['**/*.test.ts'],
                    exclude: ['tests/event-non-dom.test.ts'],
                },
            },
            {
                define: { __MINIGAME_STD_MINA__: false },
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['tests/event-non-dom.test.ts'],
                },
            },
        ],
    },
}));
