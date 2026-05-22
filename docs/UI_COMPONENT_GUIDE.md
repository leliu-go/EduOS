# EduOS UI Component Guide

Date: 2026-05-22

## Dashboard

- Use `PageHeader` for title, description, badge, and page actions.
- Use `FlowStepCard` when a page represents a process such as finance or resource publishing.
- Keep cards at moderate radius with subtle borders and minimal shadow.
- Prefer action groups near the page title for high-frequency operations.
- Use tables for dense back-office data, but provide filters, pagination, and row actions.

## Mobile Portals

- Use bottom navigation for student, teacher, and parent primary sections.
- Use `SectionHeader` before task groups.
- Prefer task cards and timetable cards over tables.
- Keep important actions within the first viewport when possible.
- Leave enough bottom padding so the nav never covers primary buttons.

## Status

- `success`: completed, confirmed, active, safe.
- `warning`: pending, due soon, needs attention.
- `danger`: overdue, failed, unauthorized, destructive.
- `info`: informational, read-only, version, storage.
- `neutral`: archived, not started, no data.

## Empty States

Each empty state should say:

- what is missing;
- why the page is empty;
- what the user can do next, if there is a safe next action.
