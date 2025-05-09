# Test Baseline – Jest + React Testing Library

Location: `docs/qa/test-baseline.md`

---

## 1 目的

为 **Sprint 0‑4** 提供最小可跑通的测试框架基线，确保：

- `yarn test` **开箱即用**，无任何业务依赖即可通过
- 覆盖 React Native 组件渲染、纯函数单测
- 与后续 **coverage gate**、CI 流程兼容

---

## 2 技术栈

| 领域        | 选择                              | 版本 (LTS) |
| ----------- | --------------------------------- | ---------- |
| Test Runner | **Jest**                          | 29.x       |
| RN 渲染助手 | **@testing-library/react-native** | 13.x       |
| 断言库      | Jest 内建                         | –          |
| Mock 服务   | **msw** (安装但未启用)            | 1.x        |
| 类型支持    | `ts-jest` + `@types/jest`         | 29.x       |

---

## 3 前置条件

```bash
# 已全局安装 Node 20 (与 Expo SDK 50 对齐)
node -v   # v20.*

# 项目依赖已安装
yarn install --frozen-lockfile
```

---

## 4 快速开始

### 4.1 运行全部测试

```bash
# 1️⃣ 全量执行 + 行覆盖率
$ yarn test
```

默认脚本在 `package.json`：

```jsonc
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:changed": "jest --findRelatedTests",
  },
}
```

### 4.2 只跑改动文件关联测试

```bash
yarn test:changed path/to/changedFile.tsx
```

### 4.3 持续集成 (GitHub Actions)

CI 会使用

```bash
yarn test --ci --runInBand
```

参数说明：

- **--ci** → 禁用 watch 模式、彩色进度条
- **--runInBand** → 单线程序列化执行，避免 GH Actions 并行崩溃

---

## 5 配置文件概览

```text
├── jest.config.ts       # Jest 主配置
├── jest.setup.ts        # 全局 beforeAll / afterEach
├── __mocks__/           # Manual mocks
└── src/__tests__/       # 起始空目录
```

### 5.1 jest.config.ts (最小版)

```ts
import "jest-preset-react-native";
import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-navigation|expo-*|react-native-.*)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
};

export default config;
```

### 5.2 jest.setup.ts

```ts
import "@testing-library/jest-native/extend-expect";

// 可在此处设置全局 mock，例如：
// jest.mock("react-native-mmkv", () => mockMMKV);
```

---

## 6 首个示例测试 (占位)

创建 `src/__tests__/sanity.test.ts`：

```ts
import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

describe("Baseline", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Text>Hello ToolFusion</Text>);
    expect(getByText("Hello ToolFusion")).toBeTruthy();
  });
});
```

运行 `yarn test` 应看到：

```text
PASS  src/__tests__/sanity.test.ts
 ✓ renders without crashing (XX ms)
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   100   |    100   |   100   |   100   |
----------|---------|----------|---------|---------|-------------------
```

---

## 7 常见问题

| 症状                                                | 解决方案                                             |
| --------------------------------------------------- | ---------------------------------------------------- |
| `ReferenceError: regeneratorRuntime is not defined` | 确保 `@babel/runtime` 已安装                         |
| RN 原生模块无法解析                                 | 在 `jest.setup.ts` 添加 `jest.mock` 伪实现           |
| 覆盖率报告空白                                      | 检查 `collectCoverageFrom`、`testMatch` 路径是否正确 |

---

## 8 后续路线

1. **Sprint 1**：为 `CreateTool` hooks 补充单测
2. **Sprint 2**：接入 MSW + integration 套件
3. **Sprint 3 +**：覆盖率门槛从 80 % ↑ 90 %

> **更新记录** > _2025‑04‑29_ – v0.1 by QA Lead
