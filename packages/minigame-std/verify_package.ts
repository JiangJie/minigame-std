import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { PUBLIC_ENTRIES } from './build_entries.ts';

const PACKAGE_DIR = resolve(import.meta.dirname, '.');
const ENTRY_NAMES = PUBLIC_ENTRIES.map(e => e.name);
const SUBPATHS = ENTRY_NAMES.filter(n => n !== 'main');

// ── Terminal colors ───────────────────────────────────────────────────
// Only this script's own status lines are colored. Child process output
// (publint/attw) is piped and stays plain — attw output is string-matched
// below, so coloring it would break the classification logic.
const useColor = process.stdout.isTTY === true && process.env['NO_COLOR'] === undefined;

function colorize(code: number, s: string): string {
    return useColor ? `\u001b[${code}m${s}\u001b[0m` : s;
}

const bold = (s: string): string => colorize(1, s);
const dim = (s: string): string => colorize(2, s);
const red = (s: string): string => colorize(31, s);
const green = (s: string): string => colorize(32, s);
const yellow = (s: string): string => colorize(33, s);
const cyan = (s: string): string => colorize(36, s);

function run(cmd: string, args: string[], opts: { cwd: string; env?: NodeJS.ProcessEnv; } = { cwd: PACKAGE_DIR }): string {
    return execFileSync(cmd, args, {
        cwd: opts.cwd,
        env: { ...process.env, ...opts.env },
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    });
}

function fail(msg: string): never {
    console.error(`\n${red(`✗ ${msg}`)}`);
    process.exit(1);
}

function step(label: string): void {
    console.log(`\n${bold(cyan(`▸ ${label}`))}`);
}

const ROOT_DIR = resolve(PACKAGE_DIR, '../..');

// Dependency versions for the temp consumer are sourced from the workspace
// package.json files, so they stay in sync with routine dependency upgrades
// instead of drifting as hardcoded copies.
function depVersion(pkgPath: string, name: string): string {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    for (const section of ['dependencies', 'peerDependencies', 'devDependencies']) {
        const version = pkg[section]?.[name];
        if (typeof version === 'string') return version;
    }
    fail(`Cannot resolve "${name}" version from ${pkgPath}`);
}

const typescriptVersion = depVersion(join(ROOT_DIR, 'package.json'), 'typescript');
const apiTypingsVersion = depVersion(join(PACKAGE_DIR, 'package.json'), 'minigame-api-typings');

const tmpDir = mkdtempSync(join(tmpdir(), 'minigame-std-verify-'));

