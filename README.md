# ToolFusion 项目启动文档

**版本**：v0.2  **日期**：2025‑04‑29  **作者**：AI PM + BA 代理

---

## 1 项目愿景

打造一款移动端 AI 助手，让 **高层管理者与专业人士** 通过自然语言就能 **生成、组合、复用智能工具**，并以 "拼图式工作流" 方式快速完成复杂任务。用户无需学习 prompt，也无需编程。

## 2 产品定位

- **平台优先级**：React Native 手机应用 ➜ **小组件 (Widget)** ➜ iOS App Clip (可选轻量体验)
- **核心卖点**：离线运行、工具可组合、图像识别/生成、专家评分、多轮 Agent 任务链
- **目标用户**：① 医疗影像领域负责人（首批）；② 需要快速决策的 C‑Level；③ 产品/运营/研发跨职能团队

## 3 核心概念：一切皆工具

- **LocalTool**：通过 CreateTool 对话创建的本地工具描述对象
- **ToolRegistry**：保存所有 LocalTool 的索引与元数据
- **Workflow Composer**：可视化拼图界面，用户将工具拖拽组合成工作流
- **内置工具（默认提供）**  
  - DeepSeek 对话工具  
  - Qwen 图像识别工具  
  - Qwen 图像生成工具  
  - ChainAgent （链式拆解‑生成‑自评）工具  
  - ExpertReview 评分工具

> 任何新能力都以 LocalTool 形式加入注册表，再在 Workflow Composer 中拼装。

## 4 主要功能模块

| 模块 | 关键功能 | 依赖 |
|-----|---------|------|
|Tool Registry| 本地 JSON 索引，增删改查 LocalTool | Storage |
|CreateTool 生成器| 对话式创建 LocalTool (封面+配置+prompt) | Chat Core |
|Workflow Composer| 拼图式拖拽连接工具，生成可执行工作流 | Tool Registry |
|Chat Core| 使用 Tool 调用完成对话、Markdown 渲染、R1 思考展示 | Tool Registry |
|History & Storage| 聊天/工作流记录缓存、AI 生成标题、抽屉切换 | Chat Core |
|App Widget| 快速入口：一键触发工作流或创建工具 | Tool Registry |

## 5 LocalTool 配置字段

```ts
interface LocalTool {
  id: string;
  name: string;
  description: string;
  persona: string;      // 使用者画像
  level: 'novice' | 'intermediate' | 'expert' | 'random';
  useCase: string;
  capabilities: string[]; // deepseek_chat | image_recognition | image_generate | chain_agent | expert_review …
  outputFormat: 'markdown' | 'list' | 'table' | 'image_mixed';
  tone: string;
  thinkingMode: string;   // forward, backward, Q&A, SWOT…
  basePromptTemplate: string;
  coverImage: string;     // base64/uri
  createdAt: string;
}
```

## 6 技术架构概览

```
[User] ─▶ [Chat UI] ─▶ [Workflow Composer] ─▶ [Agent Planner]
                    │                       │
                    │                       └─▶ ChainAgent Tool
                    │
                    ├─▶ ToolRegistry (LocalTool JSON)
                    ├─▶ DeepSeek Tool (LLM Local)
                    ├─▶ Qwen Vision Tool (API)
                    ├─▶ ExpertReview Tool (API)
                    └─▶ Storage (MMKV / SQLite)
```

- **前端框架**：React Native + Expo EAS
- **状态管理**：Zustand（轻量）
- **存储**：react‑native‑mmkv（高速）
- **网络**：本地 HTTP 代理或端口直连 DeepSeek

## 7 MVP 里程碑（25 天计划，聚焦工具 & 拼图）

