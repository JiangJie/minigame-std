import { defineConfig } from 'vite-plus';

// Workspace-wide lint/format defaults. Vite+ does not support nested lint/fmt
// config, so package-level vite.config.ts files only carry test/pack/build.
export default defineConfig({
    lint: {
        plugins: ['typescript', 'oxc', 'eslint', 'import', 'unicorn', 'vitest'],
        ignorePatterns: ['coverage', 'dist', 'docs'],
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

            // Off — the rule fights this library's platform-bridge design.
            // Platform shims wrap foreign APIs and legitimately stringify unknown values.
            'typescript/no-base-to-string': 'off',
            // `_env` and the mini-game shims assert on globals that only exist at runtime,
            // and wx typings are looser than the runtime contract, so these type-shape
            // rules flag bridging points that must stay in place:
            // wx API presence probes (`wx.getDeviceInfo ? … : wx.getSystemInfoSync()`) keep
            // older base libraries working, assertions narrow typings to runtime reality.
            'typescript/no-unsafe-type-assertion': 'off',
            'typescript/no-unnecessary-type-assertion': 'off',
            'typescript/no-unnecessary-condition': 'off',
            'typescript/no-unnecessary-boolean-literal-compare': 'off',
            'typescript/restrict-template-expressions': 'off',
            // Phantom generics: explicit type arguments exist for call-site inference.
            'typescript/no-unnecessary-type-parameters': 'off',
            'typescript/no-unnecessary-type-arguments': 'off',
            // Returning `undefined` as "no error" is the established shape in the fs validators.
            'typescript/consistent-return': 'off',
            // wx API methods are captured unbound and invoked by the platform with its own
            // receiver (`asyncResultify(wx.setStorage)`).
            'typescript/unbound-method': 'off',
            // Mini-game side assigns `onX` handler properties; that is the platform idiom.
            'unicorn/prefer-add-event-listener': 'off',
            // `sort`/`toSorted` and local helper placement are readability choices here.
            'unicorn/no-array-sort': 'off',
            'unicorn/consistent-function-scoping': 'off',
            // `_internal` barrels re-export for side-effect-free aggregation.
            'import/no-unassigned-import': 'off',
            // `_env` module shape is a bare `declare const` by design.
            'typescript/no-extraneous-class': 'off',
            // `_`-prefixed names are the escape hatch for intentionally unused vars.
            'no-underscore-dangle': 'off',
            // Local closures shadowing outer names are idiomatic here.
            'no-shadow': 'off',
        },
        overrides: [
            {
                files: ['**/*.test.ts'],
                rules: {
                    'no-empty-function': ['error', { allow: ['arrowFunctions', 'functions'] }],
                    // Deliberate test patterns: unawaited promises in race tests, unbound
                    // method references passed to helpers, `expect` inside conditionals,
                    // `=== true`/`=== false` assertions on unwrapped Results.
                    'typescript/no-floating-promises': 'off',
                    'typescript/unbound-method': 'off',
                    'typescript/no-non-null-assertion': 'off',
                    'vitest/no-conditional-expect': 'off',
                    'vitest/expect-expect': 'off',
                    'vitest/require-mock-type-parameters': 'off',
                    'vitest/require-to-throw-message': 'off',
                    // Tests spread platform objects and use `||` on fixture values on purpose.
                    'typescript/no-misused-spread': 'off',
                    'typescript/prefer-nullish-coalescing': 'off',
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
        ignorePatterns: ['coverage', 'dist', 'docs', 'pnpm-lock.yaml'],
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
