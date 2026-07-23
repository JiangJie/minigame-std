# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

**License**: MIT

This is a **monorepo** containing:

- **minigame-std** (`packages/minigame-std/`) - A cross-platform standard development library that provides unified APIs for both mini-game environments (WeChat, QQ, etc.) and web browsers
- **minigame-test** (`packages/minigame-test/`) - Mini-game platform tests for minigame-std

### Key Concept: Platform Abstraction

The core architecture uses a compile-time macro `__MINIGAME_STD_MINA__` to determine which platform code to include:
- When `true`: bundles mini-game (Mina) platform code, excludes web code
- When `false`: bundles web platform code, excludes mini-game code

This is defined in `packages/minigame-std/src/macros/env.ts` and used throughout the codebase via the `IS_MINA` constant.

## Development Commands

### Package Manager
This project uses **pnpm** as the package manager.

### Root-Level Commands (run from project root)

```bash
# Install dependencies
pnpm install

# Type checking for all packages (must pass before commits)
pnpm run check

# Linting (must pass before commits)
pnpm run lint

# Run all tests (uses Vitest + Playwright in browser)
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with UI
pnpm run test:ui

# Build all packages
pnpm run build

# Build only minigame-std
pnpm run build:std

# Build only minigame-test
pnpm run build:test

# Generate API documentation
pnpm run docs

# Install Playwright browser for first-time setup
pnpm run playwright:install
```

### Package-Specific Commands

```bash
# Run commands in a specific package
pnpm --filter minigame-std <command>
pnpm --filter minigame-test <command>

# Examples:
pnpm --filter minigame-std test
pnpm --filter minigame-std build
pnpm --filter minigame-std verify:package   # release gate: build + tarball consumer verification
```

### Testing Notes

- Tests run in **Vitest** with two projects (configured via `test.projects` in `packages/minigame-std/vite.config.ts`):
  - `browser`: **Playwright** provider (Chromium), runs all tests except `tests/event-non-dom.test.ts`
  - `node`: Node environment, runs only `tests/event-non-dom.test.ts` (non-DOM code paths that cannot be stubbed in a real browser); run it alone via `pnpm --filter minigame-std test:node`
- First-time setup requires: `pnpm run playwright:install`
- Web platform configuration (`__MINIGAME_STD_MINA__: false`)
- Test files are located in `packages/minigame-std/tests/` directory
- Coverage reports are generated in `packages/minigame-std/coverage/` directory
- Mini-game platform tests are located in `packages/minigame-test/` (requires WeChat DevTools to run)
- **Coverage Note**: Web platform tests achieve 100% coverage by excluding mini-game specific files via Vite's `coverage.exclude` configuration:
  - `fs_async.ts` / `fs_sync.ts`: Simple wrapper layers that delegate to platform-specific implementations
  - `mina_fs_async.ts` / `mina_fs_sync.ts`: Mini-game specific implementations tested separately via minigame-test
- **Slowest suite**: `socket.test.ts` performs real WebSocket handshakes against a public echo server (~30s). When iterating, exclude it with `--exclude 'tests/socket.test.ts'`.

### Running Individual Tests

```bash
# Run a specific test file (vitest config lives in the package, so run from there)
pnpm --filter minigame-std exec vitest run tests/base64.test.ts

# Run tests matching a pattern
pnpm --filter minigame-std exec vitest run --testNamePattern "base64"

# Run tests in watch mode for a specific file
pnpm --filter minigame-std exec vitest watch tests/crypto.test.ts

# Skip the slowest suite (socket performs real WebSocket handshakes, ~30s)
pnpm --filter minigame-std exec vitest run --exclude 'tests/socket.test.ts'
```

## Code Architecture

### Directory Structure