| Sprint | 天数 | 交付重点 |
|--------|-----|----------|
|0 – 架构| 1‑2 | ToolRegistry + 技术目录结构 + CI |
|1 – CreateTool & Widget MVP| 3‑6 | 对话式创建工具 + Widget 入口 |
|2 – Workflow Composer v1| 7‑10 | 拼图式界面 + 工作流执行管线 |
|3 – 内置工具整合| 11‑14 | DeepSeek / Qwen 工具封装注册 |
|4 – ChainAgent & ExpertReview| 15‑18 | 链式 Agent 工具化 + 评分工具化 |
|5 – 历史记录 & 思考展示| 19‑22 | 工作流执行历史缓存 + R1 思路展示 |
|6 – 验收| 23‑25 | 回归测试、App Widget 上架准备 |

## 8 关键 UX 流程

1. 首页 Widget 长按 ▶ 选择“创建工具”
2. 进入对话式引导（≤5 轮）生成 LocalTool
3. 保存工具卡片，进入 Workflow Composer
4. 拖拽多工具组成流程 ▶ 运行 ▶ 结果展示 + 可复盘

## 9 风险与待决

- **Widget 尺寸限制**：功能入口需精简
- **隐私合规**：医疗图像本地处理或签约 BAA
- **工具爆炸**：需分类管理 + 搜索过滤

## 10 下一步行动

1. 冻结技术选型（已确认）
2. 细化 ToolRegistry 数据结构 & API
3. UX 输出 Wireframe（CreateTool + Composer + Widget）
4. DEV 实现 ToolRegistry & CreateTool 对话
5. TEST 编写工具创建与拼图执行用例

---
> **备注**：本 v0.2 文档基于团队反馈更新，删除了个人化描述，突出“一切皆工具”与“小组件优先”的产品战略。

# ToolFusion 项目启动文档

**版本**：v0.3  **日期**：2025‑04‑29  **作者**：AI PM + BA 代理

---

## 0 开发者快捷启动 ⭐️
>
> 仅需 **3 步** 即可在本地运行 ToolFusion MVP：

```bash
# 1. Clone
$ git clone https://github.com/whyy9527/ToolFusion
$ cd ToolFusion

# 2. Install (Node 20 + pnpm)
# corepack enable              # No longer needed with pnpm directly
$ pnpm install --frozen-lockfile # Reads pnpm-lock.yaml

# 3. Run (Expo & Mock 后端)
$ pnpm dev                     # 等同于: expo start -- --mock
#  ↳ 若需真机 / 模拟器
$ pnpm ios                     # iOS Simulator
$ pnpm android                 # Android Emulator
```

> **提示**：默认启用 `--mock` 标志，前端将绑定本地 `scripts/localMock.ts`，无需 DeepSeek/Qwen 真实服务即可开发。

---

## 1 项目愿景

打造一款移动端 AI 助手，让 **高层管理者与专业人士** 通过自然语言就能 **生成、组合、复用智能工具**，并以 "拼图式工作流" 方式快速完成复杂任务。用户无需学习 prompt，也无需编程。

## 2 产品定位

- **平台优先级**：React Native 手机应用 ➜ **小组件 (Widget)** ➜ iOS App Clip (可选轻量体验)
- **核心卖点**：离线运行、工具可组合、图像识别/生成、专家评分、多轮 Agent 任务链
- **目标用户**：① 医疗影像领域负责人（首批）；② 需要快速决策的 C‑Level；③ 产品/运营/研发跨职能团队

## 3 核心概念：一切皆工具

- **LocalTool**：通过 CreateTool 对话创建的本地工具描述对象
- **ToolRegistry**：保存所有 LocalTool 的索引与元数据
- **Workflow Composer**：可视化拼图界面，用户将工具拖拽组合成工作流
- **内置工具（默认提供）**  
  - DeepSeek 对话工具  
  - Qwen 图像识别工具  
  - Qwen 图像生成工具  
  - ChainAgent （链式拆解‑生成‑自评）工具  
  - ExpertReview 评分工具

> 任何新能力都以 LocalTool 形式加入注册表，再在 Workflow Composer 中拼装。

## 4 主要功能模块

