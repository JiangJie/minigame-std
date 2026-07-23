import { rm } from 'node:fs/promises';
import { build } from 'vite';

import { PUBLIC_ENTRIES, type EntryConfig } from './build_entries.ts';

//#region Entry definitions

// Internal shared entry, NOT declared in package.json exports.
// Externalized so all subpath entries reference the single `./_internal.mjs`
// instead of inlining a duplicate copy of the internal helpers (~4.3KB each).
// Subpaths reference it via a relative path (`./_internal.mjs`), which bypasses
// package.json `exports` resolution — no subpath declaration needed.
//
// IMPORTANT: `_env` (src/macros/env.ts, the IS_MINA macro) is intentionally NOT
// externalized. Externalizing `_env` turns IS_MINA into an external binding that
// rolldown cannot constant-fold within each subpath module, which breaks DCE of
// inlined internal dead code and causes the entire happy-rusty module (~713 lines)
// to be retained as dead code downstream. IS_MINA MUST stay inlined as `const false`.
const internalEntries: EntryConfig[] = [
    { name: '_internal', file: 'src/std/internal/mod.ts' },
];

const entries: readonly EntryConfig[] = [...internalEntries, ...PUBLIC_ENTRIES];

//#endregion

//#region Internal entry resolution

const sourceToName = new Map<string, string>();
for (const { name, file } of entries) {
    sourceToName.set(file, name);
}

// Resolve an import id to an entry name so cross-entry references can be externalized.
function resolveInternalEntry(id: string): string | undefined {
    const normalized = id.replace(/\\/g, '/');

    // Exact match for entry source files (including .ts and extensionless)
    for (const [src, name] of sourceToName) {
        if (normalized.endsWith(src) || normalized.endsWith(src.replace(/\.ts$/, ''))) {
            return name;
        }
    }

    // Any file under std/internal/ maps to the shared `_internal` entry,
    // covering direct imports of helpers.ts/validations.ts that bypass internal/mod.ts.
    if (normalized.includes('/std/internal/')) {
        return '_internal';
    }

    return undefined;
}

//#endregion

//#region External dependencies

const externalDeps = [
    'happy-codec',
    'happy-rusty',
    'happy-opfs',
    '@happy-ts/fetch-t',
    'tiny-future',
    /^fflate\//,
    'rsa-oaep-encryption',
];

function isExternalDep(id: string): boolean {
    return externalDeps.some(dep => {
        if (dep instanceof RegExp) {
            return dep.test(id);
        }
        return id === dep || id.startsWith(`${dep}/`);
    });
}

//#endregion

// Clean dist directory before build
await rm('dist', { recursive: true, force: true });

// Build each entry independently.
// Cross-module references between entries are externalized via `external` + `output.paths`:
// - Subpath entries reference each other: fs.mjs imports from './path.mjs'.
// - Subpath entries reference the shared internal helpers: fs.mjs imports from './_internal.mjs'.
// This eliminates duplicated code across entries while preserving tree-shaking
// (verified equivalent to full-inline: md5/codec/path → 0 lines of happy-rusty,
// fs → live usage only). `_env` is inlined into every entry (see note above).
for (const { name, file } of entries) {
    await build({
        root: process.cwd(),
        configFile: false,
        logLevel: 'warn',
        define: {},
        build: {
            target: 'esnext',
            minify: false,
            sourcemap: true,
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
                entry: file,
                fileName: format => `${name}.${format === 'cjs' ? 'cjs' : 'mjs'}`,
            },
            rollupOptions: {
                external: (id) => {
                    // External npm deps
                    if (isExternalDep(id)) return true;
                    // Cross-module references to other entries (including internal shared)
                    const target = resolveInternalEntry(id);
                    if (target && target !== name) {
                        return true;
                    }
                    return false;
                },
                output: [
                    {
                        format: 'cjs',
                        topLevelVar: false,
                        paths: (id) => {
                            const target = resolveInternalEntry(id);
                            if (target && target !== name) {
                                return `./${target}.cjs`;
                            }
                            return id;
                        },
                    },
                    {
                        format: 'esm',
                        topLevelVar: false,
                        paths: (id) => {
                            const target = resolveInternalEntry(id);
                            if (target && target !== name) {
                                return `./${target}.mjs`;
                            }
                            return id;
                        },
                    },
                ],
                treeshake: {
                    moduleSideEffects: false,
                    propertyReadSideEffects: false,
                },
            },
        },
    });
    console.log(`✓ built ${name}`);
}

console.log(`\n✓ All ${entries.length} entries built successfully`);
