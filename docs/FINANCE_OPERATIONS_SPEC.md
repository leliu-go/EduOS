# EduOS Finance Operations Spec

Date: 2026-05-21

## Scope

Day 3 finance is manual accounting first. EduOS supports人工录入收款, payment ledger review, course-consumption reconciliation, refund workflow, reporting, and a `PaymentProvider` abstraction. It does not connect real WeChat Pay, Alipay, SMS, bank, or card acquiring APIs.

## Enrollment and Renewal

1. Staff creates or reviews an `Order`.
2. The order is linked to a student, optional guardian, optional course product, and optional enrollment.
3. Finance records a manual `Payment`.
4. Confirmed payments update order status when confirmed paid amount reaches the payable amount.
5. CourseAccount and Enrollment remain the source for class/course-hour delivery.

## Manual Payment

- Supported methods: cash, bank transfer, offline WeChat collection, offline Alipay collection, card, and other.
- The user can enter amount, paid date, transaction number, and notes.
- Receipts or vouchers should later be stored as cloud resources through the StorageProvider path, not committed to git.
- 不接真实支付接口 in this stage.
- No client receives payment provider secrets.

## Cash Versus Revenue

收款 Payment 是现金流入，不等于已确认收入. CourseConsumption is the progressive recognition event for delivered lessons. Reports must distinguish:

- confirmed cash received
- pending payments
- course-consumption revenue estimate
- remaining course liability
- refunds
- receivables/debt
- gift hours and adjustments

## Refunds

- Finance creates a refund request.
- Principal/Admin can be the final reviewer by policy.
- Refund approval adjusts CourseAccount through a reversal-like flow and writes audit logs.
- Original orders and payments are not deleted.

## Provider Abstraction

- `PaymentProvider` is the interface boundary.
- `ManualPaymentProvider` is the only Day 3 implementation.
- Future real providers require sandbox credentials, webhook verification, reconciliation policy, and human approval.