```
packages/
├── minigame-std/               # Main library
│   ├── src/
│   │   ├── macros/
│   │   │   └── env.ts          # Platform detection macro (__MINIGAME_STD_MINA__)
│   │   ├── mod.ts              # Main entry point (exports all modules)
│   │   └── std/                # Standard library modules
│   │       ├── internal/       # Shared internal helpers - bundled as the `_internal` chunk, not public API
│   │       ├── audio/          # WebAudio API abstraction
│   │       ├── clipboard/      # Clipboard operations
│   │       ├── codec/          # Encoding/decoding (UTF-8, Base64, Hex, ByteString) - delegates to `happy-codec` with mini-game UTF-8 override
│   │       ├── crypto/         # Cryptographic functions
│   │       │   ├── hmac/       # HMAC algorithms
│   │       │   ├── md/         # MD5 hashing
│   │       │   ├── random/     # Random number generation
│   │       │   ├── rsa/        # RSA encryption
│   │       │   └── sha/        # SHA algorithms
│   │       ├── defines.ts      # Shared type definitions (re-exported by the root entry)
│   │       ├── event/          # Global error/unhandledrejection handlers
│   │       ├── fetch/          # HTTP requests (fetch API)
│   │       ├── fs/             # File system operations (with zip support)
│   │       ├── image/          # Image processing
│   │       ├── lbs/            # Location-based services
│   │       ├── logger/         # Pluggable logging system (core + fileLog + wxLog plugins)
│   │       ├── network/        # Network status/type detection
│   │       ├── path/           # POSIX path utilities (basename, dirname, normalize)
│   │       ├── performance/    # Performance timing utilities
│   │       ├── platform/       # Platform detection (device, target)
│   │       ├── socket/         # WebSocket abstraction
│   │       ├── storage/        # Storage (localStorage equivalent)
│   │       ├── utils/          # Common utilities
│   │       └── video/          # Video playback
│   ├── build_entries.ts        # Public entry list (single source of truth for subpath exports)
│   ├── build.ts                # Multi-entry bundle script (one vite.build call per entry)
│   ├── rollup.config.ts        # Declaration generation (one .d.ts per entry)
│   ├── verify_package.ts       # Release gate: verifies the packed tarball in a temp consumer
│   ├── vite.config.ts          # Test-only configuration (build config lives in build.ts)
│   ├── tests/                  # Web platform tests (Vitest + Playwright)
│   └── dist/                   # Build output: <name>.mjs/.cjs per entry + _internal chunk + types/<name>.d.ts
└── minigame-test/              # Mini-game platform tests
    └── src/                    # Test code for WeChat DevTools
```

### Platform-Specific Code Pattern

Each module follows a consistent pattern with three files:

1. **`mod.ts`** - Platform-agnostic entry point that:
   - Imports platform-specific implementations (`mina_*.ts` and `web_*.ts`)
   - Uses `IS_MINA` constant to dispatch to correct implementation
   - Exports unified API

2. **`mina_*.ts`** - Mini-game platform implementation using `wx.*` APIs

3. **`web_*.ts`** - Browser platform implementation using standard Web APIs

**Example from `packages/minigame-std/src/std/codec/mod.ts`:**
```typescript
// Most codec functions are re-exported directly from happy-codec
export { decodeBase64, decodeByteString, decodeHex, encodeBase64, encodeByteString, encodeHex,
    type DecodeBase64Options, type EncodeBase64Options } from 'happy-codec';

// UTF-8 encoding/decoding has platform-specific implementations
// (mini-game uses wx.encode/wx.decode, web uses happy-codec's implementation)
export function encodeUtf8(data: string): Uint8Array<ArrayBuffer> {
    return (IS_MINA ? minaEncodeUtf8 : webEncodeUtf8)(data);
}
```

### API Wrapping Pattern for Mini-Game APIs

When wrapping WeChat mini-game APIs that use callback-based patterns, use `asyncResultify`:

**Requirements for `asyncResultify`:**
- API must accept optional `success` and `fail` callbacks
- API must return `void` or `Promise` (NOT Task objects like `RequestTask`, `DownloadTask`, `UploadTask`)

