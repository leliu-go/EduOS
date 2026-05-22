# EduOS Frontend Design Audit

Date: 2026-05-22

## Method

This audit uses the `frontend-skill` principles: real workflow first, existing Tailwind/shadcn primitives first, no decorative template UI, and browser verification across mobile, tablet, and desktop widths.

## Current Strengths

- Desktop Admin keeps a consistent left sidebar and topbar.
- Student, teacher, and parent portals use mobile bottom navigation.
- Most protected routes already have loading, error, and empty-state files.
- Version UI, PWA cache safety, RBAC redirects, and signed resource download routes exist.
- Student and teacher homes already use card/list layouts instead of large tables.

## Main UX Issues

1. Student home shows useful data, but the first screen does not clearly answer "what should I do next?".
2. Teacher home has metrics and sections, but quick execution actions are less prominent than the raw counts.
3. Admin workbench is better than a metric wall, but finance and settings pages still need stronger process guidance.
4. Some pages use repeated ad hoc page headers instead of a shared PageHeader pattern.
5. Mobile schedule and homework pages are functional but lack compact summary strips and page-level next-step guidance.
6. Finance pages explain concepts, but the flow order is not visually obvious: order -> payment -> course account -> consumption -> refund/report.
7. Empty states exist, but they are uneven in specificity.

## Priority Pages

P0/P1 UI priority for this pass:

- Student home, schedule, homework, resources, and me/version entry.
- Teacher home, schedule, homework, classes, and lesson execution entry.
- Admin workbench, payments, settings, and version/update page.

Deferred:

- Full activity authoring redesign.
- Full class/course detail redesign.
- Advanced finance report visualizations.
- Parent portal polish.

## Security Observations

- No UI-only permission enforcement was introduced in this pass.
- Student resources still route through server-side authorization before signed URL generation.
- Service worker keeps `/api`, `/dashboard`, `/teacher`, `/student`, and `/parent` network-only.
- Teacher and student menus remain role-specific.
