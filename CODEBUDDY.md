# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

**License**: MIT

This is a **monorepo** containing:

- **minigame-std** (`packages/minigame-std/`) - A cross-platform standard development library that provides unified APIs for both mini-game environments (WeChat, QQ, etc.) and web browsers
- **minigame-test** (`packages/minigame-test/`) - Mini-game platform tests for minigame-std

### Key Concept: Platform Abstraction

The core architecture uses a compile-time macro `__MINIGAME_STD_MINA__` to determine which platform code to include:
- When `true`: bundles mini-game (Mina) platform code, excludes web code
- When `false`: bundles web platform code, excludes mini-game code

This is defined in `packages/minigame-std/src/macros/env.ts` and used throughout the codebase via `isMinaEnv()`.

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
```

### Testing Notes

- Tests run in **Vitest** with **Playwright** browser provider (Chromium)
- First-time setup requires: `pnpm run playwright:install`
- Web platform configuration (`__MINIGAME_STD_MINA__: false`)
- Test files are located in `packages/minigame-std/tests/` directory
- Coverage reports are generated in `packages/minigame-std/coverage/` directory
- Mini-game platform tests are located in `packages/minigame-test/` (requires WeChat DevTools to run)
- **Coverage Note**: Web platform tests achieve 100% coverage by excluding mini-game specific files via Vite's `coverage.exclude` configuration:
  - `fs_async.ts` / `fs_sync.ts`: Simple wrapper layers that delegate to platform-specific implementations
  - `mina_fs_async.ts` / `mina_fs_sync.ts`: Mini-game specific implementations tested separately via minigame-test

### Running Individual Tests

```bash
# Run a specific test file
pnpm exec vitest run packages/minigame-std/tests/base64.test.ts

# Run tests matching a pattern
pnpm exec vitest run --testNamePattern "base64"

# Run tests in watch mode for a specific file
pnpm exec vitest watch packages/minigame-std/tests/crypto.test.ts
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
│   │       ├── assert/         # Internal assertion utilities (not public API)
│   │       ├── audio/          # WebAudio API abstraction
│   │       ├── clipboard/      # Clipboard operations
│   │       ├── codec/          # Encoding/decoding (UTF-8, Base64, Hex, ByteString) - delegates to `happy-codec` with mini-game UTF-8 override
│   │       ├── crypto/         # Cryptographic functions
│   │       │   ├── hmac/       # HMAC algorithms
│   │       │   ├── md/         # MD5 hashing
│   │       │   ├── random/     # Random number generation
│   │       │   ├── rsa/        # RSA encryption
│   │       │   └── sha/        # SHA algorithms
│   │       ├── event/          # Global error/unhandledrejection handlers
│   │       ├── fetch/          # HTTP requests (fetch API)
│   │       ├── fs/             # File system operations (with zip support)
│   │       ├── image/          # Image processing
│   │       ├── lbs/            # Location-based services
│   │       ├── network/        # Network status/type detection
│   │       ├── performance/    # Performance timing utilities
│   │       ├── platform/       # Platform detection (device, target)
│   │       ├── socket/         # WebSocket abstraction
│   │       ├── storage/        # Storage (localStorage equivalent)
│   │       ├── utils/          # Common utilities
│   │       └── video/          # Video playback
│   ├── tests/                  # Web platform tests (Vitest + Playwright)
│   └── dist/                   # Build output
└── minigame-test/              # Mini-game platform tests
    └── src/                    # Test code for WeChat DevTools
```

### Platform-Specific Code Pattern

Each module follows a consistent pattern with three files:

1. **`mod.ts`** - Platform-agnostic entry point that:
   - Imports platform-specific implementations (`mina_*.ts` and `web_*.ts`)
   - Uses `isMinaEnv()` to dispatch to correct implementation
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
    return (isMinaEnv() ? minaEncodeUtf8 : webEncodeUtf8)(data);
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

- **Bundler**: Rollup with esbuild plugin
- **Configuration**: `packages/minigame-std/rollup.config.ts`
- **Output**:
  - `packages/minigame-std/dist/main.cjs` - CommonJS bundle
  - `packages/minigame-std/dist/main.mjs` - ES module bundle
  - `packages/minigame-std/dist/types.d.ts` - TypeScript declarations
- **Tree-shaking**: Enabled with `treeshake: 'smallest'`
- **Side effects**: `"sideEffects": false` in package.json for optimal tree-shaking

### Build Process

The build runs these steps in order:
1. Type checking (`pnpm run check`)
2. Linting (`pnpm run lint`)
3. Rollup bundling with platform-specific code elimination
4. TypeScript declaration generation

The build uses `__MINIGAME_STD_MINA__` macro for compile-time platform detection:
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

## Dependencies

### Runtime Dependencies (minigame-std)
- `@happy-ts/fetch-t` - Enhanced fetch implementation
- `@std/path` - Path utilities (JSR package)
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

## Common Pitfalls

### Memory Leaks
- Always revoke object URLs after use (e.g., `URL.revokeObjectURL()` for images)
- Clean up event listeners when no longer needed

### Type Assertions
- Use explicit `Uint8Array<ArrayBuffer>` type annotations, not generic `Uint8Array`
- WeChat API types may change between versions of `minigame-api-typings`

### Import Extensions
- Always include `.ts` extensions in import statements
- TypeScript doesn't auto-resolve extensions in this project

### Platform Detection
- Use `isMinaEnv()` from `packages/minigame-std/src/macros/env.ts` for runtime platform checks
- Never use direct checks like `typeof wx !== 'undefined'` in library code

## Important Files

- `packages/minigame-std/src/mod.ts` - Main entry point, exports all public APIs
- `packages/minigame-std/src/macros/env.ts` - Platform detection mechanism
- `package.json` - Root monorepo scripts
- `packages/minigame-std/package.json` - Library package config
- `packages/minigame-std/vitest.config.ts` - Test configuration and import mappings
- `packages/minigame-std/rollup.config.ts` - Build configuration
- `packages/minigame-std/tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint rules (root level)

## Documentation

- **API Documentation**: [https://jiangjie.github.io/minigame-std/](https://jiangjie.github.io/minigame-std/) (auto-generated via TypeDoc and deployed to GitHub Pages)
- **Generate locally**: `pnpm run docs`
- Generated docs are NOT committed to the repository; they are deployed automatically via GitHub Actions
