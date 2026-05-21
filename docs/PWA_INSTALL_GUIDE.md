# EduOS PWA Install Guide

EduOS uses one EduOS PWA for administrators, finance staff, academic staff, teachers, students, and parents. Everyone installs the same cloud-hosted app and uses the same login screen. Server-side RBAC sends each account to the correct dashboard after login.

## Install

1. Open the EduOS cloud URL in Chrome or Edge.
2. Sign in with your EduOS account.
3. Use the browser install button or the EduOS install prompt.
4. Launch EduOS from the desktop or start menu.

## Cache And Privacy Rules

Do not cache login pages, auth/session data, `/api/` responses, admin pages, teacher pages, student pages, parent pages, finance data, private student data, or full resource libraries.

The service worker only caches public static shell assets such as the app icon,
manifest, and Next.js static chunks. It does not precache `/`, login pages,
role dashboards, `/api/` responses, admin-only routes, student privacy data,
finance data, signed resource URLs, or resource authorization responses.
Business pages and protected data stay network-only and permission-checked on
the server.

In local development on `localhost`, `127.0.0.1`, or `::1`, EduOS unregisters
the service worker and clears EduOS caches so old development CSS or JavaScript
cannot hide the admin sidebar or mask UI changes.

## Resource Policy

Course resources, videos, word books, question banks, and uploaded files are cloud-managed. Local devices may only cache authorized resources on demand after server-side permission checks.

## Recommended Distribution

Use PWA first. A future Windows installer should only be a lightweight shell for the same cloud app and must not bundle the database, backend, `node_modules`, or resources.
