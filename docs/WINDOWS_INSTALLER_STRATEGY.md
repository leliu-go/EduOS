# EduOS Windows Installer Strategy

## Decision

PWA first.

EduOS should ship first as one responsive, installable web/PWA app. Windows users
install it from the browser. This keeps the application lightweight and avoids
bundling sensitive or bulky local assets.

## What The User Installs

- A browser-managed PWA shortcut/window.
- The EduOS frontend shell.
- Static app assets governed by the service worker safety rules.

## What The User Must Not Install

- Do not bundle the database.
- Do not bundle node_modules.
- Do not bundle course resources.
- Do not bundle uploaded media, videos, question banks, word books, reports,
  logs, or generated caches.
- Do not bundle production secrets or cloud provider credentials.

## Resource Model

Course resources stay cloud-designed. The local device may cache safe static app
shell files and may download authorized resource files on demand. Resource access
must still pass server-side tenant, role, and ownership checks.

## Desktop Shell Later

Tauri is the preferred desktop-shell candidate if EduOS later needs native
windowing. Electron remains a fallback only when mature native integrations are
worth the larger package and update burden.

A future desktop shell must:

- Load the approved EduOS web URL.
- Avoid local backend/database/resource bundling.
- Avoid embedding secrets.
- Use signed releases and a reviewed update channel.
- Keep logout and cache-clearing behavior testable.

## Release Gate

Before any Windows package is built:

- Code signing requires human approval.
- Installer publishing requires human approval.
- Auto-update provider requires human approval.
- Security review must confirm no backend database, `node_modules`, resources,
  uploads, logs, or credentials are inside the package.
