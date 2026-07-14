import { defineConfig } from 'vitest/config';

/**
 * Separate vitest config for non-DOM tests (Node environment).
 * The main config uses Playwright browser mode where document/location
 * are non-configurable and cannot be stubbed. This config runs selected
 * tests in Node.js where document/location are genuinely absent.
 */
export default defineConfig({
    define: {
        __MINIGAME_STD_MINA__: false,
    },
    test: {
        environment: 'node',
        include: ['tests/event-non-dom.test.ts'],
    },
});
