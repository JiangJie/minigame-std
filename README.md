# minigame-std

[![License](https://img.shields.io/npm/l/minigame-std.svg)](LICENSE)
[![Build Status](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/minigame-std/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/minigame-std/graph/badge.svg)](https://codecov.io/gh/JiangJie/minigame-std)
[![NPM version](https://img.shields.io/npm/v/minigame-std.svg)](https://npmjs.org/package/minigame-std)
[![NPM downloads](https://badgen.net/npm/dm/minigame-std)](https://npmjs.org/package/minigame-std)
[![JSR Version](https://jsr.io/badges/@happy-js/minigame-std)](https://jsr.io/@happy-js/minigame-std)
[![JSR Score](https://jsr.io/badges/@happy-js/minigame-std/score)](https://jsr.io/@happy-js/minigame-std/score)

小游戏跨平台标准开发库：同一套 API，同时运行在小游戏环境与浏览器环境。

> [!NOTE]
> 这不是任何一家小游戏平台的官方项目。

---

[English](./README.en.md) | [API 文档](https://jiangjie.github.io/minigame-std/)

---

## 为什么需要它

小游戏环境没有 BOM / DOM，只提供 wx API，而它与浏览器 API 差异很大：

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

而且并非所有小游戏平台都实现了 `wx.encode` 这类接口。同一套代码往往先在浏览器上开发调试、再发布到小游戏平台，甚至同时发布到两端，于是这些差异就成了必须处理、又极其琐碎的负担。

minigame-std 以此来抹平差异：用相同的 API 兼容不同平台，并为缺失某些能力的平台提供统一实现。

## 安装

```sh
# npm / pnpm / yarn
pnpm add minigame-std

# JSR
jsr add @happy-js/minigame-std
```

## 快速上手

```ts
import { cryptos, fs, platform } from 'minigame-std';

platform.isMiniGame();                          // 平台检测：true / false
const hash = cryptos.md5('hello');              // 同步 API 直接返回结果

const result = await fs.readFile('a.txt', { encoding: 'utf8' });
if (result.isOk()) {
    console.log(result.unwrap());               // 异步 API 返回 Result
}
```

异步 API 统一返回 [happy-rusty](https://github.com/JiangJie/happy-rusty) 的 `Result`（`IOResult` / `AsyncIOResult`），用 `isOk` / `unwrap` / `mapErr` 等方式处理，不抛异常。

### 必读：`__MINIGAME_STD_MINA__`

发布出去的代码里，`__MINIGAME_STD_MINA__` 是一个**未解析的全局标识符**，需要由你的构建工具替换为**布尔字面量**：

```ts
// vite.config.ts
export default defineConfig({
    define: {
        __MINIGAME_STD_MINA__: true, // 小游戏构建：true；Web 构建：false
    },
});
```

```js
// webpack.config.js
new webpack.DefinePlugin({
    __MINIGAME_STD_MINA__: 'true',
});
```

- `true`：裁掉 web 平台实现，用于发布小游戏
- `false`：裁掉小游戏平台实现，用于浏览器开发或发布到 web

平台特有代码都是 side effect free，可安全裁剪。若构建时未替换，平台代码无法被裁剪，运行时会因未定义标识符报错。详见[代码裁剪](#代码裁剪)。

## 能力概览

| 模块        | 子路径                   | 说明                                                            |
| ----------- | ------------------------ | --------------------------------------------------------------- |
| platform    | `platform`               | 目标平台、设备与机型信息、运行环境判断                          |
| codec       | `codec`                  | UTF-8、Base64、Hex、ByteString 编解码                           |
| cryptos     | `cryptos`、`cryptos/rsa` | MD5、SHA-1/256/384/512、HMAC、随机数、RSA                       |
| fs          | `fs`                     | 文件与目录读写、zip/unzip、下载与上传、JSON 读写（异步 + 同步） |
| storage     | `storage`                | localStorage 风格的本地存储（异步 + 同步）                      |
| clipboard   | `clipboard`              | 剪贴板读写                                                      |
| fetch       | `fetch`                  | 可中断的 HTTP 请求（`fetchT`），兼容各平台特有参数              |
| socket      | `socket`                 | WebSocket 封装，含小游戏 SocketTask                             |
| network     | `network`                | 网络类型查询与变化监听                                          |
| event       | `event`                  | 全局错误、unhandledrejection、前后台与 resize 监听              |
| logger      | `logger`                 | 可插拔日志：级别过滤、文件持久化、微信日志、console 拦截        |
| audio       | `audio`                  | WebAudio 上下文管理与音频播放                                   |
| video       | `video`                  | 视频播放与 VideoFrameSource                                     |
| image       | `image`                  | 图像加载                                                        |
| lbs         | `lbs`                    | 地理位置                                                        |
| path        | `path`                   | POSIX 路径工具                                                  |
| performance | `performance`            | 高精度计时                                                      |
| utils       | `utils`                  | 平台回调 API 的封装工具（`asyncResultify` 等）                  |

每个模块的完整签名与示例见 [API 文档](https://jiangjie.github.io/minigame-std/)，构建流程可参考 [packages/minigame-test](https://github.com/JiangJie/minigame-std/tree/main/packages/minigame-test)。

## 平台支持

- **微信小游戏**：100% 经过测试
- **其他小游戏平台**：小游戏 API 基本都挂在 `wx` 命名空间下，其他平台为了兼容通常会做映射（如 `GameGlobal.wx = qq`）且 API 大体一致，因此基本可用；发现差异欢迎提 [issue](https://github.com/JiangJie/minigame-std/issues)
- **浏览器**：web 实现与测试基准

## 与 Adapter 的关系

[Adapter](https://developers.weixin.qq.com/minigame/dev/game-engine/workflow/adapter.html) 同样是为了抹平 wx API 与 DOM / BOM 的差异，但两者路径不同：

- Adapter 用小游戏 API 模拟浏览器 API，而两者功能并不等价，会丢失小游戏特有参数。比如 `wx.request` 支持 `enableHttpDNS`，浏览器侧没有对应能力，模拟之后就传不进去；再如 `wx.request` 返回可 `abort` 的 `RequestTask`，而 `fetch` 要靠额外的 `AbortController`，一味模拟反而失去该能力。minigame-std 不做模拟，平台特有参数在其他平台自动忽略，`fetchT` 沿用 `wx.request` 的返回值设计并支持 `abortable`：

  ```ts
  fetchT(url, {
      mode: 'no-cors', // 浏览器特有
      enableHttpDNS: true, // 小游戏特有

      abortable: true, // 可中断
  });
  ```

- Adapter 的胶水代码无论是否使用都会进入包体；minigame-std 通过构建期裁剪平台代码来避免这一点，并且是 ESM + tree shake 友好的，未使用的特性会在构建时删除。

**目前还不能完全替代 Adapter**：部分 DOM Element 相关的适配代码（游戏引擎需要）仍依赖它。

## 代码裁剪

### 子路径导入

除根入口外，每个模块都提供独立子路径，两种导入方式的 API 完全一致：

```ts
// 根入口
import { fs, encodeBase64 } from 'minigame-std';

// 等价的子路径导入
import * as fs from 'minigame-std/fs';
import { encodeBase64 } from 'minigame-std/codec';
```

可用子路径：`audio`、`clipboard`、`codec`、`cryptos`、`cryptos/rsa`、`event`、`fetch`、`fs`、`image`、`lbs`、`logger`、`network`、`path`、`performance`、`platform`、`socket`、`storage`、`utils`、`video`。JSR 用户对应 `@happy-js/minigame-std/<subpath>`，如 `@happy-js/minigame-std/fs`。

子路径同样依赖 `__MINIGAME_STD_MINA__` 裁剪平台代码；对于 tree-shaking 较弱的构建工具，子路径导入能更明确地控制进入包体的模块。

## 环境要求

- 使用：任意支持 `define` 替换与 tree-shaking 的构建工具（Vite、webpack、Rollup 等）
- 开发本仓库：Node `^20.19.0 || ^22.18.0 || >=24.11.0`（与 Vite+ 的要求一致）、pnpm

## 开发

```bash
pnpm install
pnpm test        # 浏览器 + Node 测试
pnpm run check   # 格式、lint 与类型检查
pnpm run build   # 构建所有包
```

测试组织、工具链与提交规范的细节见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
