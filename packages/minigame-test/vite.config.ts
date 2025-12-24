import { defineConfig } from 'vite';

export default defineConfig({
    define: {
        // 'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.NODE_ENV': JSON.stringify('development'),
        __MINIGAME_STD_MINA__: 'true',
    },
    build: {
        target: 'esnext',
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: () => 'index.js',
        },
        outDir: 'dist',
        minify: false,
        rollupOptions: {
            output: {
                // 保持单文件输出
                inlineDynamicImports: true,
            },
            treeshake: {
                unknownGlobalSideEffects: false,
                propertyReadSideEffects: false,
            },
        },
    },
});