**Example:**
```typescript
// ✅ Good - wx.setStorage returns void
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    return (await asyncResultify(wx.setStorage)({
        key,
        data,
    }))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

// ❌ Bad - wx.downloadFile returns DownloadTask, cannot use asyncResultify
// Must manually handle callbacks with Future pattern instead
```

**APIs that return Task objects** (like `wx.request`, `wx.downloadFile`, `wx.uploadFile`) must use manual callback handling with `Future` because they need to support abort functionality and progress callbacks.

**FetchTask Pattern for Task-returning APIs:**
```typescript
// For APIs like wx.request that return Task objects with abort capability
export function minaFetch<T>(url: string, init?: MinaFetchInit): FetchTask<T> {
    let aborted = false;
    const future = new Future<IOResult<T>>();

    const task = wx.request({
        url,
        success(res) { future.resolve(Ok(res.data as T)); },
        fail(err) { future.resolve(Err(miniGameFailureToError(err))); },
    });

    return {
        abort(): void { aborted = true; task.abort(); },
        get aborted(): boolean { return aborted; },
        get result(): AsyncIOResult<T> { return future.promise; },
    };
}
```

### Build System

- **Bundler**: Vite (rolldown-vite) for bundling, Rollup + `rollup-plugin-dts` for TypeScript declarations
- **Configuration**:
  - `packages/minigame-std/build_entries.ts` - Single source of truth for public entries (`PUBLIC_ENTRIES`)
  - `packages/minigame-std/build.ts` - Multi-entry bundling (one `vite.build` call per entry)
  - `packages/minigame-std/rollup.config.ts` - Declaration generation (one `.d.ts` per entry)
  - `packages/minigame-std/vite.config.ts` - **Test-only** configuration (build config lives in `build.ts`)
