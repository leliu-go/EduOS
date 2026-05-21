# EduOS Finance Workflow

Date: 2026-05-21

## Daily Flow

1. New student or renewal creates an order/enrollment context.
2. Finance opens the payment ledger and clicks `新增收款`.
3. Finance selects the order, enters amount, offline method, paid date, transaction number, and notes.
4. EduOS creates a Payment record and writes an audit log.
5. Confirmed payment updates order status when total confirmed payment covers payable amount.
6. Teacher attendance or academic confirmation creates CourseConsumption.
7. Finance reconciles payment ledger, course-consumption ledger, course-account balances, and reports.

## Course Consumption

- CourseConsumption is the delivery and revenue-recognition signal.
- Course-consumption rows should not be deleted.
- Mistakes are handled through `课消冲正` or adjustment with reason and audit log.

## Refunds

1. Finance clicks `退款申请`.
2. The request records student, course account, optional order/payment, refund hours, amount, and reason.
3. Approval adjusts the course account.
4. Audit logs preserve before/after state.

## Reconciliation

- Payment ledger: cash collection and pending confirmations.
- Course-consumption ledger: delivered course hours and reversals.
- Course accounts: remaining hours and liabilities.
- Finance report: cash, recognized revenue estimate, liability, refunds, debt, and adjustments.
- CSV export is allowed for reports. Uploaded vouchers must use cloud resources, not git.
