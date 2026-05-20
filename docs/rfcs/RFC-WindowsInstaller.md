# RFC: Windows Installer Strategy

Date: 2026-05-21

## Status

RFC only. No installer, desktop wrapper, code signing certificate, store listing,
auto-update channel, or production publishing step is created in this stage.

## Recommendation

Use **PWA first** for EduOS installation on Windows.

EduOS is a multi-role web/PWA system. The safest first production packaging model
is to install the PWA from the browser while keeping the backend, database, and
resource storage on approved cloud or institution-managed infrastructure.

## Hard Packaging Rules

- Do not bundle the database.
- Do not bundle node_modules.
- Do not bundle course resources.
- Do not bundle videos, question banks, word books, uploads, generated reports,
  local caches, or logs.
- Do not embed production service keys or cloud credentials.
- Do not split EduOS into separate principal, teacher, student, or parent apps.
- Resource files must remain cloud-designed, with local cache and on-demand
  download only.
- Code signing requires human approval.

## Options Compared

| Option | Fit | Benefits | Risks |
| --- | --- | --- | --- |
| PWA first | Recommended | Small install surface, one app, automatic browser updates, no bundled backend data | Requires HTTPS and browser PWA support |
| Tauri shell | Later option | Smaller than Electron, can wrap the cloud EduOS URL, native window controls | Requires installer pipeline, code signing, update channel, native QA |
| Electron shell | Last resort | Mature desktop ecosystem, easier deep native integration | Larger package, more attack surface, more update/signing work |

## PWA-First Scope

The Windows install experience should use:

- Existing PWA manifest.
- Existing service worker that avoids sensitive API/role-data caching.
- Browser install prompt.
- Version/update metadata endpoints.

No extra Windows package is required for the first production demonstration.

## Tauri/Electron Future Scope

If a desktop shell is later approved, it should:

- Open the cloud EduOS URL.
- Display the app version and update status.
- Use OS-safe storage only for non-sensitive preferences.
- Avoid local backend, local database, bundled resources, and secret material.
- Use a reviewed auto-update mechanism and signed releases.

## Human Approval Required

- Code signing certificate purchase or organization enrollment.
- Windows installer identity and publisher metadata.
- Release channel and auto-update provider.
- Security review for native wrapper permissions.
- Store listing, if publishing through Microsoft Store.
- QA matrix for Windows versions, install/uninstall, updates, rollback, and
  account logout behavior.
