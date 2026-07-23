import { rm } from 'node:fs/promises';
import { build } from 'vite';

import { PUBLIC_ENTRIES, type EntryConfig } from './build_entries.ts';

//#region Terminal colors

// Only this script's own status lines are colored; vite/rolldown has its own
// TTY-aware logger for warnings/errors. Plain output when piped or NO_COLOR set.
const useColor = process.stdout.isTTY === true && process.env['NO_COLOR'] === undefined;

function colorize(code: number, s: string): string {
    return useColor ? `\u001b[${code}m${s}\u001b[0m` : s;
}

const bold = (s: string): string => colorize(1, s);
const dim = (s: string): string => colorize(2, s);
const green = (s: string): string => colorize(32, s);

//#endregion

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

    // Exact match for entry source files.
    // Rolldown may pass the id in different forms:
    //   'src/std/codec/mod.ts'  — resolved path with src/ prefix
    //   './std/codec/mod.ts'    — relative path without src/ prefix (CJS export * from)
    // Both must match. For entries with a path prefix (e.g. 'std/codec/mod.ts'),
    // check endsWith('/std/codec/mod.ts'). For top-level entries (e.g. 'mod.ts'),
    // only match exact relative forms to avoid false positives on other mod.ts files.
    for (const [src, name] of sourceToName) {
        const withoutSrcPrefix = src.startsWith('src/') ? src.slice(4) : src;
        const withoutExt = withoutSrcPrefix.replace(/\.ts$/, '');

        if (
            normalized.endsWith(src)
            || normalized.endsWith(src.replace(/\.ts$/, ''))
        ) {
            return name;
        }

        if (withoutSrcPrefix.includes('/')) {
            // Subpath entry: e.g. 'std/codec/mod.ts' → match './std/codec/mod.ts'
            if (
                normalized.endsWith(`/${withoutSrcPrefix}`)
                || normalized.endsWith(`/${withoutExt}`)
            ) {
                return name;
            }
        }
        else {
            // Top-level entry: e.g. 'mod.ts' → only match exact './mod.ts' or 'mod.ts'
            if (
                normalized === `./${withoutSrcPrefix}`
                || normalized === withoutSrcPrefix
                || normalized === `./${withoutExt}`
                || normalized === withoutExt
            ) {
                return name;
            }
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

//#region CJS export-star path fixup

// Rolldown's CJS `export *` implementation generates `require("./std/codec/mod.ts")`
// using the original source path instead of the `output.paths` return value.
// ESM `export *` correctly uses `output.paths`, but CJS does not.
// This plugin post-processes CJS chunks to replace source paths with entry paths.
// See: https://github.com/rolldown/rolldown/issues/10402 — remove this plugin once fixed
const cjsExportStarFixup = {
    name: 'cjs-export-star-path-fixup',
    renderChunk(code: string, chunk: { fileName: string; }): { code: string; map: null; } | null {
        if (!chunk.fileName.endsWith('.cjs')) return null;

        // Build replacement map: ./std/codec/mod.ts → ./codec.cjs
        let fixed = code;
        for (const [src, entryName] of sourceToName) {
            const withoutSrcPrefix = src.startsWith('src/') ? src.slice(4) : src;
            if (!withoutSrcPrefix.includes('/')) continue;

            // Match require("./std/codec/mod.ts") or require('./std/codec/mod.ts')
            const sourcePath = `./${withoutSrcPrefix}`;
            const targetPath = `./${entryName}.cjs`;
            fixed = fixed.replaceAll(`require("${sourcePath}")`, `require("${targetPath}")`);
            fixed = fixed.replaceAll(`require('${sourcePath}')`, `require('${targetPath}')`);
        }

        // No replacement applied — leave the chunk untouched.
        if (fixed === code) return null;

        // `map: null` suppresses SOURCEMAP_BROKEN: a bare string return tells
        // rolldown the transform has no map. Replacements only shrink content
        // within a line (no lines added/removed), so line mappings stay valid.
        return { code: fixed, map: null };
    },
};

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
                plugins: [cjsExportStarFixup],
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
    console.log(dim(`✓ built ${name}`));
}

console.log(green(bold(`\n✓ All ${entries.length} entries built successfully`)));
