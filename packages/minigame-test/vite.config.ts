import { defineConfig } from 'vite';

export default defineConfig({
    define: {
        __MINIGAME_STD_MINA__: 'true',
    },
    resolve: {
        conditions: ['source'],
    },
    build: {
        target: 'es2019',
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
