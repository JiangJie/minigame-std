import { defineConfig } from 'vite-plus';

// Workspace-wide lint/format defaults. Vite+ does not support nested lint/fmt
// config, so package-level vite.config.ts files only carry test/pack/build.
export default defineConfig({
    lint: {
        plugins: ['typescript', 'oxc', 'eslint', 'import', 'unicorn', 'vitest'],
        // game.js is the WeChat harness entry (host-global shims plus a side-effect
        // require of the bundle), not library source; the host-shim style trips rules
        // that assume normal module code. Also ignored by the formatter below.
        ignorePatterns: ['coverage', 'dist', 'docs', 'packages/minigame-test/game.js'],
        options: {
            typeAware: true,
            typeCheck: true,
            maxWarnings: 0,
            reportUnusedDisableDirectives: 'warn',
        },
        categories: {
            correctness: 'error',
            suspicious: 'warn',
        },
        rules: {
            // Tier 1 — proven catches and conventions the codebase relies on daily:
            // constant conditions, redundant Promise.resolve in async fns, global
            // parseInt/isNaN, explicit `.ts` import extensions, no non-null assertions,
            // unused vars outside the `_` escape hatch.
            'unicorn/no-useless-promise-resolve-reject': 'error',
            'unicorn/prefer-number-properties': 'error',
            'import/extensions': ['error', 'always', { ignorePackages: true }],
            'typescript/no-non-null-assertion': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

            // Tier 2 — fuses: an expensive accident is prevented for zero ongoing cost.
            // In this library that means `??` vs `||` on Result values, unhandled
            // switch arms, import cycles, floating promises, weakened public d.ts.
            'typescript/prefer-nullish-coalescing': 'error',
            'typescript/switch-exhaustiveness-check': 'error',
            'typescript/no-misused-promises': 'error',
            'typescript/ban-ts-comment': 'error',
            'typescript/no-explicit-any': 'error',
            'import/no-cycle': 'error',
            'import/no-self-import': 'error',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-cond-assign': ['error', 'always'],
            radix: 'error',

            // Tier 3 — review automation: patterns rare in hand-written code but
            // common in generated output; they cost nothing while unhit.
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'default-case-last': 'error',
            'no-new-wrappers': 'error',
            'prefer-template': 'error',
            'object-shorthand': 'error',
            'symbol-description': 'error',
            'logical-assignment-operators': 'error',
            'no-implicit-coercion': 'error',
            'typescript/array-type': 'error',
            'typescript/prefer-includes': 'error',
            'import/no-duplicates': 'error',
            'unicorn/no-instanceof-array': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',
            'unicorn/throw-new-error': 'error',
            'vitest/no-disabled-tests': 'warn',
            'vitest/no-identical-title': 'error',

            // Enabled on top of the category defaults (near-zero cost today):
            // - `consistent-function-scoping` is relaxed for tests only (see overrides);
            // - empty bodies stay acceptable for arrows and function declarations, not for
            //   methods or classes;
            // - `__MINIGAME_STD_MINA__` is a consumer-facing macro name.
            'unicorn/consistent-function-scoping': 'error',
            'no-shadow': 'error',
            'no-empty-function': ['error', { allow: ['arrowFunctions', 'functions'] }],
            'no-underscore-dangle': ['error', { allow: ['__MINIGAME_STD_MINA__'] }],

            // Off — these rules fight the platform-bridge style this library is built on.
            // wx typings are looser than the runtime, so API presence probes
            // (`wx.getDeviceInfo ? … : wx.getSystemInfoSync()`) keep older base libraries
            // working, and assertions narrow loose typings to runtime reality.
            'typescript/no-unsafe-type-assertion': 'off',
            'typescript/no-unnecessary-condition': 'off',
            // wx API methods are captured unbound and invoked by the platform with its own
            // receiver (`asyncResultify(wx.setStorage)`).
            'typescript/unbound-method': 'off',
            // The video/audio wrappers expose DOM-style `onX` properties on purpose, and the
            // mini-game side has no `addEventListener` at all.
            'unicorn/prefer-add-event-listener': 'off',
        },
        overrides: [
            {
                files: ['**/*.test.ts'],
                rules: {
                    // Deliberate patterns in tests, each verified to be load-bearing: dropping
                    // any of them re-introduces diagnostics.
                    // Unawaited promises in race tests, `expect` inside conditionals, and
                    // tests whose only assertion lives in a helper.
                    'typescript/no-floating-promises': 'off',
                    'vitest/no-conditional-expect': 'off',
                    'vitest/expect-expect': 'off',
                    // Non-null assertions on unwrapped Results, and throw-assertions without a
                    // message, are idiomatic here.
                    'typescript/no-non-null-assertion': 'off',
                    'vitest/require-to-throw-message': 'off',
                    // Mocks are built with inferred type parameters throughout the suite.
                    'vitest/require-mock-type-parameters': 'off',
                    // Tests spread platform objects and use `||` on fixture values on purpose.
                    'typescript/no-misused-spread': 'off',
                    'typescript/prefer-nullish-coalescing': 'off',
                    // Per-`test` mock helpers are idiomatic here: hoisting them to module scope
                    // would separate each test from the doubles it uses.
                    'unicorn/consistent-function-scoping': 'off',
                },
            },
        ],
    },
    fmt: {
        printWidth: 100,
        tabWidth: 4,
        singleQuote: true,
        arrowParens: 'avoid',
        semi: true,
        trailingComma: 'all',
        sortPackageJson: false,
        ignorePatterns: [
            'coverage',
            'dist',
            'docs',
            'pnpm-lock.yaml',
            'packages/minigame-test/game.js',
        ],
        overrides: [
            {
                files: ['**/*.json', '**/*.jsonc', '**/*.yaml', '**/*.yml'],
                options: {
                    tabWidth: 2,
                },
            },
            {
                files: ['**/*.md'],
                options: {
                    tabWidth: 2,
                    embeddedLanguageFormatting: 'off',
                },
            },
        ],
    },
});
