# EduOS 测试数据策略

日期：2026-05-21

## 原则

- 测试数据只能使用虚拟姓名、虚拟邮箱和虚拟手机号。
- 所有 Day 5 验收数据使用 `QA_` 或 `qa-` 前缀，便于识别。
- 不允许使用真实学生姓名、手机号、身份证号、学校隐私或真实付款信息。
- 不允许在测试中连接真实支付、短信、微信推送或生产 OSS 删除能力。
- 不允许通过 `prisma migrate reset`、`drop database`、`truncate` 清理数据。

## 租户与账号

Day 5 使用独立 QA 租户：

- Tenant: `EduOS QA Academy`
- Slug: `eduos-qa-academy`
- Campus: `济南测试校区`
- Admin: `qa-admin@eduos.test`
- Finance: `qa-finance@eduos.test`
- Academic: `qa-academic@eduos.test`
- Teacher: `qa-teacher-math@eduos.test`
- Student: `qa-student-001@eduos.test`
- Parent: `qa-parent-001@eduos.test`

本地默认测试密码为 `EduOS-qa-123456`，也可通过 `EDUOS_QA_PASSWORD` 覆盖。该密码只用于本地/测试环境，不得用于生产。

## Seed 脚本

新增脚本：`scripts/seed-golden-path.ts`。

运行前必须显式设置：

```bash
EDUOS_ALLOW_GOLDEN_PATH_SEED=true pnpm tsx scripts/seed-golden-path.ts
```

Windows PowerShell：

```powershell
$env:EDUOS_ALLOW_GOLDEN_PATH_SEED="true"; pnpm tsx scripts/seed-golden-path.ts
```

安全策略：

- 脚本要求 `DATABASE_URL` 存在。
- 脚本在 `NODE_ENV=production` 时拒绝运行。
- 脚本只使用 upsert / find-first-then-update，不做清库。
- 脚本不会读取或打印 `.env.production.local`。

## 清理策略

Day 5 不提供自动删除脚本。需要清理时，应在本地测试库中按 `tenant.slug = eduos-qa-academy` 人工审核后处理，不允许对生产库执行批量删除。
