# minigame-std

[![License](https://img.shields.io/npm/l/minigame-std.svg)](LICENSE)
[![Build Status](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/minigame-std/graph/badge.svg)](https://codecov.io/gh/JiangJie/minigame-std)
[![NPM version](https://img.shields.io/npm/v/minigame-std.svg)](https://npmjs.org/package/minigame-std)
[![NPM downloads](https://badgen.net/npm/dm/minigame-std)](https://npmjs.org/package/minigame-std)
[![JSR Version](https://jsr.io/badges/@happy-js/minigame-std)](https://jsr.io/@happy-js/minigame-std)
[![JSR Score](https://jsr.io/badges/@happy-js/minigame-std/score)](https://jsr.io/@happy-js/minigame-std/score)

A cross-platform standard library for mini-games: one API that runs both in mini-game environments and in the browser.

> [!NOTE]
> This is not an official project of any mini-game platform.

---

[中文](./README.md) | [API Docs](https://jiangjie.github.io/minigame-std/)

---

## Why

Mini-game environments ship no BOM / DOM and expose wx APIs instead, which differ substantially from their browser counterparts:

**Browser**

```ts
new TextEncoder().encode(data);
```

**WeChat Mini Game**

```ts
wx.encode({
    data,
    format: 'utf8',
});
```

Not every mini-game platform implements even `wx.encode`. The same code base is usually developed and debugged in the browser first and then shipped to a mini-game platform — often to both at once — which makes these differences tedious but unavoidable.

minigame-std smooths them over: the same API works on every platform, and platforms missing a capability get a shared implementation.

## Installation

```sh
# npm / pnpm / yarn
pnpm add minigame-std

# JSR
jsr add @happy-js/minigame-std
```

## Quick Start

```ts
import { cryptos, fs, platform } from 'minigame-std';

platform.isMiniGame();                          // platform detection: true / false
const hash = cryptos.md5('hello');              // sync APIs return the value directly

const result = await fs.readFile('a.txt', { encoding: 'utf8' });
if (result.isOk()) {
    console.log(result.unwrap());               // async APIs return a Result
}
```

Async APIs return a [happy-rusty](https://github.com/JiangJie/happy-rusty) `Result` (`IOResult` / `AsyncIOResult`) instead of throwing, so failures are handled with `isOk` / `unwrap` / `mapErr`.

### Required: `__MINIGAME_STD_MINA__`

In the published bundles `__MINIGAME_STD_MINA__` stays an **unresolved global identifier**; your bundler has to replace it with a **boolean literal**:

```ts
// vite.config.ts
export default defineConfig({
    define: {
        __MINIGAME_STD_MINA__: true, // mini-game builds: true; web builds: false
    },
});
```

```js
// webpack.config.js
new webpack.DefinePlugin({
    __MINIGAME_STD_MINA__: 'true',
});
```

- `true` prunes the web implementation (for mini-game builds)
- `false` prunes the mini-game implementation (for browser development or web builds)

Platform-specific code is side-effect free and safe to prune. Without the replacement the platform code cannot be pruned, and the bundle throws at runtime on an undefined identifier. See [Code Pruning](#code-pruning).

## Capabilities

| Module      | Subpath                  | Description                                                                    |
| ----------- | ------------------------ | ------------------------------------------------------------------------------ |
| platform    | `platform`               | Target platform, device and hardware info, environment checks                  |
| codec       | `codec`                  | UTF-8, Base64, Hex and ByteString encoding/decoding                            |
| cryptos     | `cryptos`, `cryptos/rsa` | MD5, SHA-1/256/384/512, HMAC, random values, RSA                               |
| fs          | `fs`                     | Files and directories, zip/unzip, download and upload, JSON I/O (sync + async) |
| storage     | `storage`                | localStorage-style storage (sync + async)                                      |
| clipboard   | `clipboard`              | Clipboard read and write                                                       |
| fetch       | `fetch`                  | Abortable HTTP requests (`fetchT`) that also accept platform-specific options  |
| socket      | `socket`                 | WebSocket wrapper including the mini-game SocketTask                           |
| network     | `network`                | Network type lookup and change events                                          |
| event       | `event`                  | Global error, unhandledrejection, foreground/background and resize listeners   |
| logger      | `logger`                 | Pluggable logging: levels, file persistence, WeChat logs, console interception |
| audio       | `audio`                  | WebAudio context management and playback                                       |
| video       | `video`                  | Video playback and VideoFrameSource                                            |
| image       | `image`                  | Image loading                                                                  |
| lbs         | `lbs`                    | Geolocation                                                                    |
| path        | `path`                   | POSIX path helpers                                                             |
| performance | `performance`            | High-resolution timing                                                         |
| utils       | `utils`                  | Helpers for wrapping platform callback APIs (`asyncResultify`, ...)            |

Full signatures and examples live in the [API docs](https://jiangjie.github.io/minigame-std/); [packages/minigame-test](https://github.com/JiangJie/minigame-std/tree/main/packages/minigame-test) shows a real build setup.

## Platform Support

- **WeChat Mini Game**: 100% tested
- **Other mini-game platforms**: mini-game APIs are reached through the `wx` namespace, and other platforms usually map their own namespace for compatibility (`GameGlobal.wx = qq`) with largely identical APIs, so they mostly work. Differences are welcome as [issues](https://github.com/JiangJie/minigame-std/issues)
- **Browser**: the web implementation and the basis of the test suite

## Relationship to Adapter

[Adapter](https://developers.weixin.qq.com/minigame/dev/game-engine/workflow/adapter.html) also bridges wx APIs and DOM / BOM, but takes a different route:

- Adapter emulates browser APIs on top of mini-game APIs. The two are not equivalent, so mini-game-only parameters get lost: `wx.request` supports `enableHttpDNS`, which has no browser counterpart and cannot survive emulation; `wx.request` also returns an abortable `RequestTask`, while `fetch` needs a separate `AbortController`, so emulation drops that ability too. minigame-std does not emulate — platform-specific options are simply ignored by the other platform, and `fetchT` keeps the `wx.request` return-value design while supporting `abortable`:

  ```ts
  fetchT(url, {
      mode: 'no-cors', // browser-only
      enableHttpDNS: true, // mini-game-only

      abortable: true, // abortable
  });
  ```

- Adapter's glue code enters the bundle whether or not you use it; minigame-std prunes platform code at build time and is ESM + tree-shake friendly, so unused features drop out of the bundle.

**Adapter is still needed for some things**: DOM Element adaptation (required by game engines) is not covered yet.

## Code Pruning

### Subpath Imports

Besides the root entry, every module is exposed as its own subpath with an identical API:

```ts
// root entry
import { fs, encodeBase64 } from 'minigame-std';

// equivalent subpath imports
import * as fs from 'minigame-std/fs';
import { encodeBase64 } from 'minigame-std/codec';
```

Available subpaths: `audio`, `clipboard`, `codec`, `cryptos`, `cryptos/rsa`, `event`, `fetch`, `fs`, `image`, `lbs`, `logger`, `network`, `path`, `performance`, `platform`, `socket`, `storage`, `utils`, `video`. On JSR they map to `@happy-js/minigame-std/<subpath>`, e.g. `@happy-js/minigame-std/fs`.

Subpath imports rely on `__MINIGAME_STD_MINA__` as well; with build tools that tree-shake poorly, they give more explicit control over which modules end up in the bundle.

## Requirements

- Usage: any bundler supporting `define` replacement and tree-shaking (Vite, webpack, Rollup, ...)
- Working on this repo: Node `^20.19.0 || ^22.18.0 || >=24.11.0` (the Vite+ requirement) and pnpm

## Development

```bash
pnpm install
pnpm test        # browser + Node tests
pnpm run check   # format, lint and type checks
pnpm run build   # build all packages
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the test layout, toolchain and commit rules.

## License

[MIT](LICENSE)
