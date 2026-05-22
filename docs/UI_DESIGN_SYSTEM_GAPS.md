# UI Design System Gaps

Date: 2026-05-22

## Gaps Found

- No shared dashboard `PageHeader`, causing repeated header markup and uneven action placement.
- No shared dashboard flow/action card for process-heavy pages such as finance.
- Mobile pages have bottom nav and task cards, but lack a shared section header and summary rhythm.
- Status colors are mostly consistent but not fully documented.
- Empty states exist, but page-specific next actions are not standardized.

## Low-Risk Design System Additions

- `components/dashboard/PageHeader.tsx` for desktop page title, description, badges, and action groups.
- `components/dashboard/FlowStepCard.tsx` for operation flows such as finance and workbench next steps.
- `components/mobile/SectionHeader.tsx` for mobile section title, helper copy, badges, and actions.
- Small documentation additions for card, button, badge, empty-state, and responsive rules.

## Constraints

- Keep Tailwind and existing shadcn-style primitives.
- Do not introduce a large UI library.
- Do not create a parallel design system.
- Do not change RBAC or tenant logic for visual reasons.
