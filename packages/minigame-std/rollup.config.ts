import type { RollupOptions } from 'rollup';
import { dts } from 'rollup-plugin-dts';

import { PUBLIC_ENTRIES } from './build_entries.ts';

// One `.d.ts` per public entry, with cross-entry references pointing at
// `./[name].js` (resolved by TS to the sibling `.d.ts`) instead of being
// extracted into shared `mod-xxx.d.ts` chunks.
//
// Unlike build.ts there is no `_internal` entry: internal helpers are values,
// not public types, so their type signatures are inlined where used and never
// surface as a separate declaration file.
const sourceToName = new Map<string, string>();
for (const { name, file } of PUBLIC_ENTRIES) {
    sourceToName.set(file, name);
}

// Resolve an import id to an entry name if it points at another entry's source.
function resolveEntry(id: string): string | undefined {
    const normalized = id.replace(/\\/g, '/');

    for (const [src, name] of sourceToName) {
        if (normalized.endsWith(src) || normalized.endsWith(src.replace(/\.ts$/, ''))) {
            return name;
        }
    }

    return undefined;
}

// One rollup pass per entry so each declaration file is self-contained except
// for cross-entry references, which are externalized and rewritten to `./[name].js`.
const config: RollupOptions[] = PUBLIC_ENTRIES.map(({ name, file }): RollupOptions => ({
    input: { [name]: file },
    plugins: [
        dts(),
    ],
    external: (id: string): boolean => {
        const target = resolveEntry(id);
        return target !== undefined && target !== name;
    },
    output: {
        dir: 'dist/types',
        format: 'esm',
        sourcemap: false,
        entryFileNames: '[name].d.ts',
        paths: (id: string): string => {
            const target = resolveEntry(id);
            if (target && target !== name) {
                return `./${target}.js`;
            }
            return id;
        },
    },
    treeshake: 'smallest',
}));

export default config;
