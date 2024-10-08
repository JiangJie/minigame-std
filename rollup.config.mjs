import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const input = 'src/mod.ts';

/**
 * @type {import('rollup').ExternalOption}
 */
const external = [
    /^@std\/path/,
    'happy-rusty',
    'happy-opfs',
    '@happy-ts/fetch-t',
    'tiny-invariant',
    'tiny-future',
    'fflate/browser',
    'rsa-oaep-encryption',
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
    {
        input,
        plugins: [
            esbuild({
                target: 'esnext',
            }),
        ],
        output: [
            {
                file: 'dist/main.cjs',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/main.mjs',
                format: 'esm',
                sourcemap: true,
            },
        ],
        external,
        treeshake: 'smallest',
    },
    {
        input,
        plugins: [
            dts(),
        ],
        output: {
            file: 'dist/types.d.ts',
            format: 'esm',
            sourcemap: true,
        },
        external,
        treeshake: 'smallest',
    },
];