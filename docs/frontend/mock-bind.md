# Frontend Mock Binding Guide

## 1 Scope

本文档说明在 **ToolFusion** 前端代码中接入 *mock* API 所需的改动：

1. 需修改的组件 / Store 文件
2. 在代码中的插桩（伪代码）位置
3. 对 Zustand 状态管理的影响
4. 如何在开发环境通过 `--mock` 标志触发 mock 接口

> ⚠️ 仅影响开发 / CI 环境；生产包始终调用真实接口。

---

## 2 受影响的文件一览

| 路径                                                        | 作用                            | 关键插入点                     |
| --------------------------------------------------------- | ----------------------------- | ------------------------- |
| `src/modules/CreateTool/CreateToolScreen.tsx`             | 对话式创建工具时根据 flag 切换 API        | 初始化时注入 `apiClient`        |
| `src/modules/WorkflowComposer/WorkflowComposerScreen.tsx` | 拖拽执行工作流 → 查询工具配置              | `useEffect` 加载工具列表        |
| `src/api/index.ts`                                        | 统一导出真实 / mock API             | 文件顶部 flag 判断              |
| `src/stores/toolRegistry.ts`                              | ToolRegistry 读写 → mock 时返回假数据 | `getTools`, `addTool`     |
| `src/stores/config.ts` **(新增)**                           | 全局配置 slice：`mockEnabled`      | 默认 `false`, 由 CLI flag 注入 |

---

## 3 代码插桩示例（伪代码）

### 3.1 CreateToolScreen.tsx

```ts
+ import { useConfigStore } from "../../stores/config";
+
 function CreateToolScreen() {
+   const mock = useConfigStore(s => s.mockEnabled);
+
   // 1. 选择 API 实现
+   const api = mock ? createToolMock : createToolReal;
+
   const handleSend = async (msg) => {
     const res = await api.send(msg);
     // ...
   }
 }
```

### 3.2 api/index.ts

```ts
import * as real from "./real";
import * as mock from "./mock";
import { getMockFlag } from "../utils/env";

export const api = getMockFlag() ? mock : real;
```

### 3.3 toolRegistry.ts (Zustand)

```ts
 const useToolRegistry = create<ToolRegistryState>((set, get) => ({
   tools: [],
   getTools: async () => {
+    if (useConfigStore.getState().mockEnabled) {
+      return mockTools; // 本地 JSON
+    }
     // real implementation
   },
   addTool: async (tool) => {
+    if (useConfigStore.getState().mockEnabled) {
+      set(state => ({ tools: [...state.tools, tool] }));
+      return;
+    }
     // real impl
   }
 }));
```

---

## 4 Zustand 状态管理影响

| Slice             | 字段                     | 描述                                |
| ----------------- | ---------------------- | --------------------------------- |
| **config** *(新增)* | `mockEnabled: boolean` | 启动时根据环境变量写入；只读                    |
| **toolRegistry**  | `getTools`, `addTool`  | 在逻辑内部读取 `config.mockEnabled` 决定分支 |

*所有业务组件仅通过 **`useConfigStore(s ⇒ s.mockEnabled)`** 读取，****禁止****自行解析 env*。

---

## 5 在开发环境启用 mock

### 5.1 CLI 启动

```bash
# yarn scripts
"dev": "expo start -- --mock",
```

- `--mock` 参数被 `scripts/dev.ts` 捕获，并写入 **dotenv**：

  ```ts
  if (argv.includes('--mock')) {
    fs.writeFileSync('.env', 'USE_MOCK=1\n');
  }
  ```

### 5.2 运行时检测

```ts
// utils/env.ts
export const getMockFlag = () =>
  process.env.EXPO_PUBLIC_USE_MOCK === '1' || process.env.USE_MOCK === '1';
```

Expo 会将 `EXPO_PUBLIC_*` 变量注入 JS 环境，保持与原生一致。

---

## 6 注意事项

- **网络拦截 vs 逻辑分支**：mock 方案采用**逻辑分支**，无需安装网络代理。
- **CI 集成**：在 GitHub Actions 中添加 `--mock` 以避免调用外部 API，提升流水线稳定性。
- **覆盖率**：请为 mock 分支编写最小单元测试，防止误删逻辑。

---

> 文档版本 v0.1 • 2025‑04‑29

如有疑问或遗漏，请在 Slack #frontend 频道 @Lead Dev。
