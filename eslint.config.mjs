import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    {
        rules: {
            '@typescript-eslint/no-invalid-void-type': 'off',
        },
    },
);