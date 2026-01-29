# 小游戏测试项目

用于测试 [minigame-std](https://github.com/JiangJie/minigame-std) 在微信小游戏环境下的功能。

## 测试范围

本项目主要测试 minigame-std 中仅能在小游戏环境运行的代码，包括：
- `mina_fs_async.ts` / `mina_fs_sync.ts`：小游戏文件系统的异步和同步实现
- 其他依赖 `wx` API 的小游戏特有功能

> [!NOTE]
> Web 平台的测试用例位于 `packages/minigame-std/tests/` 目录，使用 Vitest + Playwright 运行。

## 开发

```sh
pnpm install
# 开发阶段
pnpm run watch
# 开发完成
pnpm run build
```

使用微信小游戏开发者工具打开项目根目录进行预览。