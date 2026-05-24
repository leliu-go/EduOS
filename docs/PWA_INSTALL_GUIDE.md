# EduOS PWA Install Guide

EduOS uses one EduOS PWA for administrators, finance staff, academic staff, teachers, students, and parents. Everyone installs the same app and uses the same login screen. Server-side RBAC sends each account to the correct dashboard after login.

## Install

1. Open the EduOS cloud URL in Chrome or Edge.
2. Sign in with your EduOS account.
3. Use the browser install button or the EduOS install prompt.
4. Launch EduOS from the Windows start menu, browser app list, taskbar, or desktop shortcut if the browser creates one.

Browser vendors decide where the installed PWA entry appears. If no desktop icon appears, search `EduOS` in the start menu and pin it to the taskbar or create a shortcut manually.

## Cache And Privacy Rules

Do not cache login pages, auth/session data, `/api/` responses, admin pages, teacher pages, student pages, parent pages, finance data, private student data, or full resource libraries.

The service worker only caches public static shell assets such as the app icon, manifest, and Next.js static chunks. It does not precache `/`, login pages, role dashboards, `/api/` responses, admin-only routes, student privacy data, finance data, signed resource URLs, or resource authorization responses. Business pages and protected data stay network-only and permission-checked on the server.

In local development on `localhost`, `127.0.0.1`, or `::1`, EduOS unregisters the service worker and clears EduOS caches so old development CSS or JavaScript cannot hide the admin sidebar or mask UI changes.

## Resource Policy

Course resources, videos, word books, question banks, and uploaded files are cloud-managed. Local devices may only cache authorized resources on demand after server-side permission checks.

## Recommended Distribution

Use PWA first. A future Windows installer should only be a lightweight shell for the same cloud app and must not bundle the database, backend, `node_modules`, or resources.

## Production URL

The formal installation target is `https://eduos.study-go.top`. HTTPS is required for a reliable production PWA install experience.

## Role-Specific Install Notes

- Admin/principal: install the same PWA, then log in and enter `/dashboard`.
- Teacher: install the same PWA, then log in and enter `/teacher`.
- Student: install the same PWA, then log in and enter `/student`.
- Parent: install the same PWA, then log in and enter `/parent`.

The installed client is unified. It does not contain role-specific data. Server-side RBAC and `tenantId` checks decide what each account can load.

## Version And Cache

- Version is visible in the admin sidebar and student/teacher "Me" pages.
- Admin settings provide "版本信息" for the current deployed server build.
- Current updates are handled by the operator on the server through `git pull`, build, and PM2 restart.
- Users refresh or reopen the installed PWA after the server is updated.
- EduOS no longer shows a manual "检查更新" control while updates are server-side.
- Student and teacher "Me" pages include a cache cleanup entry for installed clients.
