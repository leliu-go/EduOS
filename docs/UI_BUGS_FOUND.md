# UI Bugs Found

Date: 2026-05-22

## Open

- Golden Path UI coverage is still incomplete for Admin-created enrollment, scheduling, attendance, student homework submission, and teacher correction flows.
- Finance E2E can accumulate QA payment records when rerun, which may skew local QA report totals.
- Existing Playwright runs print `NO_COLOR`/`FORCE_COLOR` warnings and a `pg` concurrent query deprecation warning.

## Fixed In This Pass

- Student and teacher home pages did not surface the next most important action clearly enough. Added role-specific priority panels.
- Student/teacher schedule pages used a plain heading and single-column list at tablet width. Added section headers and responsive two-column grids.
- Student homework lacked a quick status summary. Added a small count strip for pending, submitted, and reminder states.
- Teacher homework mixed creation, correction, missing submissions, and correction approval without a summary. Added a count strip and explicit sections.
- Admin critical pages had inconsistent page header patterns. Added shared `PageHeader` usage across the key workbench, finance, scheduling, resource, homework, learning, and settings pages.
- Finance payment page actions were visible but not sequenced. Added a four-step financial workflow overview.
- Admin sidebar group labels used non-zero letter spacing. Reset to normal letter spacing for consistency with the UI rules.
