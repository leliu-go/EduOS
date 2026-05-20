# EduOS Productization Overnight Tasks v2

Execute in order. After each PZ task update `docs/OVERNIGHT_PROGRESS.md`, run checks, and continue.

## PZ00 Preflight

- Inspect repo, package.json, next config, Prisma, docs, modules.
- Run lint/typecheck/test.
- Create `docs/OVERNIGHT_PROGRESS.md`, `docs/BLOCKERS.md`, `docs/HUMAN_ACTIONS.md` if missing.
- Do not change business code except trivial script fixes.

## PZ01 Productization Docs

Create/update:
- `docs/DEPLOYMENT_STRATEGY.md`
- `docs/LIGHTWEIGHT_PACKAGING.md`
- `docs/VERSIONING_AND_UPDATES.md`
- `docs/CLOUD_RESOURCE_MANAGEMENT.md`
- `docs/SECURITY_MFA_PLAN.md`
- `docs/ACTIVITY_ENGINE_PLAN.md`
- `docs/PRODUCTIZATION_TASKS.md`
- `docs/PERMISSION_MATRIX.md`

Must state: one app, PWA/cloud first, optional lightweight desktop shell, cloud resources, MFA, activity sync.

## PZ02 Size Audit

Inspect sizes: node_modules, .next/cache, .turbo, .cache, test-results, playwright-report, coverage, dist, logs, public/uploads, storage, local db, resources.

Create/update:
- `docs/SIZE_AUDIT.md`
- `docs/RELEASE_ARTIFACT_RULES.md`
- `.gitignore`
- `.dockerignore` if useful

May safely clean generated caches only after documenting. Do not delete source, migrations, or real uploads.

## PZ03 PWA Install

Implement manifest, icons, safe service worker, install prompt, PWA guide. Do not cache sensitive data. Same PWA for all roles.

Suggested:
- `app/manifest.ts` or `public/manifest.webmanifest`
- `components/install/InstallPwaPrompt.tsx`
- `docs/PWA_INSTALL_GUIDE.md`

## PZ04 Versioning and Updates

Use package.json version as source. Implement safe version endpoint, version badge, admin version page, update manifest/check, non-disruptive update banner, CHANGELOG, release checklist.

Suggested:
- `lib/version/`
- `app/api/version/route.ts`
- `app/api/update-manifest/route.ts`
- `components/version/VersionBadge.tsx`
- `components/version/UpdateAvailableBanner.tsx`
- `CHANGELOG.md`

Do not expose secrets or force refresh active users.

## PZ05 Release and Rollback

Create/update:
- `docs/RELEASE_PROCESS.md`
- `docs/UPDATE_MANIFEST_SPEC.md`
- `docs/ROLLBACK_PLAN.md`
- `scripts/check-release.ps1`
- `scripts/release.ps1` if safe

Do not deploy, push, sign, or publish. Only local safe checks.

## PZ06 Cloud Resource RFC

Create `docs/rfcs/RFC-CloudResourceManagement.md`. Cover metadata tables, storage provider, local provider, production provider placeholders, signed URL, permissions, cache, migration, rollback.

Do not add real cloud SDK/secrets unless safe and justified.

## PZ07 Cloud Resource First Implementation

Implement safe first stage:
- resource metadata model or adapt existing
- storage provider interface
- local dev provider
- configurable production placeholder
- resource list/upload/download through provider
- permission checks
- download log
- cache policy metadata
- tests

Do not commit resources or expose keys. If real cloud provider requires credentials, leave interface and docs, continue.

## PZ08 Permission Matrix Upgrade

Update RBAC and tests for schedule, attendance, resources, homework, mistakes, activities, finance, settings, users, MFA/security policy.

Fix server-side permission gaps. Do not broaden permissions for convenience.

## PZ09 MFA/TOTP RFC

Create `docs/rfcs/RFC-MFA-TOTP.md`. Cover setup, login challenge, backup codes, encryption, rate limit, audit logs, tenant policy, recovery, role policy, migration, rollback.

## PZ10 MFA/TOTP First Implementation

Implement safe first stage:
- MFA settings model
- encrypted TOTP secret storage
- hashed backup codes
- login challenge
- tenant security policy
- admin security settings
- high-privilege MFA status list
- audit logs
- tests

If encryption key is missing, use env placeholder and safe local/dev behavior; document production key requirement in `docs/HUMAN_ACTIONS.md`, continue.

## PZ11 Activity Engine RFC

Create `docs/rfcs/RFC-ActivityEngine.md`. Generic activity model, first type WORD_CHECKIN, admin creation, resource selection, assignment, publish/pause/end, student check-in, teacher/admin progress, permissions, sync via database state.

## PZ12 Word Check-in Activity First Implementation

Implement first stage:
- Activity models/adapt existing
- WORD_CHECKIN type
- admin create/publish
- select word book resource
- assign campus/class/student
- student view/check-in
- teacher own class progress
- admin tenant progress
- audit logs
- tests

Do not add AI scoring, voice recognition, SMS/WeChat, point mall, complex ranking.

## PZ13 Windows Installer RFC

Create:
- `docs/rfcs/RFC-WindowsInstaller.md`
- `docs/WINDOWS_INSTALLER_STRATEGY.md`

Compare PWA, Tauri, Electron. Recommend PWA first; if installer needed, lightweight Tauri shell. Same installer for all roles. Do not implement heavy desktop app yet.

## PZ14 Optional Desktop Shell Preparation

Only if safe and already justified. If it requires new heavy dependency or environment setup, do not implement; create `docs/DESKTOP_SHELL_TODO.md` and placeholders.

If implemented, shell only opens cloud EduOS URL, shows version, has update placeholder. Must not bundle backend/database/resources.

## PZ15 Final Tests and Reports

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Create:
- `docs/FINAL_PRODUCTIZATION_REPORT.md`
- `docs/SECURITY_REVIEW_REPORT.md`
- `docs/RELEASE_NOTES_DRAFT.md`
- `docs/HUMAN_ACTIONS.md`
- update `docs/BLOCKERS.md`
- update/create `docs/TECH_DEBT.md`

Final report must list completed tasks, partial tasks, deferred high-risk items, safe interfaces left behind, tests, security review, recommended deployment/install/update/resource/MFA/activity next steps.
