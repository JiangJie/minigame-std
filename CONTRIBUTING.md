# 贡献指南

## 环境要求

- Node `^20.19.0 || ^22.18.0 || >=24.11.0`
- pnpm

## 仓库结构

| 包                       | 说明                                     |
| ------------------------ | ---------------------------------------- |
| `packages/minigame-std`  | 库本体，发布到 npm 与 JSR                |
| `packages/minigame-test` | 小游戏平台测试，需在微信开发者工具中运行 |

## 常用命令

在仓库根目录执行：

| 命令                                            | 作用                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm install`                                  | 安装依赖；首次跑浏览器测试前还需 `pnpm run playwright:install`                  |
| `pnpm run check`                                | 格式检查 + lint + 类型检查，**提交前必须通过**                                  |
| `pnpm run typecheck`                            | 仅类型检查，每包使用本地 tsc（与编辑器一致的参照）                              |
| `pnpm run lint` / `pnpm run fmt`                | 仅 lint / 仅格式化，全仓一次（配置在根 `vite.config.ts`）                       |
| `pnpm test`                                     | 浏览器 + Node 测试                                                              |
| `pnpm --filter minigame-std run test:node`      | 只跑 Node 项目（非 DOM 代码路径）                                               |
| `pnpm run build`                                | 构建所有包                                                                      |
| `pnpm --filter minigame-std run verify:package` | 发布门槛：构建 + 打包 + 消费者视角校验（publint、attw、类型解析、CJS/ESM 冒烟） |
| `pnpm run docs`                                 | 生成 API 文档（TypeDoc）                                                        |

## 工具链

构建、测试、lint 与格式化由 [Vite+](https://viteplus.dev) 单一依赖提供，它内置 Vite 8（Rolldown）、Vitest、tsdown（`vp pack`）、oxlint 与 oxfmt。

- lint / fmt 配置位于仓库根的 `vite.config.ts`，扫描范围是全仓；Vite+ 不支持包级嵌套配置，包的 `vite.config.ts` 只放 test / pack / build 相关配置
- 类型检查有两条通道：`pnpm run check` 内的 tsgo（类型感知 lint + 类型检查），以及 `pnpm run typecheck` 的本地 tsc（与编辑器一致的参照）
- `typescript` 包固定在 6.x：TypeDoc 依赖 TypeScript 的 JS API，而 7.x 只提供 CLI 与 LSP

## 测试

- 两个 Vitest 项目：
  - `browser`：Playwright 驱动的 Chromium，运行除 `tests/event-non-dom.test.ts` 之外的全部用例
  - `node`：只运行 `tests/event-non-dom.test.ts`（无法在真实浏览器中打桩的非 DOM 路径）
- Web 平台测试的覆盖率排除了四个文件：`fs_async.ts` / `fs_sync.ts`（只做委托的包装层）、`mina_fs_async.ts` / `mina_fs_sync.ts`（小游戏实现，由 `packages/minigame-test` 单独覆盖）
- 小游戏环境的测试位于 `packages/minigame-test`，需要在微信开发者工具中运行
- `tests/socket.test.ts` 会与公共 echo 服务器做真实握手（约 30 秒），迭代时可加 `--exclude 'tests/socket.test.ts'` 跳过

## 提交与发布

- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)，用**英文**书写
- 提交前请确保 `pnpm run check` 与 `pnpm test` 通过
- 发布由维护者执行：`packages/minigame-std/package.json` 与 `jsr.json` 的版本号必须同步，`CHANGELOG.md` 一并更新；`npm publish` 会触发 `prepublishOnly`（即 `verify:package`）
- 构建产物的既有约束（`__MINIGAME_STD_MINA__` 保持未解析、`_internal` 共享 chunk、`/*#__PURE__*/` 注释等）见 `AGENTS.md`

## 许可证

贡献的代码以 [MIT](LICENSE) 许可发布。
