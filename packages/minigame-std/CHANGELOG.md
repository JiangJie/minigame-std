# 更新日志

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.1] - 2026-01-29

### 文档
- 为所有导出模块添加 JSDoc 文档注释

### 变更
- CI 发布流程添加复制共享文件的步骤

## [2.0.0] - 2026-01-29

### 破坏性变更
- `fs.readFile` 返回类型从 `ArrayBuffer` 改为 `Uint8Array<ArrayBuffer>`
- SHA 系列函数返回类型从 `Promise<string>` 改为 `AsyncIOResult<string>`
- HMAC 系列函数返回类型改为 `AsyncIOResult`
- RSA 加密函数返回类型改为 `AsyncIOResult`
- 重命名 `promisifyWithResult` 为 `asyncResultify`
- 重命名 codec 模块函数以保持命名一致性
- 简化 base64 API 为统一的 `encodeBase64`/`decodeBase64` 函数
- 移除 `tryDOMAsyncOp`/`tryDOMSyncOp`，使用 `tryGeneralAsyncOp`/`tryResult` 代替
- 移除内部 assert 函数的公开导出
- 适配 `@happy-ts/fetch-t` 和 `happy-opfs` 的破坏性变更

### 新增
- 新增 `video` 模块及跨平台 `createVideo` API
- 新增 `fs.writeJsonFile` 和 `fs.writeJsonFileSync` 方法
- 新增 `decodeHex` 函数用于十六进制解码
- 新增 `asyncResultify`、`asyncIOResultify`、`syncIOResultify` 工具函数
- 新增 `fs.zipSync` 内存压缩支持（无文件路径时返回 bytes）
- 新增 `AppendOptions` 支持 `appendFile` 和 `appendFileSync`
- 新增 `ReadOptions`、`ExistsOptions` 支持相应文件操作
- 新增内部验证模块 (`internal/validate`)
- 新增 `encodeHex` 支持字符串输入
- 新增 `ASYNC_RESULT_VOID` 常量
- 新增跨平台高精度计时工具 (`performance`)
- 新增 `video.requestFullScreen` 方法支持屏幕方向锁定
- 导出 `fs.createAbortError` 辅助函数

### 变更
- 许可证从 GPL-3.0 切换到 MIT
- 迁移到 pnpm monorepo 结构
- 构建工具从 Rollup 迁移到 Vite
- 测试框架从 Deno 迁移到 Vitest
- 文档生成从 Markdown 切换到 HTML 格式
- 生成的 API 文档不再提交到仓库，改为通过 GitHub Pages 自动部署
- 使用 `happy-rusty` 的 `Lazy` 和 `Once` 进行延迟初始化
- 重构 codec 模块，将 base64 整合到 codec 模块
- 重构 UTF-8 编码模块到专用子目录
- 重构 SHA/HMAC 实现，提取纯 JS 实现到共享模块
- 统一 `stat` API 在 `recursive=true` 时始终返回 `FileStats[]`
- 统一微信和 Web 平台 API 返回类型
- 简化 `mkdir`：目录已存在时直接返回成功
- 优化 `readDir`：可用时使用 `Array.fromAsync` 提升性能
- 错误处理集中化，使用统一的错误转换函数
- 替换 `tiny-invariant` 为自定义实现
- 更新依赖到最新版本

### 修复
- 修复 UTF-8 解码使用 `fromCodePoint` 替代 `fromCharCode` 处理代理对
- 修复 UTF-8 编码使用 `codePointAt` 正确处理代理对
- 修复 `TextDecoder` 设置 `fatal` 选项以正确处理错误
- 修复 `validateAbsolutePath` 处理多斜杠完整路径
- 修复 `zip` 保留根目录结构
- 修复 `appendFile` 在文件不存在时的处理
- 修复 `getDeviceBenchmarkInfo` 调用前的类型检查
- 修复 `image` 模块加载后撤销 object URL 防止内存泄漏
- 修复 `storage.getLength` 在非 Mina 环境使用 `webGetLength`
- 修复 `Uint8Array` 从 `ArrayBufferView` 创建的优化
- 修复各模块错误类型改进

### 文档
- 重写 README，添加双语支持和详细功能说明
- 新增 CODEBUDDY.md 仓库上下文指南
- 为所有公开 API 添加 `@since` 版本标签
- 完善 JSDoc 文档和 `@example` 示例
- 将 JSDoc 注释从英文翻译为中文

### 测试
- 迁移测试到 Vitest 并大幅扩展测试覆盖率
- 新增 minigame-test 项目用于小游戏平台测试
- 新增 mina 平台各模块的综合测试
- 新增 benchmark 性能测试

## [1.10.0] - 2025-07-31

### 新增
- 新增设备性能评级功能 (`getDeviceBenchmarkLevel`)
- 新增 `promisify` 工具函数，用于将回调式 API 转换为 AsyncResult

### 变更
- 重构平台检测工具函数
- 升级依赖版本

## [1.9.7] - 2025-07-09

### 变更
- 重构 fetch 模块的导入结构

## [1.9.6] - 2025-06-30

