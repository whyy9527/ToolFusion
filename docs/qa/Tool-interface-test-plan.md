# Tool Interface Test Plan

Location: `docs/qa/tool-interface-test-plan.md`

---

## 1 Scope

This test plan focuses on **interface‑level contracts** between the *mobile client* and all **LocalTool Adapters** (DeepSeek, Qwen Vision, ChainAgent, ExpertReview). It validates:

1. **Parameter schema** – required / optional / default / enum range
2. **Error‑code mapping** – HTTP & business codes → user‑facing status
3. **Timeout & retry policy** – network latency, tool processing time

> **Out‑of‑scope**: UI rendering & state persistence (covered by component / integration suites).

---

## 2 Coverage Targets

| Metric         | Threshold |
| -------------- | --------- |
| **Lines**      | ≥ 90 %    |
| **Branches**   | ≥ 85 %    |
| **Functions**  | ≥ 95 %    |
| **Statements** | ≥ 90 %    |

All new tool adapters **must ship with 100 % happy‑path + 100 % major‑error coverage** before merge.

---

## 3 Test Matrix (High‑level)

| Case ID | Tool         | Scenario                         | Input Params   | Mock / Condition   | Expected Output                                            | Notes             |
| ------- | ------------ | -------------------------------- | -------------- | ------------------ | ---------------------------------------------------------- | ----------------- |
| TC‑001  | Any          | **Missing required param**       | omit `prompt`  | –                  | `Error('Validation:prompt')`                               | Zod schema reject |
| TC‑002  | Any          | **Invalid enum value**           | `level:'guru'` | –                  | `Error('Validation:level')`                                |                   |
| TC‑003  | DeepSeek     | **LLM 4xx**                      | valid          | HTTP 400           | `{ code:'4001', msg:'invalid_key' }` → `ToolError('auth')` |                   |
| TC‑004  | Qwen Vision  | **Image >2 MB**                  | file size 3 MB | –                  | `Error('Validation:fileSize')`                             |                   |
| TC‑005  | ChainAgent   | **Circular dependency detected** | tool A→B→A     | –                  | `Error('Workflow:circular')`                               | composer guard    |
| TC‑006  | Any          | **Timeout**                      | valid          | 15 s network stall | `ToolError('timeout')` after 2 retries                     | config: 5 s \* 2  |
| TC‑007  | ExpertReview | **Service 5xx**                  | valid          | HTTP 500           | auto‑retry 1× then `ToolError('server')`                   |                   |

> **Full detailed case list** lives in `src/__tests__/integration/scenarios/`.

---

## 4 Timeout & Retry Policy

| Step                | Timeout (s)                   | Retries | Back‑off  |
| ------------------- | ----------------------------- | ------- | --------- |
| **HTTP connect**    | 5                             | 2       | 1 s, 2 s  |
| **Tool processing** | DeepSeek : 30Qwen Vision : 45 | 1       | fixed 3 s |

All failures must surface a *typed* `ToolError` with `category`, `code`, `message` fields to the caller.

---

## 5 Sample Jest Snippets (pseudo‑code)

```ts
// ✅  Param schema – missing field triggers Zod error
it('TC‑001 should reject when prompt is missing', () => {
  expect(() => buildDeepSeekRequest({ /* no prompt */ }))
    .toThrowError(/Validation:prompt/);
});
```

```ts
// ✅  Timeout & retry – MSW delays response beyond limit
it('TC‑006 should raise ToolError("timeout") after 2 retries', async () => {
  server.use(
    rest.post('/deepseek/chat', (_req, res, ctx) =>
      res(ctx.delay(15_000), ctx.json({}))
    )
  );
  await expect(callDeepSeek(validParams))
    .rejects.toMatchObject({ category: 'timeout' });
  expect(retrySpy).toHaveBeenCalledTimes(2);
});
```

```ts
// ✅  HTTP 4xx mapping – returns business error code
it('TC‑003 maps DeepSeek 4001 to auth ToolError', async () => {
  server.use(
    rest.post('/deepseek/chat', (_req, res, ctx) =>
      res(ctx.status(400), ctx.json({ code: '4001', msg: 'invalid_key' }))
    )
  );
  await expect(callDeepSeek(validParams))
    .rejects.toMatchObject({ category: 'auth', code: '4001' });
});
```

---

## 6 Reporting

- `pnpm test:interfaces` – runs only `src/__tests__/integration/interfaces.*`
- `coverage/interfaces.html` – uploaded as CI artifact
- Summary comment auto‑posted on PR with matrix ✅/❌.

---

## 7 Ownership

| Area                 | Owner             | Slack Channel |
| -------------------- | ----------------- | ------------- |
| Tool Adapter SDK     | **@QA‑Interface** | #qa-interface |
| MSW Scenario Library | **@QA‑Mock**      | #qa-mock      |
| Coverage Gatekeeper  | **@CI‑Bot**       | #ci           |

---

> Keep this document up‑to‑date. Changes to adapter contracts **must** include corresponding updates to the matrix & sample tests.
