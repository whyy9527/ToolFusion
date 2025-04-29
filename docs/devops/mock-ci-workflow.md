# Mock CI Workflow

> **Scope**: This document describes the additional **`mock`** job added to our GitHub Actions pipeline alongside existing **lint** and **test** jobs. It also records the required Node version and the caching strategy used to speed‑up installs.

---

## 1 Job Matrix

| Job Name | Purpose | Triggers |
|----------|---------|----------|
| **lint** | Run ESLint & Prettier checks to enforce code style | `pull_request`, `push` to `main`, `develop` |
| **test** | Execute Jest unit tests and collect coverage | Same as **lint** |
| **mock** | Spin up **Mock Adapter** (in‑memory) and run contract / integration tests that hit the Tool calling interface | Same as **lint** |

> The **mock** job guarantees that front‑end devs can iterate without calling real DeepSeek/Qwen endpoints during PR review.

---

## 2 Runtime Requirements

| Setting | Value |
|---------|-------|
| **Node.js** | **v20.x** (LTS) – aligns with Expo SDK 50 support |
| **Package Manager** | Yarn 3 (Berry) |

### Why Node 20?

* Expo EAS & React Native 0.74 officially test against Node 20.
* Node 18 EOL is 2025‑04‑30 → future‑proof for MVP cycle.

---

## 3 Caching Strategy

* **Yarn Cache** – handled automatically by `actions/setup-node@v4` when `cache: yarn` is set.
* **Expo / EAS** – not required for the mock job; full builds run in the nightly workflow.
* **Paths cached**
  * Linux: `~/.cache/yarn` (package tarballs)
  * Project: `.yarn/cache` (Plug’n’Play artefacts)

Caches key off **`node-version + yarn.lock`** hash to ensure invalidation when dependencies change.

---

## 4 Key Workflow Snippet

```yaml
name: PR Check – Lint / Test / Mock

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-test-mock:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    strategy:
      matrix:
        job: [lint, test, mock]
    steps:
      - uses: actions/checkout@v4

      - name: Use Node 20 & Yarn cache
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn

      - run: yarn install --immutable

      - name: Run ${{ matrix.job }}
        run: |
          case "${{ matrix.job }}" in
            lint) yarn lint ;;
            test) yarn test --ci ;;
            mock) yarn test:mock ;;   # invokes jest/integration hitting mock‑adapter
          esac
```

*The matrix allows the three checks to run **in parallel** while sharing the same cache layer.*

---

## 5 Next Steps

1. Merge this doc and the workflow YAML into `main`.
2. Verify first run in PR – expected checks: ✅ lint, ✅ test, ✅ mock.
3. Add required **branch protection** so all three jobs must pass before merge.