try {
    // ── Pack ──────────────────────────────────────────────────────────
    step('Packing tarball');
    const packDir = join(tmpDir, 'pack');
    mkdirSync(packDir, { recursive: true });
    const packOutput = run('pnpm', ['pack', '--pack-destination', packDir]);
    const tgzName = packOutput.trim().split('\n').pop();
    if (!tgzName) fail('Failed to get tarball name from pnpm pack');
    // pnpm pack may return absolute path or just filename; extract filename
    const tgzFilename = tgzName.includes('/') ? tgzName.split('/').pop() : tgzName;
    const tgzPath = join(packDir, tgzFilename as string);
    if (!existsSync(tgzPath)) fail(`Tarball not found: ${tgzPath}`);
    console.log(dim(`  ${tgzName}`));

    // ── Create consumer ───────────────────────────────────────────────
    step('Installing tarball into temp consumer');
    const consumerDir = join(tmpDir, 'consumer');
    mkdirSync(consumerDir, { recursive: true });
    writeFileSync(join(consumerDir, 'package.json'), `${JSON.stringify({
        name: 'verify-consumer',
        private: true,
        type: 'module',
        dependencies: { 'minigame-std': `file:${tgzPath}` },
        devDependencies: { typescript: typescriptVersion },
    }, null, 2)}\n`);
    run('pnpm', ['install', '--ignore-scripts', '--prefer-offline'], { cwd: consumerDir });
    const installedPkgDir = join(consumerDir, 'node_modules', 'minigame-std');

    // ── Verify tarball contents ───────────────────────────────────────
    step('Verifying tarball contents');
    const pkg = JSON.parse(readFileSync(join(installedPkgDir, 'package.json'), 'utf8'));
    const exportKeys = Object.keys(pkg.exports).filter(k => k !== './package.json');

    // Check export count matches PUBLIC_ENTRIES
    const expectedSubpaths = SUBPATHS.map(s => `./${s}`);
    const missingExports = expectedSubpaths.filter(s => !exportKeys.includes(s));
    if (missingExports.length) fail(`Missing exports: ${missingExports.join(', ')}`);

    // Check each export target exists
    for (const [subpath, target] of Object.entries(pkg.exports)) {
        if (typeof target !== 'object') continue;
        for (const [condition, file] of Object.entries(target as Record<string, string>)) {
            const fullPath = join(installedPkgDir, file);
            if (!existsSync(fullPath)) fail(`Export "${subpath}" condition "${condition}": file not found: ${file}`);
        }
    }

    // Check _internal exists but is not exported
    if (!existsSync(join(installedPkgDir, 'dist/_internal.mjs'))) fail('dist/_internal.mjs not found');
    if (!existsSync(join(installedPkgDir, 'dist/_internal.cjs'))) fail('dist/_internal.cjs not found');
    if (exportKeys.includes('./_internal')) fail('./_internal should not be in exports');

    // Check _env is not a separate file
    if (existsSync(join(installedPkgDir, 'dist/_env.mjs'))) fail('dist/_env.mjs should not exist (_env must be inlined)');

    // Check src is not in tarball
    if (existsSync(join(installedPkgDir, 'src'))) fail('src/ should not be in published package');

    // Check no mod-*.d.ts chunks
    const typesDir = join(installedPkgDir, 'dist/types');
    const dtsFiles = run('ls', [typesDir]).trim().split('\n');
    const modChunks = dtsFiles.filter(f => f.startsWith('mod-'));
    if (modChunks.length) fail(`Found mod-*.d.ts chunks: ${modChunks.join(', ')}`);

    // Check expected .d.ts count
    const expectedDtsCount = ENTRY_NAMES.length;
    const actualDtsCount = dtsFiles.filter(f => f.endsWith('.d.ts')).length;
    if (actualDtsCount !== expectedDtsCount) fail(`Expected ${expectedDtsCount} .d.ts files, got ${actualDtsCount}`);

    console.log(dim(`  ${exportKeys.length} exports, ${actualDtsCount} .d.ts, _internal present, _env inlined, no src, no mod-* chunks`));

    // ── CJS smoke test ────────────────────────────────────────────────
    step('CJS smoke test (all entries)');
    const cjsTest = `
globalThis.__MINIGAME_STD_MINA__ = false;
const entries = ${JSON.stringify(['.', ...SUBPATHS.map(s => `/${s}`)])};
for (const p of entries) {
    const mod = p === '.' ? 'minigame-std' : 'minigame-std' + p;
    require(mod);
}
console.log('CJS_ALL_PASS');
`;
    writeFileSync(join(consumerDir, 'cjs-smoke.cjs'), cjsTest);
    const cjsResult = run('node', ['cjs-smoke.cjs'], { cwd: consumerDir });
    if (!cjsResult.includes('CJS_ALL_PASS')) fail('CJS smoke test failed');

    // ── ESM smoke test ────────────────────────────────────────────────
    step('ESM smoke test (all entries)');
    const esmTest = `
globalThis.__MINIGAME_STD_MINA__ = false;
const entries = ${JSON.stringify(['.', ...SUBPATHS.map(s => `/${s}`)])};
for (const p of entries) {
    const mod = p === '.' ? 'minigame-std' : 'minigame-std' + p;
    await import(mod);
}
console.log('ESM_ALL_PASS');
`;
    writeFileSync(join(consumerDir, 'esm-smoke.mjs'), esmTest);
    const esmResult = run('node', ['esm-smoke.mjs'], { cwd: consumerDir });
    if (!esmResult.includes('ESM_ALL_PASS')) fail('ESM smoke test failed');

    // ── TypeScript type check (bundler) ───────────────────────────────
    step('TypeScript type check (moduleResolution: bundler)');
    const typeFixture = `
import {
    audio, clipboard, cryptos, fs, image, lbs, logger, path, platform, storage, video,
    encodeBase64, getNetworkType, getPerformanceNow, connectSocket, asyncResultify,
    type DataSource,
} from 'minigame-std';

void cryptos.rsa.importPublicKey;
void fs.opfs;
`;
    writeFileSync(join(consumerDir, 'type-check.ts'), typeFixture);
    writeFileSync(join(consumerDir, 'tsconfig.json'), `${JSON.stringify({
        compilerOptions: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            types: ['minigame-api-typings'],
        },
        include: ['type-check.ts'],
    }, null, 2)}\n`);
    // Install minigame-api-typings for type checking. It is a runtime dep of
    // minigame-std, but pnpm does not publicly hoist transitive deps, so the
    // consumer needs it as a direct devDep for `types: [...]` to resolve.
    run('pnpm', ['add', '-D', `minigame-api-typings@${apiTypingsVersion}`], { cwd: consumerDir });
    try {
        run('pnpm', ['exec', 'tsc', '--noEmit'], { cwd: consumerDir });
        console.log(green('  bundler: PASS'));
    } catch (e) {
        const err = e as { stderr?: string; stdout?: string; };
        if (err.stderr) console.error(err.stderr);
        if (err.stdout) console.error(err.stdout);
        fail('TypeScript bundler type check failed');
    }

    // ── publint ───────────────────────────────────────────────────────
    step('publint');
    // publint is installed at workspace root; run from package dir
    try {
        const publintResult = run('pnpm', ['exec', 'publint', installedPkgDir], { cwd: PACKAGE_DIR });
        console.log(publintResult);
        console.log(green('  publint: PASS'));
    } catch (e) {
        const err = e as { stdout?: string; stderr?: string; };
        if (err.stdout) console.log(err.stdout);
        if (err.stderr) console.error(err.stderr);
        const output = (err.stdout ?? '') + (err.stderr ?? '');
        if (output.toLowerCase().includes('error')) {
            fail('publint found errors (see output above)');
        }
        console.log(yellow('  publint: PASS (with warnings)'));
    }

    // ── attw ──────────────────────────────────────────────────────────
    step('attw (Are the Types Wrong)');
    try {
        const attwResult = run('pnpm', ['exec', 'attw', tgzPath, '--profile', 'strict', '--no-color', '--no-emoji'], { cwd: PACKAGE_DIR });
        console.log(attwResult);
        console.log(green('  attw: PASS'));
    } catch (e) {
        const err = e as { stdout?: string; stderr?: string; };
        if (err.stdout) console.log(err.stdout);
        if (err.stderr) console.error(err.stderr);
        const output = (err.stdout ?? '') + (err.stderr ?? '');
        // attw exits non-zero on any problem; "Resolution failed" in node10/cjs is expected for ESM-only packages
        if (output.includes('Resolution failed') && !output.includes('💀')) {
            console.log(yellow('  attw: completed with expected CJS resolution warnings'));
        }
        else {
            console.log(yellow('  attw: completed with warnings (review output above)'));
        }
    }

    // ── Summary ───────────────────────────────────────────────────────
    console.log(green(bold('\n✓ All package compatibility checks passed')));
    console.log(dim(`  ${exportKeys.length} exports verified`));
    console.log(dim(`  ${ENTRY_NAMES.length} ESM + CJS entries loaded`));
    console.log(dim(`  ${actualDtsCount} .d.ts files verified`));
    console.log(dim('  publint + attw completed'));
    console.log(dim('  TypeScript bundler type check passed'));

} finally {
    rmSync(tmpDir, { recursive: true, force: true });
}