- **Multi-entry layout**: Each public entry in `build_entries.ts` is bundled independently to `dist/<name>.mjs` + `dist/<name>.cjs`, with declarations at `dist/types/<name>.d.ts`. Cross-entry imports are externalized and rewritten via `output.paths` (e.g. `fs.mjs` imports `./path.mjs`), so no code is duplicated between entries.
- **Shared internal chunk**: `src/std/internal/` helpers are bundled once as `dist/_internal.mjs/.cjs`; all entries reference it via relative import. It is NOT declared in `package.json` exports (relative paths bypass exports resolution).
- **`_env` must stay inlined**: `src/macros/env.ts` (the `IS_MINA` macro) is deliberately NOT externalized — externalizing it prevents rolldown from constant-folding `IS_MINA` inside each entry, which breaks DCE and retains the entire happy-rusty module as dead code.
- **CJS export-star fixup**: `build.ts` ships a `renderChunk` plugin rewriting CJS `require("./std/xxx/mod.ts")` source paths to entry paths (workaround for rolldown#10402 — ESM honors `output.paths`, CJS does not).
- **Tree-shaking**: `treeshake.moduleSideEffects: false` and `treeshake.propertyReadSideEffects: false` in `build.ts` for aggressive dead-code elimination
- **Top-level declarations**: Bundles use `topLevelVar: false` in both CJS and ESM to preserve `const` declarations — this is what makes `/*#__PURE__*/` annotations on module-level calls effective for downstream bundlers
- **Side effects**: `"sideEffects": false` in package.json for optimal tree-shaking

### Build Process

`pnpm --filter minigame-std build` runs these steps in order:
1. Type checking and linting (`prebuild`: `pnpm run check && pnpm run lint`)
2. Multi-entry Vite bundling (`node build.ts`)
3. Rollup-based TypeScript declaration generation (`rollup --config rollup.config.ts`)

`pnpm --filter minigame-std verify:package` is the release gate (also wired to `prepublishOnly`): it rebuilds, packs a tarball, installs it into a temp consumer fixture, and validates every subpath export across TS/ESM/CJS resolution matrices plus publint/attw checks. Fixture dependency versions are read from workspace `package.json` files at runtime (never hardcoded).

The published bundles keep `__MINIGAME_STD_MINA__` as an **unresolved global** — downstream builds must define it as a **boolean literal** so `IS_MINA` constant-folds and the other platform's code is eliminated:
- Set to `true` for mini-game builds (removes web platform code)
- Set to `false` for web builds (removes mini-game platform code)

### TypeScript Configuration

- Target: `ESNext`
- Module resolution: `bundler` mode
- Strict mode enabled with additional strictness flags
- Uses `minigame-api-typings` for WeChat mini-game type definitions
- Import `.ts` extensions required (no automatic resolution)

### Type Compatibility Notes

When updating `minigame-api-typings`, be aware that WeChat API types may change:
- Check for deprecated types (e.g., `WechatMinigame.Error` → `WechatMinigame.ListenerError`)
- Update affected files (usually in `packages/minigame-std/src/std/event/` and callback handlers)
- Run `pnpm run check` to catch type errors early

## Code Conventions

### Import Paths
- Always use `.ts` file extensions in imports
- Use the `minigame-std` alias in tests (configured in `packages/minigame-std/vitest.config.ts`)

### Type Safety
- Return types must explicitly specify `Uint8Array<ArrayBuffer>` instead of generic `Uint8Array`
- Use type assertions when necessary for platform compatibility
- All code must pass strict TypeScript checks

### Error Handling
- Use `happy-rusty` for Result types (Ok/Err pattern)
- Async operations return `AsyncIOResult<T>` or `IOResult<T>`

### API Wrapper Utilities

The project provides several utilities for wrapping platform-specific APIs:

- **`asyncResultify(api)`** - Converts callback-based mini-game APIs to Result-based async functions
  - Use for APIs with `success`/`fail` callbacks that return `void` or `Promise`
  - Located in `packages/minigame-std/src/std/utils/resultify.ts`

- **`tryGeneralAsyncOp(fn)`** / **`tryGeneralSyncOp(fn)`** - Wraps operations that may throw
  - Use for APIs that already return Promise but may throw errors
  - Converts exceptions to `IOResult<T>`

- **`miniGameFailureToError(err)`** / **`miniGameFailureToResult(err)`** - Error converters
  - Converts WeChat mini-game error objects to standard Error objects or Results

### Exports
- Module exports use namespace pattern for some modules: `export * as fs from './std/fs/mod.ts'`
- This avoids naming conflicts (e.g., `cryptos` instead of `crypto` to avoid global conflict)
- Every public module is also importable as a subpath (e.g. `minigame-std/fs`, `minigame-std/codec`). Adding a new public module requires syncing THREE places: `build_entries.ts` (`PUBLIC_ENTRIES`), `package.json` (`exports`), and `jsr.json` (`exports`).

### Tree-shaking: PURE Annotations

Module-level function/constructor calls **must** be prefixed with `/*#__PURE__*/` so bundlers can eliminate them when unused by downstream consumers.

- Use the `#` style (Rollup/Vite/Terser/SWC convention), **not** the legacy `@` style.
- Pattern examples:
  ```typescript
  const fs = /*#__PURE__*/ Lazy(() => wx.getFileSystemManager());
  const audioContext = /*#__PURE__*/ Once<AudioContext>();
  export const EMPTY_BYTES: Uint8Array<ArrayBuffer> = /*#__PURE__*/ new Uint8Array(0);
  export const ASYNC_RESULT_VOID = /*#__PURE__*/ Promise.resolve(RESULT_VOID);
  ```
- Combined with `topLevelVar: false` in `vite.config.ts`, this enables per-symbol DCE for downstream consumers.

## Dependencies

### Runtime Dependencies (minigame-std)
- `@happy-ts/fetch-t` - Enhanced fetch implementation
- `happy-rusty` - Rust-like Result types for error handling
- `happy-codec` - Encoding/decoding utilities (Base64, Hex, ByteString, UTF-8)
- `happy-opfs` - OPFS (Origin Private File System) support
- `fflate` - Compression/decompression (zip support)
- `rsa-oaep-encryption` - RSA-OAEP encryption implementation
- `tiny-future` - Promise-based Future utility
- `minigame-api-typings` - WeChat mini-game TypeScript definitions

### Build Tools (root)
- `vite` for development and initial bundling
- `rollup` + `rollup-plugin-dts` for final bundling and TypeScript declarations
- `typescript` + `typescript-eslint` for type checking and linting
- `typedoc` for API documentation generation
- `vitest` + `playwright` for testing

## Git Commit Conventions

This project follows **Conventional Commits** specification. Common commit types:
- `feat`: New features
- `fix`: Bug fixes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks (deps, config, ci)
- `docs`: Documentation changes
- `test`: Test updates

Scopes frequently used: `deps`, `ci`, `types`, `config`, `tests`

## Release Process

The project is dual-published to **npm** and **JSR**. Releases are coordinated by the `/release` skill which runs:

1. Bump version in `packages/minigame-std/package.json` **and** `packages/minigame-std/jsr.json` (must stay in sync)
2. Regenerate `CHANGELOG.md` (Keep a Changelog format) via `/changelog` skill
3. Commit as `release: vx.y.z`
4. Tag `vx.y.z`
5. Push (manual confirmation required)

Version bump policy (Semver, based on accumulated commits since last tag):
- `feat!` / `BREAKING CHANGE` → major
- `feat` → minor
- `fix` / `perf` / others → patch

Style-only changes (e.g. `/*@__PURE__*/` ↔ `/*#__PURE__*/`) do not by themselves warrant a release — bundle them with a substantive change.

## Common Pitfalls

### Type Assertions
- Use explicit `Uint8Array<ArrayBuffer>` type annotations, not generic `Uint8Array`
- WeChat API types may change between versions of `minigame-api-typings`

### Import Extensions
- Always include `.ts` extensions in import statements
- TypeScript doesn't auto-resolve extensions in this project

### Platform Detection
- Use `IS_MINA` constant from `packages/minigame-std/src/macros/env.ts` for platform checks
- Never use direct checks like `typeof wx !== 'undefined'` in library code

### pnpm 11 Reserved Subcommands
pnpm 11 introduced built-in subcommands (e.g. `docs`) that shadow workspace scripts. When writing root scripts that delegate to workspace packages, **always include the `run` keyword** to disambiguate:
```jsonc
// ❌ Bad — `docs` is parsed as pnpm's built-in command, --filter becomes an unknown option
"docs": "pnpm --filter minigame-std docs"
// ✅ Good
"docs": "pnpm --filter minigame-std run docs"
```

## Important Files

- `packages/minigame-std/src/mod.ts` - Main entry point, exports all public APIs
- `packages/minigame-std/src/macros/env.ts` - Platform detection mechanism
- `package.json` - Root monorepo scripts
- `packages/minigame-std/package.json` - Library package config (npm)
- `packages/minigame-std/jsr.json` - Library package config (JSR); version must match `package.json`
- `packages/minigame-std/build_entries.ts` - Public entry list (single source of truth for subpath exports)
- `packages/minigame-std/build.ts` - Multi-entry bundle script
- `packages/minigame-std/rollup.config.ts` - Declaration generation (one `.d.ts` per entry)
- `packages/minigame-std/verify_package.ts` - Release gate: tarball consumer verification (run via `verify:package`)
- `packages/minigame-std/vite.config.ts` - Test-only configuration (browser + node projects, coverage)
- `packages/minigame-std/tsconfig.json` - TypeScript compiler options
- `pnpm-workspace.yaml` - Declares `packages/*` as the workspace
- `.npmrc` - pnpm install behavior tweaks
- `eslint.config.mjs` - ESLint rules (root level)
- `CHANGELOG.md` - Release history (Keep a Changelog format, generated by `/changelog` skill)

## Documentation

- **API Documentation**: [https://jiangjie.github.io/minigame-std/](https://jiangjie.github.io/minigame-std/) (auto-generated via TypeDoc and deployed to GitHub Pages)
- **Generate locally**: `pnpm run docs`
- Generated docs are NOT committed to the repository; they are deployed automatically via GitHub Actions
