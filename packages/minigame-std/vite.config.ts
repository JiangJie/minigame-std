import { resolve } from 'node:path';

import { playwright } from 'vite-plus/test/browser-playwright';
import { defineConfig } from 'vite-plus';

import type { PackUserConfig } from 'vite-plus/pack';

import { PUBLIC_ENTRIES } from './build_entries.ts';

// #region Pack entries

interface EntryConfig {
    name: string;
    file: string;
}

// Internal shared entry, NOT declared in package.json exports.
// Externalized so all subpath entries reference the single `./_internal.mjs`
// instead of inlining a duplicate copy of the internal helpers (~4.3KB each).
// Subpaths reach it via a relative path, which bypasses package.json `exports`.
//
// IMPORTANT: `_env` (src/macros/env.ts, the IS_MINA macro) is intentionally NOT
// externalized. Externalizing `_env` turns IS_MINA into an external binding that
// cannot be constant-folded inside each entry, which breaks DCE and retains the
// entire happy-rusty module as dead code downstream. IS_MINA MUST stay inlined.
const internalEntry: EntryConfig = { name: '_internal', file: 'src/std/internal/mod.ts' };

const allEntries: readonly EntryConfig[] = [internalEntry, ...PUBLIC_ENTRIES];

// vp pack runs from the package root; the config file itself is bundled into a
// temp location by the config loader, so import.meta paths are unreliable here.
const rootDir = process.cwd();

const entryTargets = new Map<string, string>(
    allEntries.map(({ name, file }): [string, string] => [resolve(rootDir, file), name]),
);

const internalDirPrefix = `${resolve(rootDir, 'src/std/internal')}/`;

// Map a resolved module id to the entry name it must be externalized to.
function resolveEntryTarget(id: string): string | undefined {
    const normalized = id.split(/[?#]/, 1)[0] ?? id;

    const target = entryTargets.get(normalized);
    if (target !== undefined) return target;

    // Any file under std/internal/ maps to the shared `_internal` entry,
    // covering direct imports that bypass internal/mod.ts.
    if (normalized.startsWith(internalDirPrefix)) return '_internal';

    return undefined;
}

const sharedPackConfig = {
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    target: 'esnext',
    platform: 'browser',
    fixedExtension: true,
    hash: false,
    treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
    },
} satisfies PackUserConfig;

// Cross-entry references are externalized and rewritten to sibling files, so no
// code is duplicated between entries. `topLevelVar: false` keeps `const`
// declarations, which is what makes the `/*#__PURE__*/` annotations effective for
// downstream bundlers.
function createEntryPackConfig(entry: EntryConfig): PackUserConfig {
    return {
        entry: { [entry.name]: entry.file },
        deps: {
            neverBundle: (id: string) => {
                const target = resolveEntryTarget(id);
                return target !== undefined && target !== entry.name;
            },
        },
        outputOptions: (options, format) => ({
            ...options,
            topLevelVar: false,
            paths: (id: string) => {
                const target = resolveEntryTarget(id);
                if (target === undefined || target === entry.name) return id;

                return `./${target}.${format === 'es' ? 'mjs' : 'cjs'}`;
            },
        }),
    };
}

// #endregion

export default defineConfig(({ command }) => ({
    // Let `__MINIGAME_STD_MINA__` stay unresolved during pack time so consumers
    // define it as a boolean literal and the other platform's code is eliminated.
    // Tests set it to `false` to exercise the web code paths by default;
    // mina-specific tests mock wx APIs directly.
    define: command === 'build' ? {} : { __MINIGAME_STD_MINA__: false },
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
    pack: [
        // The first config cleans dist/ so the rest build incrementally on top;
        // tsdown builds array configs sequentially in declaration order.
        // `_internal` ships no public types, so its dts pass is skipped.
        {
            ...sharedPackConfig,
            entry: { _internal: internalEntry.file },
            clean: true,
            dts: false,
        },
        ...PUBLIC_ENTRIES.map(entry => ({
            ...sharedPackConfig,
            clean: false,
            ...createEntryPackConfig(entry),
        })),
    ],
}));
