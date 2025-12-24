import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores([
        '**/dist',
        '**/coverage',
        '**/node_modules',
    ]),
    {
        files: ['**/*.ts'],
        plugins: {
            '@stylistic': stylistic,
        },
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strict,
            tseslint.configs.stylistic,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@typescript-eslint/no-invalid-void-type': 'off',
            '@stylistic/member-delimiter-style': ['error', {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
            }],
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
        },
    },
    {
        files: [
            '**/*.test.ts',
            '**/examples/**/*.ts',
        ],
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-empty-function': ['error', {
                allow: ['arrowFunctions', 'functions'],
            }],
        },
    },
]);
