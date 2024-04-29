import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const input = 'src/mod.ts';
const external = [
    /^@std\/path/,
    '@happy-js/happy-rusty',
    '@happy-js/happy-opfs',
    '@happy-ts/fetch-t',
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
                define: {
                    // __MINIGAME_STD_MINA__: `false`,
                },
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
        // treeshake: {
        //     moduleSideEffects: 'no-external',
        // },
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
    },
];