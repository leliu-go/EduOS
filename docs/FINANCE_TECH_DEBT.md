# Finance Tech Debt

Date: 2026-05-25

## P1

- Build a finance reconciliation fixture that covers order, payment, course account, course consumption, refund, and report totals together.
- Add a guided refund approval UI with amount-based policy if the operator wants principal final approval.
- Add export tests for all finance CSV endpoints with `Cache-Control: no-store`.

## P2

- Add CSV export redaction rules if future exports include guardian phone/email or transaction references.
- Split finance report formatting from aggregation if report variants grow.
- Add a provider sandbox interface before any real payment integration.

