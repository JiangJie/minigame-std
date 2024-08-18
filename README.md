# 小游戏“标准开发库”

[![NPM version](https://img.shields.io/npm/v/minigame-std.svg)](https://npmjs.org/package/minigame-std)
[![NPM downloads](https://badgen.net/npm/dm/minigame-std)](https://npmjs.org/package/minigame-std)
[![JSR Version](https://jsr.io/badges/@happy-js/minigame-std)](https://jsr.io/@happy-js/minigame-std)
[![JSR Score](https://jsr.io/badges/@happy-js/minigame-std/score)](https://jsr.io/@happy-js/minigame-std/score)
[![Build Status](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml)

> [!NOTE]
> 这不是任何一家小游戏平台的官方项目。

> 以下文档以微信小游戏为例进行说明，其他小游戏平台基本也是一样的（dddd）。

---

## 动机

本项目的目的是提供一套能同时运行于小游戏环境和浏览器环境，具有相同 API 的常用开发库。

鉴于小游戏平台通常在运行时之外还有一套官方的基础库（Core），而本项目是基于基础库的再次封装，定位为基础库的补充，希望可以作为“标准开发库（Std）”存在。

按照[微信小游戏](https://developers.weixin.qq.com/minigame/dev/guide/)的官方说法（其他小游戏平台类似），小游戏和浏览器运行环境的主要差别在于没有 BOM 和 DOM API，而提供了类似功能的 wx API，但两者存在较大差异。

比如将 UTF-8 字符串编码为 ArrayBuffer。

**浏览器**

```ts
new TextEncoder().encode(data);
```

**微信小游戏**

```ts
wx.encode({
    data,
    format: 'utf8',
});
```

首先，小游戏基本都是先在浏览器上进行开发调试，而后再发布到小游戏平台；进而，通常同一套代码还会同时发布到小游戏平台和 web 平台。

在这种情况下，以上差异则是不得不面对的问题，处理这些差异将是一种繁琐的挑战，本项目就是为了抹平这种差异，帮助开发者做到使用相同的 API 兼容不同的平台。

## 安装

```sh
# via pnpm
pnpm add minigame-std
# or via yarn
yarn add minigame-std
# or just from npm
npm install --save minigame-std
# via JSR
jsr add @happy-js/minigame-std
```

## 特性

-   平台相关
    ```js
    import { platform } from 'minigame-std';
    ```
-   UTF-8 字符串和 ArrayBuffer 之间编解码
    ```js
    import { textDecode, textEncode } from 'minigame-std';
    ```
-   base64 编解码
    ```js
    import { decodeBase64, encodeBase64 } from 'minigame-std';
    ```
-   文件系统
    - 支持 `zip` `unzip` `zipSync` `unzipSync`
    ```js
    import { fs } from 'minigame-std';
    ```
-   剪贴板
    ```js
    import { clipboard } from 'minigame-std';
    ```
-   全局 error 和 unhandledrejection 处理
    ```js
    import { addErrorListener, addUnhandledrejectionListener } from 'minigame-std';
-   网络状态/类型
    ```js
    import { addNetworkChangeListener, getNetworkType } from 'minigame-std';
    ```
-   https 请求（fetch）
    ```js
    import { fetchT } from 'minigame-std';
    ```
-   socket（WebSocket）
    ```js
    import { connectSocket } from 'minigame-std';
    ```
-   storage（localStorage）
    ```js
    import { storage } from 'minigame-std';
    ```
-   WebAudio
    ```js
    import { audio } from 'minigame-std';
-   加密 md5/sha/rsa
    ```js
    import { cryptos } from 'minigame-std';
    ```
-   更多特性请查看[文档](docs/README.md)

## 和 Adapter 是什么关系

[Adapter](https://developers.weixin.qq.com/minigame/dev/game-engine/workflow/adapter.html) 也是为了适配 wx API 和 DOM/BOM API 的差异，相比 Adapter，minigame-std 具有一些显著的优势。

-   Adapter 使用小游戏 API 模拟浏览器特有的 API，但两者在功能上其实并不等价，所以这样会丧失一些小游戏 API 特有的功能。

    比如 `wx.request` 支持 `enableHttpDNS` 参数，但浏览器环境的 `fetch` 和 `XMLHttpRequest` 都不支持，所以完全模拟就无法传递这样的参数。

    使用 `minigame-std` 完全可以这样写，平台特有的参数会被其他平台自动忽略。

    ```ts
    fetchT(url, {
        mode: 'no-cors', // 浏览器特有
        enableHttpDNS: true, // 小游戏特有
    });
    ```

    再如 `wx.request` 的返回值是一个支持 `abort` 的 `RequestTask`，而 `fetch` 的返回值是一个 `Promise<Response>`，需要由额外的 `AbortController` 控制才能实现 `abort` 功能，如果为了模拟而将 `wx.request` 返回 `Promise<Response>`，则将失去`abort` 功能。

    `minigame-std` 的 `fetchT` 沿用了 `wx.request` 的返回值设计，由一个 `abortable` 参数控制是否可 abort。

    ```ts
    fetchT(url, {
        abortable: true,
    }).abort();
    ```

-   Adapter 会产生很多胶水代码，这些代码不管是否使用都会打进包体，如果能直接调用小游戏 API 的话，这些胶水代码实际上是一种负担，某种情况下甚至是负优化，完全可以舍弃。

    使用 `minigame-std` 不需要在运行时注入 Adapter，通过构建流程可以自动为特定平台去除其他平台的代码，达到节省包体大小和提高运行性能的效果。

    `minigame-std` 使用 ESM 规范开发，支持`tree shake`，没有使用的特性可以在构建时删除，进一步节省包体大小。

-   `minigame-std` 额外提供了一些特性，如 `base64` `fs`等。

    对于某些平台独有的特性，也会为其他平台补齐实现。

    所有平台都不原生支持，但一些常用的功能逐渐添加中。

### 能替代 Adapter 吗

**还不能！**

一些 DOM Element 相关的适配代码仍需要 Adapter，主要是游戏引擎需要使用。

## 小游戏平台的支持情况

-   微信小游戏

    100% 经过测试。

-   其他小游戏

    由于小游戏平台的 API 全部使用 `wx` 全局 namespace 进行调用，其他小游戏平台为了兼容微信小游戏，通常也会设置 `wx` namespace，比如 `GameGlobal.wx = qq`，且 API 会大体保持一致，所以基本也是支持的。

    如发现有差异，请提 [issue](https://github.com/JiangJie/minigame-std/issues)。

## 代码裁剪

**`__MINIGAME_STD_MINA__`**

代码打包时通过设置 `__MINIGAME_STD_MINA__` boolean 变量来控制需要裁剪掉 web 平台还是小游戏平台的专属代码，所有平台特有的代码都是 `side effect free` 的，可以放心裁剪。

设置为 `true` 则裁减掉 web 平台的代码，适合发布小游戏时的构建。

设置为 `false` 则裁减掉小游戏平台代码，适合在浏览器上开发阶段或者发布到 web 平台时的构建。

构建流程可参考 [minigame-std-demo](https://github.com/JiangJie/minigame-std-demo)。

## 测试

```
pnpm install
pnpm test
```

> [!NOTE]
> 由于测试环境的局限性，测试用例并不能覆盖所有功能。

`tests` 目录下的测试用例是基于 web 平台的测试场景，相当于设置 `__MINIGAME_STD_MINA__: false` 的代码，测试工具为支持 web API 同时又兼容 jest API 的 [bun](https://bun.sh/)。

对 web 平台文件系统的测试可以转到 [happy-opfs](https://github.com/JiangJie/happy-opfs)。

小游戏平台的测试用例请转到 [minigame-std-demo](https://github.com/JiangJie/minigame-std-demo)。

## [文档](docs/README.md)