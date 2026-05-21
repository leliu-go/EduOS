# Day 5 QA Run Plan

日期：2026-05-21

## 执行顺序

1. 阅读权限矩阵、财务流程、学生/老师/Admin 闭环文档。
2. 写入 Day 5 golden path spec 和测试数据策略。
3. 创建 `scripts/seed-golden-path.ts`，只用于本地/测试库。
4. 补齐低风险 P0/P1 断点：
   - 学生资源下载不得直接暴露 `fileUrl`。
   - 财务退费不能只是一个无效链接，需提供最小申请/审批 UI。
5. 新增 golden path e2e。
6. 运行：
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - 相关 e2e
7. 输出 Admin、老师、学生、财务、跨端一致性和 UX 报告。
8. 提交并尝试 push；如失败，生成 fallback。

## 本地运行 QA Seed

```powershell
$env:EDUOS_ALLOW_GOLDEN_PATH_SEED="true"; pnpm tsx scripts/seed-golden-path.ts
```

## 运行 Golden Path E2E

```powershell
$env:EDUOS_RUN_GOLDEN_PATH_E2E="true"; pnpm test:e2e -- golden-path.spec.ts
```

## 不执行事项

- 不执行 production migration。
- 不连接真实支付、短信、微信推送。
- 不删除真实业务文件。
- 不清空数据库或 OSS。
- 不提交开发提示包。
## Actual Day 5 Run

- Seed command passed locally: `EDUOS_ALLOW_GOLDEN_PATH_SEED=true pnpm tsx scripts/seed-golden-path.ts`.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed: 99 files, 385 tests.
- `EDUOS_RUN_GOLDEN_PATH_E2E=true pnpm test:e2e -- golden-path.spec.ts --workers=1` passed: 4 tests.
- No production migration, production deployment, OSS deletion, real payment provider, SMS provider, WeChat provider, or secret read/print was executed.
