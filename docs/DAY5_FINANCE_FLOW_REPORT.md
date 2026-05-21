# Day 5 Finance Flow Report

日期：2026-05-21

## 已验证入口

- `/dashboard/payments`
- `/dashboard/course-consumptions`
- `/dashboard/course-accounts`
- `/dashboard/finance-reports`

## 修复项

- P1：退费流程有后端 action，但 UI 入口不完整。
- 修复：支付流水页新增：
  - `RefundRequestDialog`
  - `RefundApprovalPanel`
  - `getRefundWorkflowOptions`

## 当前财务闭环

- 人工收款通过 `PaymentCreateDialog` 创建。
- 退费申请通过 `createRefundRequestAction` 创建。
- 退费审批通过 `approveRefundAction` 扣减课时账户。
- 审批写入 `refund.approve` 与 `courseAccount.refund` audit log。
- 财务报表区分实收、课消收入、未消课余额、退款和应收。

## 仍需后续完善

- 订单/续费仍主要复用报名入口，后续应做专门的订单/续费向导。
- 退费当前是财务审批闭环，校长终审和金额分级审批仍需后续规则。
- 财务报表需要更多筛选和对账导出。
