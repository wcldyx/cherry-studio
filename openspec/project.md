# Project Context

## Purpose

- Cherry Studio 是一款跨平台桌面客户端，聚合多家大模型服务（OpenAI、Anthropic、DeepSeek、Gemini、Claude 等）并提供本地模型/自建模型接入，让用户获得统一且高效的 AI 对话、文档处理、知识管理与自动化体验。
- 目标：
  1. 降低模型切换和配置成本，提供「一次配置，全端可用」的生产力工具。
  2. 构建可扩展的助手与工具生态（Quick Panel、Inputbar Tools、MCP Server、插件系统）。
  3. 支撑企业级私有化部署（Enterprise Edition）和社区版共创。

## Tech Stack

- Electron + Vite：提供跨平台桌面容器（main / preload / renderer 三进程架构）。
- TypeScript 全栈：所有主进程、渲染层、脚本与包均使用 TS，统一类型体系。
- React 19 + Redux Toolkit + styled-components + Ant Design：渲染层 UI 与状态管理。
- Vercel AI SDK（ai 包）+ 自研 @cherrystudio/ai-core：统一多 Provider 接口、插件与工具调用。
- Node.js >= 22：脚本、后端服务、自动化工具运行环境。
- Monorepo（Yarn workspaces + 多 package）：ai-core、ai-sdk-provider、extension-table-plus、mcp-trace 等独立模块共享同一仓库。

## Project Conventions

### Code Style

- TypeScript + ESLint（@electron-toolkit/eslint-config-ts）+ Biome 格式检查，`yarn lint` 会串联 ESLint、Oxlint、typecheck 与 i18n 检查。
- 组件优先使用函数式写法与 React Hooks，状态通过 Redux/React Query/自定义 hooks 管理。
- 命名强调语义化与单一职责（遵循用户规则：单一职责、就近原则、最小变量、命名准确、层次清晰）。
- 不保留无用代码，减少过度抽象，优先复用既有模块（如服务层、store、hooks）。

### Architecture Patterns

- Electron 三层：
  - `src/main`：主进程、API Server、更新机制、系统集成。
  - `src/preload`：安全桥接（contextBridge）向渲染层暴露受控 API。
  - `src/renderer`：React SPA，包含页面、组件、store、服务层。
- AI Provider 抽象：`packages/aiCore` 通过插件钩子（First/Sequential/Parallel）统一模型调用、工具扩展与生命周期。渲染层通过服务调用 runtime。
- 输入工具体系：Inputbar Tools + Quick Panel + Tools Registry 形成 declarative 工具注册机制，支持菜单、快捷触发、拖拽排序。
- i18n：多语言文案集中在 `resources/data` 及 renderer i18n 配置，由脚本 `sync/update i18n` 维护。
- Monorepo 包与 Electron App 共享同一 TSConfig/工具链，保证类型一致性与复用。

### Testing Strategy

- 单元/集成：`vitest`（`yarn test`, `test:renderer`, `test:main`, `test:aicore`），脚本目录亦有专用测试套件（`scripts` 项目）。
- 端到端：`playwright`（`yarn test:e2e`）覆盖关键用户流程。
- 覆盖率：`yarn test:coverage` 使用 V8 覆盖率报告。
- Lint/格式：`yarn lint`、`yarn format:check`、`oxlint`，CI 中 `build:check` 会运行 lint+test。
- 本地修改需在提交前运行相关测试/静态检查，保证主分支稳定。

### Git Workflow

- 主分支 `main`：仅通过 PR 合入，包含最新开发代码。
- `release/*`：从 `main` 切出，用于版本封版，只接受修复与文档。
- 分支命名规范（详见 `docs/en/guides/branching-strategy.md`）：
  - 功能：`feature/<issue>-<desc>`
  - 修复：`fix/<issue>-<desc>`
  - 文档：`docs/<desc>`
  - 热修复：`hotfix/<issue>-<desc>`（需回合 main 与相应 release）
  - 版本：`release/<version>`
- PR 需关联 issue、补充截图（涉及 UI）、确保同步 main 最新提交并通过全部检查。

## Domain Context

- 产品定位：多模型 AI 助手工作台，支持 300+ 预置助手、文档/知识处理、翻译、图形化知识管理、Mini Program、MCP Server 等。
- 常见场景：多模型并行对话、智能搜索（web search 插件）、知识库问答、图/文档预处理、企业知识集成。
- 工具生态：Inputbar 工具、Quick Panel、Slash Commands、Agents Session、插件系统（MCP、webSearch、logging、toolUse）。
- 企业版延伸：统一模型/知识/权限管理、私有化部署、数据合规、后台运营能力。

## Important Constraints

- 运行环境：Node.js >= 22；Electron 38；需兼容 Windows/Mac/Linux 三平台。
- 许可证：社区版遵循 AGPL-3.0，商业/私有化需联络 bd@cherry-ai.com 获取授权。
- 数据安全：优先本地存储，私有部署可确保数据不出内网；集成第三方 API 时必须尊重各 Provider 的安全与速率限制。
- 构建链路：必须经过 `yarn lint`、`yarn test`、`yarn build`，不可直接在 `main` push。
- 国际化：所有用户可见文案必须提供 i18n key，修改语言包需同步 `resources/data` 与 `docs`。

## External Dependencies

- AI/LLM Providers：OpenAI、Anthropic、Google Gemini、DeepSeek、xAI、Azure OpenAI、OpenRouter、Ollama/LM Studio（本地）、自建 CherryAI、Silicon、302AI、AHubMix、PPO 等（通过 ai-core 抽象）。
- 技术框架：Electron、React、Redux Toolkit、Ant Design、Vercel AI SDK、Drizzle ORM、Playwright、Vitest、Styled-components。
- MCP / 插件：@modelcontextprotocol/sdk、@cherrystudio/embedjs 系列、webdav、Notion API、Claude Agent SDK 等。
- 构建/发布：electron-builder、electron-vite、husky、lint-staged、biome、oxlint。