| 模块 | 关键功能 | 依赖 |
|-----|---------|------|
|Tool Registry| 本地 JSON 索引，增删改查 LocalTool | Storage |
|CreateTool 生成器| 对话式创建 LocalTool (封面+配置+prompt) | Chat Core |
|Workflow Composer| 拼图式拖拽连接工具，生成可执行工作流 | Tool Registry |
|Chat Core| 使用 Tool 调用完成对话、Markdown 渲染、R1 思考展示 | Tool Registry |
|History & Storage| 聊天/工作流记录缓存、AI 生成标题、抽屉切换 | Chat Core |
|App Widget| 快速入口：一键触发工作流或创建工具 | Tool Registry |

## 5 LocalTool 配置字段

```ts
interface LocalTool {
  id: string;
  name: string;
  description: string;
  persona: string;      // 使用者画像
  level: 'novice' | 'intermediate' | 'expert' | 'random';
  useCase: string;
  capabilities: string[]; // deepseek_chat | image_recognition | image_generate | chain_agent | expert_review …
  outputFormat: 'markdown' | 'list' | 'table' | 'image_mixed';
  tone: string;
  thinkingMode: string;   // forward, backward, Q&A, SWOT…
  basePromptTemplate: string;
  coverImage: string;     // base64/uri
  createdAt: string;
}
```

## 6 技术架构概览

```
[User] ─▶ [Chat UI] ─▶ [Workflow Composer] ─▶ [Agent Planner]
                    │                       │
                    │                       └─▶ ChainAgent Tool
                    │
                    ├─▶ ToolRegistry (LocalTool JSON)
                    ├─▶ DeepSeek Tool (LLM Local)
                    ├─▶ Qwen Vision Tool (API)
                    ├─▶ ExpertReview Tool (API)
                    └─▶ Storage (MMKV / SQLite)
```

- **前端框架**：React Native + Expo EAS
- **状态管理**：Zustand（轻量）
- **存储**：react‑native‑mmkv（高速）
- **网络**：本地 HTTP 代理或端口直连 DeepSeek

## 7 MVP 里程碑（25 天计划，聚焦工具 & 拼图）

| Sprint | 天数 | 交付重点 |
|--------|-----|----------|
|0 – 架构| 1‑2 | ToolRegistry + 技术目录结构 + CI |
|1 – CreateTool & Widget MVP| 3‑6 | 对话式创建工具 + Widget 入口 |
|2 – Workflow Composer v1| 7‑10 | 拼图式界面 + 工作流执行管线 |
|3 – 内置工具整合| 11‑14 | DeepSeek / Qwen 工具封装注册 |
|4 – ChainAgent & ExpertReview| 15‑18 | 链式 Agent 工具化 + 评分工具化 |
|5 – 历史记录 & 思考展示| 19‑22 | 工作流执行历史缓存 + R1 思路展示 |
|6 – 验收| 23‑25 | 回归测试、App Widget 上架准备 |

## 8 关键 UX 流程

1. 首页 Widget 长按 ▶ 选择“创建工具”
2. 进入对话式引导（≤5 轮）生成 LocalTool
3. 保存工具卡片，进入 Workflow Composer
4. 拖拽多工具组成流程 ▶ 运行 ▶ 结果展示 + 可复盘

## 9 风险与待决

- **Widget 尺寸限制**：功能入口需精简
- **隐私合规**：医疗图像本地处理或签约 BAA
- **工具爆炸**：需分类管理 + 搜索过滤

## 10 下一步行动

1. 冻结技术选型（已确认）
2. 细化 ToolRegistry 数据结构 & API
3. UX 输出 Wireframe（CreateTool + Composer + Widget）
4. DEV 实现 ToolRegistry & CreateTool 对话
5. TEST 编写工具创建与拼图执行用例

---
> **备注**：v0.3 新增 “开发者快捷启动” 章节，简化本地上手流程；其余内容沿用 v0.2。欢迎在 PR 中提出改进建议。
