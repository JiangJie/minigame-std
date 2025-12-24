# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

**License**: MIT

**minigame-std** is a cross-platform standard development library that provides unified APIs for both mini-game environments (WeChat, QQ, etc.) and web browsers. The library abstracts platform-specific differences, allowing developers to write code once and run it on both platforms.

### Key Concept: Platform Abstraction

The core architecture uses a compile-time macro `__MINIGAME_STD_MINA__` to determine which platform code to include:
- When `true`: bundles mini-game (Mina) platform code, excludes web code
- When `false`: bundles web platform code, excludes mini-game code

This is defined in `src/macros/env.ts` and used throughout the codebase via `isMinaEnv()`.

## Development Commands

### Package Manager
This project uses **pnpm** as the package manager.

### Essential Commands

```bash
# Install dependencies
pnpm install

# Type checking (must pass before commits)
pnpm run check

# Linting (must pass before commits)
pnpm run lint

# Run all tests (uses Vitest + Playwright in browser)
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with UI
pnpm run test:ui

# Build the library (runs check + lint first)
pnpm run build

# Generate API documentation
pnpm run docs
```

### Testing Notes

- Tests run in **Vitest** with **Playwright** browser provider (Chromium)
- Web platform configuration (`__MINIGAME_STD_MINA__: false`)
- Test files are located in `tests/` directory
- Coverage reports are generated in `coverage/` directory
- Mini-game platform tests are located in a separate demo repository ([minigame-std-demo](https://github.com/JiangJie/minigame-std-demo))
- **Coverage Note**: Coverage is not 100% because some code only runs in the mini-game environment, which cannot be simulated by existing testing tools

### Running Individual Tests

```bash
# Run a specific test file
pnpm exec vitest run tests/base64.test.ts

# Run tests matching a pattern
pnpm exec vitest run --testNamePattern "base64"

# Run tests in watch mode for a specific file
pnpm exec vitest watch tests/crypto.test.ts
```

## Code Architecture

### Directory Structure

```
src/
├── macros/
│   └── env.ts              # Platform detection macro (__MINIGAME_STD_MINA__)
├── mod.ts                  # Main entry point (exports all modules)
└── std/                    # Standard library modules
    ├── assert/             # Internal assertion utilities (not public API)
    ├── audio/              # WebAudio API abstraction
    ├── base64/             # Base64 encoding/decoding
    ├── clipboard/          # Clipboard operations
    ├── codec/              # Text encoding (UTF-8 ↔ ArrayBuffer)
    ├── crypto/             # Cryptographic functions
    │   ├── hmac/           # HMAC algorithms
    │   ├── md/             # MD5 hashing
    │   ├── random/         # Random number generation
    │   ├── rsa/            # RSA encryption
    │   └── sha/            # SHA algorithms
    ├── event/              # Global error/unhandledrejection handlers
    ├── fetch/              # HTTP requests (fetch API)
    ├── fs/                 # File system operations (with zip support)
    ├── image/              # Image processing
    ├── lbs/                # Location-based services
    ├── network/            # Network status/type detection
    ├── performance/        # Performance timing utilities
    ├── platform/           # Platform detection (device, target)
    ├── socket/             # WebSocket abstraction
    ├── storage/            # Storage (localStorage equivalent)
    ├── utils/              # Common utilities
    └── video/              # Video playback
```

### Platform-Specific Code Pattern

Each module follows a consistent pattern with three files:

1. **`mod.ts`** - Platform-agnostic entry point that:
   - Imports platform-specific implementations (`mina_*.ts` and `web_*.ts`)
   - Uses `isMinaEnv()` to dispatch to correct implementation
   - Exports unified API

2. **`mina_*.ts`** - Mini-game platform implementation using `wx.*` APIs

3. **`web_*.ts`** - Browser platform implementation using standard Web APIs

**Example from `src/std/base64/mod.ts`:**
```typescript
import { isMinaEnv } from '../../macros/env.ts';
import { encodeBase64 as minaEncodeBase64 } from './mina_base64.ts';
import { encodeBase64 as webEncodeBase64 } from './web_base64.ts';

export function encodeBase64(data: string): string {
    return (isMinaEnv() ? minaEncodeBase64 : webEncodeBase64)(data);
}
```

### API Wrapping Pattern for Mini-Game APIs

When wrapping WeChat mini-game APIs that use callback-based patterns, use `promisifyWithResult`:

**Requirements for `promisifyWithResult`:**
- API must accept optional `success` and `fail` callbacks
- API must return `void` or `Promise` (NOT Task objects like `RequestTask`, `DownloadTask`, `UploadTask`)

**Example:**
```typescript
// ✅ Good - wx.setStorage returns void
export async function setItem(key: string, data: string): AsyncVoidIOResult {
    return (await promisifyWithResult(wx.setStorage)({
        key,
        data,
    }))
        .and(RESULT_VOID)
        .mapErr(miniGameFailureToError);
}

// ❌ Bad - wx.downloadFile returns DownloadTask, cannot use promisifyWithResult
// Must manually handle callbacks with Future pattern instead
```

**APIs that return Task objects** (like `wx.request`, `wx.downloadFile`, `wx.uploadFile`) must use manual callback handling with `Future` because they need to support abort functionality and progress callbacks.

### Build System

- **Bundler**: Rollup with esbuild plugin
- **Configuration**: `rollup.config.mjs`
- **Output**: 
  - `dist/main.cjs` - CommonJS bundle
  - `dist/main.mjs` - ES module bundle
  - `dist/types.d.ts` - TypeScript declarations
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
- Update affected files (usually in `src/std/event/` and callback handlers)
- Run `pnpm run check` to catch type errors early

## Code Conventions

### Import Paths
- Always use `.ts` file extensions in imports
- Use the `minigame-std` alias in tests (configured in `vitest.config.ts`)

### Type Safety
- Return types must explicitly specify `Uint8Array<ArrayBuffer>` instead of generic `Uint8Array`
- Use type assertions when necessary for platform compatibility
- All code must pass strict TypeScript checks

### Error Handling
- Use `happy-rusty` for Result types (Ok/Err pattern)
- Async operations return `AsyncIOResult<T>` or `IOResult<T>`

### API Wrapper Utilities

The project provides several utilities for wrapping platform-specific APIs:

- **`promisifyWithResult(api)`** - Converts callback-based mini-game APIs to Result-based async functions
  - Use for APIs with `success`/`fail` callbacks that return `void` or `Promise`
  - Located in `src/std/utils/promisify.ts`
  
- **`tryGeneralAsyncOp(fn)`** / **`tryGeneralSyncOp(fn)`** - Wraps operations that may throw
  - Use for APIs that already return Promise but may throw errors
  - Converts exceptions to `IOResult<T>`

- **`miniGameFailureToError(err)`** / **`miniGameFailureToResult(err)`** - Error converters
  - Converts WeChat mini-game error objects to standard Error objects or Results

### Exports
- Module exports use namespace pattern for some modules: `export * as fs from './std/fs/mod.ts'`
- This avoids naming conflicts (e.g., `cryptos` instead of `crypto` to avoid global conflict)

## Dependencies

### Runtime Dependencies
- `@happy-ts/fetch-t` - Enhanced fetch implementation
- `@std/path` - Path utilities (JSR package)
- `happy-rusty` - Rust-like Result types for error handling
- `happy-opfs` - OPFS (Origin Private File System) support
- `fflate` - Compression/decompression (zip support)
- `rsa-oaep-encryption` - RSA-OAEP encryption implementation
- `tiny-future`, `tiny-invariant` - Utility libraries
- `minigame-api-typings` - WeChat mini-game TypeScript definitions

### Build Tools
- `vite` for development and initial bundling
- `rollup` + `rollup-plugin-dts` for final bundling and TypeScript declarations
- `typescript` + `typescript-eslint` for type checking and linting
- `typedoc` for API documentation generation

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
- Use `isMinaEnv()` from `src/macros/env.ts` for runtime platform checks
- Never use direct checks like `typeof wx !== 'undefined'` in library code

## Important Files

- `src/mod.ts` - Main entry point, exports all public APIs
- `src/macros/env.ts` - Platform detection mechanism
- `package.json` - Scripts and dependencies
- `vitest.config.ts` - Test configuration and import mappings
- `rollup.config.mjs` - Build configuration
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint rules

## Documentation

- **API Documentation**: [https://jiangjie.github.io/minigame-std/](https://jiangjie.github.io/minigame-std/) (auto-generated via TypeDoc and deployed to GitHub Pages)
- **Generate locally**: `pnpm run docs`
- Generated docs are NOT committed to the repository; they are deployed automatically via GitHub Actions
