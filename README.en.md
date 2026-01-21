# minigame-std

[![License](https://img.shields.io/npm/l/minigame-std.svg)](LICENSE)
[![Build Status](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/minigame-std/graph/badge.svg)](https://codecov.io/gh/JiangJie/minigame-std)
[![NPM version](https://img.shields.io/npm/v/minigame-std.svg)](https://npmjs.org/package/minigame-std)
[![NPM downloads](https://badgen.net/npm/dm/minigame-std)](https://npmjs.org/package/minigame-std)
[![JSR Version](https://jsr.io/badges/@happy-js/minigame-std)](https://jsr.io/@happy-js/minigame-std)
[![JSR Score](https://jsr.io/badges/@happy-js/minigame-std/score)](https://jsr.io/@happy-js/minigame-std/score)

Cross-platform Standard Library for Mini-Games.

> [!NOTE]
> This is not an official project of any mini-game platform.

---

[中文](./README.md) | [API Documentation](https://jiangjie.github.io/minigame-std/)

---

## Motivation

The purpose of this project is to provide a common development library with unified APIs that can run on both mini-game environments and browser environments.

Since mini-game platforms typically have an official base library (Core) in addition to the runtime, this project is built on top of the base library as a supplement, aiming to serve as a "Standard Library (Std)".

According to the [WeChat Mini-Game](https://developers.weixin.qq.com/minigame/dev/guide/) documentation (similar for other mini-game platforms), the main difference between mini-games and browser environments is that mini-games lack BOM and DOM APIs, instead providing similar functionality through `wx` APIs, but with significant differences.

For example, encoding a UTF-8 string to ArrayBuffer:

**Browser**

```ts
new TextEncoder().encode(data);
```

**WeChat Mini-Game**

```ts
wx.encode({
    data,
    format: 'utf8',
});
```

Additionally, not all mini-game platforms provide the `wx.encode` API (some platforms may lack this interface), which further complicates cross-platform development.

Typically, mini-games are developed and debugged in browsers first, then published to mini-game platforms. Furthermore, the same codebase is often published to both mini-game and web platforms simultaneously.

In this scenario, these differences become an unavoidable challenge. This project aims to smooth out these differences, helping developers use the same API across different platforms, while also providing unified implementations for platforms that lack certain APIs.

## Installation

```sh
# via pnpm
pnpm add minigame-std
# or via yarn
yarn add minigame-std
# or via npm
npm install --save minigame-std
# via JSR
jsr add @happy-js/minigame-std
```

## Features

### Core Functionality

-   **Platform Detection & Adaptation**
    ```js
    import { platform } from 'minigame-std';
    // Detect current runtime environment
    platform.isWeb();
    platform.isMiniGame();
    ```

-   **Text Encoding/Decoding**
    ```js
    import { decodeUtf8, encodeUtf8 } from 'minigame-std';
    // UTF-8 string ↔ ArrayBuffer
    ```

-   **Base64 Encoding/Decoding**
    ```js
    import { decodeBase64, encodeBase64 } from 'minigame-std';
    ```

-   **File System Operations**
    ```js
    import { fs } from 'minigame-std';
    // Supports zip/unzip, read/write files, directory operations, etc.
    await fs.writeFile('path/to/file.txt', 'content');
    await fs.readFile('path/to/file.txt');
    await fs.writeJsonFile('path/to/data.json', { key: 'value' });
    await fs.zip('source', 'target.zip');
    ```

-   **Clipboard Operations**
    ```js
    import { clipboard } from 'minigame-std';
    await clipboard.writeText('text');
    const text = await clipboard.readText();
    ```

-   **Global Event Handling**
    ```js
    import { addErrorListener, addUnhandledrejectionListener } from 'minigame-std';
    // Unified error and Promise rejection handling
    ```

-   **Network Status Monitoring**
    ```js
    import { addNetworkChangeListener, getNetworkType } from 'minigame-std';
    ```

-   **HTTP Requests**
    ```js
    import { fetchT } from 'minigame-std';
    // Supports abortable requests with platform-specific parameters
    const task = fetchT(url, { abortable: true });
    task.abort(); // Abort request
    ```

-   **WebSocket**
    ```js
    import { connectSocket } from 'minigame-std';
    const socket = connectSocket('wss://example.com');
    ```

-   **Local Storage**
    ```js
    import { storage } from 'minigame-std';
    // localStorage-compatible API
    await storage.setItem('key', 'value');
    const value = await storage.getItem('key');
    ```

-   **WebAudio**
    ```js
    import { audio } from 'minigame-std';
    const context = audio.createAudioContext();
    ```

-   **Cryptographic Algorithms**
    ```js
    import { cryptos } from 'minigame-std';
    // MD5, SHA-1/256/384/512, HMAC, RSA
    cryptos.md5('data');
    await cryptos.sha256('data');
    await cryptos.sha256HMAC('key', 'data');
    ```

-   **Geolocation**
    ```js
    import { lbs } from 'minigame-std';
    const position = await lbs.getCurrentPosition();
    ```

-   **Performance Measurement**
    ```js
    import { getPerformanceNow } from 'minigame-std';
    const timestamp = getPerformanceNow();
    ```

-   **Image Processing**
    ```js
    import { image } from 'minigame-std';
    const img = image.createImageFromUrl(url);
    ```

-   **Video Playback**
    ```js
    import { video } from 'minigame-std';
    const v = video.createVideo({ src: 'video.mp4' });
    v.play();
    v.requestFullScreen(0); // 0: portrait, 90/-90: landscape
    ```

For more features, see the [API Documentation](https://jiangjie.github.io/minigame-std/).

## Comparison with Adapter

[Adapter](https://developers.weixin.qq.com/minigame/dev/game-engine/workflow/adapter.html) is also designed to bridge the gap between `wx` APIs and DOM/BOM APIs. Compared to Adapter, minigame-std has several significant advantages:

-   **Preserves Platform-Specific Features**

    Adapter uses mini-game APIs to simulate browser-specific APIs, but the two are not functionally equivalent, which means some mini-game API features are lost.

    For example, `wx.request` supports the `enableHttpDNS` parameter, but browser `fetch` and `XMLHttpRequest` don't support it, so full simulation can't pass such parameters.

    With `minigame-std`, you can write code like this, and platform-specific parameters will be automatically ignored on other platforms:

    ```ts
    fetchT(url, {
        mode: 'no-cors', // Browser-specific
        enableHttpDNS: true, // Mini-game-specific
    });
    ```

    Another example: `wx.request` returns an abortable `RequestTask`, while `fetch` returns a `Promise<Response>` that requires an additional `AbortController` to abort. If you simulate `wx.request` to return `Promise<Response>`, you lose the abort functionality.

    `minigame-std`'s `fetchT` follows the `wx.request` design, with an `abortable` parameter to control abort functionality:

    ```ts
    fetchT(url, {
        abortable: true,
    }).abort();
    ```

-   **No Runtime Overhead**

    Adapter generates a lot of glue code that gets bundled regardless of usage. If you can call mini-game APIs directly, this glue code is actually a burden and may even hurt performance.

    `minigame-std` doesn't require runtime Adapter injection. Through the build process, it automatically removes code for other platforms, reducing bundle size and improving runtime performance.

    `minigame-std` is developed using ESM and supports tree-shaking, so unused features can be removed during the build, further reducing bundle size.

-   **Additional Features**

    `minigame-std` provides additional features like `base64`, `fs`, etc.

    For platform-exclusive features, implementations are provided for other platforms as well.

    Some common features that aren't natively supported on any platform are gradually being added.

### Can It Replace Adapter?

**Not yet!**

Some DOM Element-related adaptation code still requires Adapter, primarily for game engine usage.

## Mini-Game Platform Support

-   **WeChat Mini-Game**

    100% tested.

-   **Other Mini-Games**

    Since mini-game platforms all use the `wx` global namespace for API calls, other mini-game platforms usually set up a `wx` namespace for WeChat compatibility (e.g., `GameGlobal.wx = qq`), and the APIs are generally consistent, so they are basically supported.

    If you find any differences, please submit an [issue](https://github.com/JiangJie/minigame-std/issues).

## Code Pruning

**`__MINIGAME_STD_MINA__`**

During code bundling, the `__MINIGAME_STD_MINA__` boolean variable controls whether to prune web platform or mini-game platform-specific code. All platform-specific code is side-effect-free and can be safely pruned.

- Set to `true` to prune web platform code, suitable for mini-game builds.
- Set to `false` to prune mini-game platform code, suitable for browser development or web platform builds.

For build configuration examples, see [minigame-std-demo](https://github.com/JiangJie/minigame-std-demo).

## Testing

```bash
pnpm install
pnpm test
```

> [!NOTE]
> Due to testing environment limitations, test cases don't cover all functionality. Coverage is not 100% mainly because some code only runs in the mini-game environment, which cannot be simulated by existing testing tools.

-   **Web Platform Tests**: Test cases in the `tests` directory are based on the web platform (`__MINIGAME_STD_MINA__: false`), using [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) to run in a real browser environment
-   **File System Tests**: For web platform OPFS file system tests, see [happy-opfs](https://github.com/JiangJie/happy-opfs)
-   **Mini-Game Platform Tests**: For mini-game environment test cases, see [minigame-std-demo](https://github.com/JiangJie/minigame-std-demo)

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT](LICENSE)