### 变更
- 二进制数据的编码参数改为 undefined

## [1.9.5] - 2025-06-18

### 变更
- 重构下载文件时的目录创建逻辑

## [1.9.4] - 2025-06-04

### 修复
- 修复 `fetchT` 的响应类型错误

## [1.9.3] - 2025-05-21

### 新增
- 新增 `storage.hasItem` 和 `storage.hasItemSync` 方法

## [1.9.2] - 2025-05-06

### 变更
- 更新 happy-opfs 到 v1.8.6

## [1.9.1] - 2025-05-06

### 变更
- 使用 `toLowerCase` 来判断平台类型
- 更新依赖

## [1.9.0] - 2025-04-24

### 新增
- 新增更多平台判断方法

## [1.8.8] - 2025-04-21

### 修复
- 修复下载文件前未创建目录的问题

## [1.8.7] - 2025-03-31

### 新增
- `writeFile` 支持 `WriteOptions` 参数

### 修复
- 修复 `mkdir` 在目录已存在时返回成功

## [1.8.6] - 2025-03-31

### 修复
- 修复 `mkdir` 应过滤根目录的问题

## [1.8.5] - 2025-03-18

### 变更
- 更新导出以包含 `happy-opfs` 的所有成员

## [1.8.4] - 2025-02-27

### 修复
- 添加对缺少 `wx.encode` 和 `wx.decode` 方法的兼容处理

## [1.8.3] - 2025-02-19

### 修复
- 当 `wx.getFuzzyLocation` 不存在时回退到 `wx.getLocation`

## [1.8.2] - 2025-01-07

### 修复
- 修复 `wx.getDeviceInfo` 可能不存在的问题

## [1.8.1] - 2024-12-25

### 修复
- 修复文件不存在时 `appendFile` 失败的问题

## [1.8.0] - 2024-12-19

### 新增
- 支持 HMAC 计算
- 新增 `DataSource` 类型别名 (`string | BufferSource`)

## [1.7.1] - 2024-12-13

### 变更
- SHA 方法的键改为字符串类型

## [1.7.0] - 2024-08-23

### 新增
- 新增 `cryptos.random` 模块
- 新增 `addResizeListener` 方法
- 新增 `lbs` (位置服务) 模块
- 新增 `image` 模块
- 新增 `getWindowInfo` 方法

### 变更
- 删除 `getDeviceInfo` 方法

## [1.6.0] - 2024-08-18

### 新增
- 支持更多 SHA 算法
- 支持 SHA1 计算
- 支持 RSA 加密
- 新增 `hexFromBuffer` 方法
- 新增 `bufferSource2U8a` 方法
- 新增 `fs.readJsonFile` 和 `fs.readJsonFileSync` 方法
- `importPublicKey` 支持设置哈希算法
- `publicKeyFromPem` 支持 `hash` 参数

### 变更
- 使用 `rsa-oaep-encryption` 替代 `node-forge`
- 修改 base64 编解码实现
- 部分函数参数从 `ArrayBuffer` 改为 `BufferSource`
- 导出 `SocketReadyState` 常量

## [1.5.2] - 2024-08-13

### 修复
- `fs.downloadFile` 失败时应删除未完成的文件

## [1.5.1] - 2024-08-13

### 修复
- `fs.downloadFile` 当状态码非 2XX 时应返回 Err

## [1.5.0] - 2024-08-12

### 新增
- 支持 WebAudio

### 变更
- 调整部分 API 名称和命名空间

## [1.4.1] - 2024-08-12

### 变更
- `fs.rename` 重命名为 `fs.move`
- 使用 `Result.andThen` 优化流程控制
- 重命名 `move` 的参数

## [1.4.0] - 2024-08-09

### 新增
- 新增 `zipFromUrl` 方法，支持压缩到内存
- 新增 `unzipFromUrl` 方法
- `fs.downloadFile` 支持下载到临时文件
- `fs.downloadFile` 支持 `onProgress` 回调
- `fs.copyFile` 自动创建目标目录
- 支持 `fs.copy` 和 `fs.copySync`
- fetch 支持 `onChunkReceived` (或 `onChunk`)

### 变更
- 使用 `Uint8Array` 进行 base64 编解码
- 使用 `BufferSource` 替代 `ArrayBuffer | ArrayBufferView`
- `encode` 返回 `Uint8Array`

### 修复
- 修复临时路径断言失败的问题

## [1.3.0] - 2024-08-06

### 新增
- 实现 `fs.zip` 方法
- 实现 `fs.zipSync` 和 `fs.unzipSync` 方法
- 新增 `fs.unzip` 方法

### 变更
- `minaErrorToError` 重命名为 `miniGameFailureToError`
- 同步 `fs` API 改为抛出 Error

## [1.2.0] - 2024-08-06

### 新增
- 新增 `storage.getLength` 方法
- 导出 `utils` 模块

### 变更
- `storage` 方法返回 `Result` 类型
- 统一 `clipboard` 方法的返回值
- `socket` 的 `send` 方法返回 `RESULT_VOID`
- 修改 `fs` 方法的返回值
- `toErr` 重命名为 `fileErrorToResult`

