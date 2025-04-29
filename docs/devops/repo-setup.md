# Repository Setup Guide

> **Location**: `docs/devops/repo-setup.md`  
> **Audience**: DevOps / Repo Admin  
> **Goal**: Establish a clean, enforceable baseline before the first line of code lands in _ToolFusion_.

---

## 1 Repository Naming

| Pattern             | Example             | Rationale                                                              |
| ------------------- | ------------------- | ---------------------------------------------------------------------- |
| `toolfusion-mobile` | `toolfusion-mobile` | Clear product scope; suffix mirrors platform (mobile / server / docs). |
| `toolfusion-design` | `toolfusion-design` | Keeps UX artefacts isolated while retaining mono‑org discoverability.  |

> 🔖 **Rule**: all repos live under the `ToolFusion` GitHub org; names are _kebab‑case_, lowercase, no spaces.

---

## 2 Branch Protection (`main`)

1. **Require status checks** ‑ _lint / test / mock_ job trio must pass.
   ```text
   Settings → Branches → Branch protection rules → main
      ☑ Require status checks to pass before merging
          ✓ lint-test-mock (GitHub Actions)
   ```
2. **Require PR reviews** – _≥1 approval_; code owners auto‑request for critical paths.
3. **Restrict direct pushes** – only GitHub Apps (e.g., `dependabot[bot]`) allowed.
4. **Require signed commits** (optional but recommended).
5. **Linear history** – _squash_ or _rebase & merge_; disable merge‑commits.

➡️ Create the rule before the first push, so the inaugural commit (README) is merged via PR.

---

## 3 Commit Conventions

We adopt **[Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/)** with _Emoji prefix_ for readability.

| Type       | Emoji | Examples                                      |
| ---------- | ----- | --------------------------------------------- |
| `feat`     | ✨    | `✨ feat: create Workflow Composer drag‑drop` |
| `fix`      | 🐛    | `🐛 fix: handle image >4 MB in Qwen Vision`   |
| `docs`     | 📝    | `📝 docs: add repo‑setup guide`               |
| `chore`    | 🔧    | `🔧 chore: bump Expo SDK 50`                  |
| `test`     | ✅    | `✅ test: add timeout retry scenario TC‑006`  |
| `refactor` | ♻️    | `♻️ refactor: extract ToolRuntime hook`       |

**Commit‑lint** runs in the PR CI pipeline (husky ↔ `commitlint`). Failing messages abort `git commit` locally _and_ block CI.

---

## 4 Issue Label Automation

We use **GitHub Actions ‑ labeler** to tag PRs / Issues based on file paths and title keywords.

### `.github/labeler.yml` (excerpt)

```yaml
# docs / markdown
📝 docs:
  - "**/*.md"

# React Native client code
📱 mobile:
  - "src/**"
  - "app.config.*"

# DevOps & CI files
🚀 ci:
  - ".github/workflows/**"
  - "docker/**"

# Tool adapter layer
🔌 adapter:
  - "src/adapters/**"
```

### Automation Workflow

```yaml
# .github/workflows/auto-label.yml
name: Auto‐Label
on:
  pull_request_target:
    types: [opened, synchronize, reopened]
permissions:
  contents: read
  pull-requests: write
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v5
        with:
          configuration-path: .github/labeler.yml
          sync-labels: true
```

_Issues_ use **GitHub Forms** templates; each template pre‑selects a default label (e.g., `bug`, `feat‑request`).

---

## 5 Checklist (Repo Admin)

- [ ] Create repo under ToolFusion org using correct name.
- [ ] Push initial `README.md` via PR to trigger protection checks.
- [ ] Configure _main_ branch protection (section 2).
- [ ] Enable **Commit sign‑off** & **Squash merge**.
- [ ] Add `.github/labeler.yml` & `auto-label.yml`; verify on a test PR.
- [ ] Add `commitlint` + husky pre‑commit hook to root `package.json`.

> With these guard‑rails, every merge is linted, tested, mock‑verified, labelled, and review‑approved — keeping _ToolFusion_ 🚢 ship‑shape from day 0.
