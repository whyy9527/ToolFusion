# CI Skeleton (Stage 0‑3)

> **File**: `.github/workflows/ci.yml`  
> **Doc** : `docs/devops/ci-skeleton.md`
>
> 目的：先行搭建一个最小可运行的 GitHub Actions 工作流，只有 **Lint** 与 **Test** 两步。测试阶段暂使用空测试占位，保证流水线可绿。

---

## 1 工作流触发

| 触发器         | 分支              | 说明                                                  |
| -------------- | ----------------- | ----------------------------------------------------- |
| `pull_request` | `main`, `develop` | PR 必须通过此工作流方可合并（配合 Branch Protection） |
| `push`         | `main`, `develop` | 直接推送也跑一次，防止漏网之鱼                        |

---

## 2 运行时要求

- **Node LTS v20** — 与 Expo SDK 兼容
- **Package Manager**：yarn 1.x
- 自动缓存 yarn store (`actions/setup-node@v4 cache: yarn`)

---

## 3 关键 YAML 片段

```yaml
name: CI – Lint & Empty Test

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Use Node 20 & yarn cache
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn # Use yarn's cache

      - run: yarn install --frozen-lockfile # Use yarn install

      # ① Lint：ESLint + Prettier
      - name: Lint
        run: yarn lint # Use yarn script

      # ② 测试：目前为空测试，占位保证命令成功
      - name: Empty Jest Suite
        run: |
          echo "test('placeholder', () => expect(true).toBe(true));" > __tests__/placeholder.test.ts
          yarn test --ci --passWithNoTests # Use yarn script
```

> _`yarn test --passWithNoTests`_ 确保当正式测试文件尚未加入时，流水线依旧返回成功。

---

## 4 后续迭代

1. **替换空测试** ➜ 添加实际单测后删除占位文件
2. **Matrix 并行** ➜ 分离 `lint` 与 `test` Two jobs for fine‑grained缓存
3. **Coverage 上传** ➜ 集成 `codecov/codecov‑action` 将 Jest 覆盖率报告到仪表盘

> 保持 `ci.yml` 极简能让新同学快速理解，再逐步扩展至 Nightly build、Mock 测试等高级阶段。