## [1.1.0] - 2024-08-04

### 新增
- 新增 fs 同步方法
- 使用 Future 模式

### 变更
- 测试工具切换到 Deno
- 整理 `fs` 代码结构
- 使用 `AsyncOption` 类型
- 优化 `emptyDir`
- `remove` 在文件不存在时返回成功
- 更新 ESLint 到 v9

## [1.0.9] - 2024-07-26

### 新增
- 导出 `NetworkType` 类型
- 支持获取网络类型和监听变化
- `addListener` 返回 `removeListener` 委托
- socket 新增 `readyState` 属性
- socket 支持 `removeEventListener`

### 变更
- 移除全局类型增强

## [1.0.8] - 2024-07-25

### 变更
- fetch 默认返回 `string | Response`
- 更新 happy-opfs 到 v1.0.17

## [1.0.7] - 2024-07-25

### 变更
- 上传文件时 `name` 参数改为可选

## [1.0.6] - 2024-07-24

### 新增
- 导出所有定义的类型
- fetch 和 download/upload 支持中止操作

### 变更
- 更新 happy-opfs 到 v1.0.13
- 修改 `fetchT` 返回类型

## [1.0.5] - 2024-07-23

### 新增
- 新增请求超时错误 (TimeoutError)

## [1.0.4] - 2024-07-17

### 变更
- 使用 `asErr` 进行类型转换

## [1.0.3] - 2024-07-13

### 变更
- 更新 GitHub Actions 配置
- 重置 typedoc 入口文件名

## [1.0.2] - 2024-06-11

### 新增
- 导出部分接口类型
- 添加代码注释

### 变更
- 移除 rimraf 依赖
- 使用 tiny-invariant

## [1.0.1] - 2024-05-17

### 新增
- 新增 `fs.emptyDir` 方法

## [1.0.0] - 2024-05-15

### 新增
- 首次正式发布
- 支持跨平台 API：小游戏环境 (微信、QQ 等) 和 Web 浏览器
- 模块包括：
  - `base64` - Base64 编解码
  - `clipboard` - 剪贴板操作
  - `codec` - 文本编解码 (UTF-8)
  - `cryptos` - 加密功能 (MD5, SHA)
  - `fetch` - HTTP 请求
  - `fs` - 文件系统操作
  - `network` - 网络状态检测
  - `platform` - 平台检测
  - `socket` - WebSocket
  - `storage` - 本地存储

[2.0.1]: https://github.com/JiangJie/minigame-std/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/JiangJie/minigame-std/compare/v1.10.0...v2.0.0
[1.10.0]: https://github.com/JiangJie/minigame-std/compare/v1.9.7...v1.10.0
[1.9.7]: https://github.com/JiangJie/minigame-std/compare/v1.9.6...v1.9.7
[1.9.6]: https://github.com/JiangJie/minigame-std/compare/v1.9.5...v1.9.6
[1.9.5]: https://github.com/JiangJie/minigame-std/compare/v1.9.4...v1.9.5
[1.9.4]: https://github.com/JiangJie/minigame-std/compare/v1.9.3...v1.9.4
[1.9.3]: https://github.com/JiangJie/minigame-std/compare/v1.9.2...v1.9.3
[1.9.2]: https://github.com/JiangJie/minigame-std/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/JiangJie/minigame-std/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/JiangJie/minigame-std/compare/v1.8.8...v1.9.0
[1.8.8]: https://github.com/JiangJie/minigame-std/compare/v1.8.7...v1.8.8
[1.8.7]: https://github.com/JiangJie/minigame-std/compare/v1.8.6...v1.8.7
[1.8.6]: https://github.com/JiangJie/minigame-std/compare/v1.8.5...v1.8.6
[1.8.5]: https://github.com/JiangJie/minigame-std/compare/v1.8.4...v1.8.5
[1.8.4]: https://github.com/JiangJie/minigame-std/compare/v1.8.3...v1.8.4
[1.8.3]: https://github.com/JiangJie/minigame-std/compare/v1.8.2...v1.8.3
[1.8.2]: https://github.com/JiangJie/minigame-std/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/JiangJie/minigame-std/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/JiangJie/minigame-std/compare/v1.7.1...v1.8.0
[1.7.1]: https://github.com/JiangJie/minigame-std/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/JiangJie/minigame-std/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/JiangJie/minigame-std/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/JiangJie/minigame-std/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/JiangJie/minigame-std/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/JiangJie/minigame-std/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/JiangJie/minigame-std/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/JiangJie/minigame-std/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/JiangJie/minigame-std/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/JiangJie/minigame-std/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/JiangJie/minigame-std/compare/v1.0.9...v1.1.0
[1.0.9]: https://github.com/JiangJie/minigame-std/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/JiangJie/minigame-std/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/JiangJie/minigame-std/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/JiangJie/minigame-std/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/JiangJie/minigame-std/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/JiangJie/minigame-std/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/JiangJie/minigame-std/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/JiangJie/minigame-std/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/JiangJie/minigame-std/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/JiangJie/minigame-std/releases/tag/v1.0.0
