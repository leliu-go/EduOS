# UI Improvements Completed

Date: 2026-05-22

## Completed

- Added lightweight shared UI primitives:
  - `components/dashboard/PageHeader.tsx`
  - `components/dashboard/FlowStepCard.tsx`
  - `components/mobile/SectionHeader.tsx`
- Student portal:
  - Added a first-viewport "今日优先" task surface on the student home page.
  - Improved student schedule, homework, mistakes, resources, and course-account sections with clearer section headers, counts, and mobile card grids.
  - Kept student pages on authorized data only; no direct OSS URL construction was added.
- Teacher portal:
  - Added a first-viewport "教学优先" action surface on the teacher home page.
  - Improved teacher schedule, homework, and class pages with clearer task counts and section headers.
  - Kept teacher pages scoped to existing server-side teacher queries.
- Admin portal:
  - Unified page headers on workbench, students, classes, scheduling, homework, resources, learning tasks, payments, finance reports, and settings pages.
  - Reworked the finance payments page into a visible order -> payment -> course consumption -> refund flow.
  - Kept Admin sidebar visible and removed non-zero letter spacing from sidebar group labels.
- Testing:
  - Added `tests/e2e/ui-responsive.spec.ts` to check student, teacher, and Admin critical pages at responsive breakpoints when seeded E2E is enabled.
