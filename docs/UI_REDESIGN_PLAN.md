# UI Redesign Plan

Date: 2026-05-22

## Approach

This pass focuses on low-risk UI improvements that reuse existing data, routes, RBAC, and server actions.

## Implementation Order

1. Add lightweight shared UI components for dashboard headers, flow cards, and mobile section headers.
2. Improve student home, schedule, and homework pages as a learning task app.
3. Improve teacher home, schedule, and homework pages as a teaching execution workbench.
4. Improve Admin workbench, finance payment ledger, settings, and version page.
5. Add responsive E2E checks for student, teacher, and Admin pages.
6. Run lint, typecheck, unit tests, and relevant E2E.

## Non-Goals

- No production migration.
- No cloud deploy.
- No new payment/SMS/WeChat provider.
- No large UI library.
- No broad refactor of RBAC or database queries.
