# 小游戏“标准开发库”

> 这不是任何一家小游戏平台的官方项目。

> 以下文档以微信小游戏为例进行说明，其他小游戏平台基本也是一样的（dddd）。

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

首先，小游戏基本都是先在浏览器上进行开发调试，而后再发布到小游戏平台。

进而，如果还想同一套代码同时发布到小游戏平台和 web 平台。

以上差异则是不得不面对的问题，处理这些差异将是一种繁琐的挑战，本项目就是为了抹平这种差异，帮助开发者做到使用相同的 API 兼容不同的平台。

## 特性

* UTF-8 字符串和 ArrayBuffer 之间编解码
* base64 编解码
* 文件系统
* 剪贴板
* 全局 error 和 unhandledrejection 处理
* https 请求（fetch）
* socket（WebSocket）
* storage（localStorage）
* 更多特性正在开发中...

## 和 Adapter 是什么关系

[Adapter](https://developers.weixin.qq.com/minigame/dev/game-engine/workflow/adapter.html) 也是为了适配 wx API 和 DOM/BOM API 的差异，相比 Adapter，minigame-std 具有一些显著的优势。

* Adapter 使用小游戏 API 模拟浏览器特有的 API，但两者在功能上其实并不等价，所以这样会丧失一些小游戏 API 特有的功能。

    比如 `wx.request` 支持 `enableHttpDNS` 参数，但浏览器环境的 `fetch` 和 `XMLHttpRequest` 都不支持，所以完全模拟就无法传递这样的参数。

    使用 `minigame-std` 完全可以这样写，平台特有的参数会被其他平台自动忽略。
    ```ts
    fetchT(url, {
        mode: 'no-cors', // 浏览器特有
        enableHttpDNS: true, // 小游戏特有
    });
    ```

    再如 `wx.request` 的返回值是一个支持 `abort` 的 `RequestTask`，而 `fetch` 的返回值是一个 `Promise<Response>`，需要由额外的 `AbortController` 控制才能实现 `abort` 功能，如果为了模拟而将 `wx.request` 返回 `Promise<Response>`，则将失去`abort` 功能。

    `minigame-std` 的 `fetchT` 沿用了 `wx.request` 的返回值设计，由一个 `abortable` 参数控制是否可abort。
    ```ts
    fetchT(url, {
        abortable: true,
    }).abort();
    ```

* Adapter 会产生很多胶水代码，这些代码不管是否使用都会打进包体，如果能直接调用小游戏 API 的话，这些胶水代码实际上是一种负担，某种情况下甚至是负优化，完全可以舍弃。

    使用 `minigame-std` 不需要在运行时注入 Adapter，通过构建流程可以自动为特定平台去除其他平台的代码，达到节省包体大小和提高运行性能的效果。

    `minigame-std` 使用 ESM 规范开发，支持`tree shake`，没有使用的特性可以在构建时删除，进一步节省包体大小。

* `minigame-std` 额外提供了一些特性，如 `base64` `fs`等。

    对于某些平台独有的特性，也会为其他平台补齐实现。

    所有平台都不原生支持，但一些常用的功能逐渐添加中。

### 能替代 Adapter 吗

**还不能！**

一些 DOM Element 相关的适配代码仍需要 Adapter，主要是游戏引擎需要使用。

## 测试

由于工具的局限性，测试用例并不能覆盖所有功能。

小游戏平台的测试请转到[minigame-std-demo]()