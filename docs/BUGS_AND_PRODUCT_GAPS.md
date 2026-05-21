# Bugs And Product Gaps

日期：2026-05-21

## P0

- 已修复：学生资源详情页旧 `fileUrl` 直接打开风险。现在下载必须走 `/student/resources/[resourceId]/download` 服务端验权 route。

## P1

- 已修复：财务退费入口只有链接没有表单。现在支付流水页有退费申请和待审核审批入口。
- 待补：学生课程详情页不完整。
- 待补：老师上课页未把点名、资源、作业、反馈整合成一个闭环。
- 待补：活动系统缺少学生端和老师端独立页面。
- 待补：订单/续费需要专门向导。

## P2

- 财务高级筛选、对账状态、报表钻取。
- 更多 Playwright 对真实 UI mutation 的覆盖。
- 权限拒绝页角色化文案。
# Day 5 Verification Notes

- Fixed P0: student resource detail no longer exposes legacy `fileUrl` directly; authorized resources use the server download route.
- Fixed P1: finance refund request and approval UI exists on the payment ledger.
- Fixed P1: observed Prisma `Decimal` payloads are no longer passed into client components on the golden-path routes.
- Remaining P1: golden-path E2E still needs full mutation form submissions instead of page-health checks.
