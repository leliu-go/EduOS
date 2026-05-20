# EduOS Productization Overnight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade EduOS from MVP to a safer productization baseline without splitting the single multi-role app or executing high-risk external operations.

**Architecture:** Keep Next.js App Router, Prisma, server-side RBAC, and one login entry. Add productization features as small feature modules: PWA shell, version/update metadata, storage provider abstraction, MFA policy scaffolding, and generic Activity Engine primitives. High-risk cloud, installer, deployment, signing, production secrets, and irreversible migration work is downgraded to RFCs, local providers, and human action records.

**Tech Stack:** Next.js App Router, TypeScript strict mode, Prisma, PostgreSQL schema draft, Zod, Vitest, Playwright, pnpm.

---

### Task 0: Rules And Documentation Bootstrap

**Files:**
- Modify: `AGENTS.md`
- Create or update: `docs/OVERNIGHT_PROGRESS.md`
- Create or update: `docs/BLOCKERS.md`
- Create or update: `docs/HUMAN_ACTIONS.md`
- Copy: `docs/PRODUCTIZATION_OVERNIGHT_TASKS.md`
- Copy: `docs/OVERNIGHT_REVIEW_CHECKLIST.md`
- Copy: `docs/SAFETY_AND_CONTINUE_RULES.md`
- Copy: `docs/RFC_TEMPLATE_PRODUCTIZATION.md`
- Copy: `docs/POST_RUN_SUMMARY_TEMPLATE.md`

- [ ] Merge productization appendix into root rules.
- [ ] Copy overnight package docs into root `docs/`.
- [ ] Initialize progress, blocker, and human-action logs.
- [ ] Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

### Task 1: Size Audit And Artifact Rules

**Files:**
- Create: `docs/SIZE_AUDIT.md`
- Create: `docs/RELEASE_ARTIFACT_RULES.md`
- Modify: `.gitignore`
- Optional create: `.dockerignore`

- [ ] Measure generated caches, reports, local storage, uploads, and dependency directories.
- [ ] Document what belongs in source, deployment, and user install artifacts.
- [ ] Add safe ignore rules for generated local productization artifacts.
- [ ] Run quality gates and update progress.

### Task 2: PWA Install Capability

**Files:**
- Create: `app/manifest.ts`
- Create: `public/sw.js`
- Create: `components/install/install-pwa-prompt.tsx`
- Modify: `app/layout.tsx`
- Create: `docs/PWA_INSTALL_GUIDE.md`
- Test: `tests/pwa-install.test.ts`

- [ ] Add tests for manifest, service worker safety rules, and install prompt registration.
- [ ] Implement one PWA manifest for all roles.
- [ ] Implement a service worker that caches only static shell assets and never caches sensitive API or role data.
- [ ] Add an install prompt component.
- [ ] Run quality gates and update progress.

### Task 3: Version And Update Detection

**Files:**
- Create: `lib/version/app-version.ts`
- Create: `app/api/version/route.ts`
- Create: `app/api/update-manifest/route.ts`
- Create: `components/version/version-badge.tsx`
- Create: `components/version/update-available-banner.tsx`
- Modify: dashboard/mobile shell if safe
- Create or update: `CHANGELOG.md`
- Test: `tests/versioning-updates.test.ts`

- [ ] Test version metadata reads from `package.json`.
- [ ] Add safe JSON endpoints with no secrets.
- [ ] Add a non-disruptive update banner and version badge.
- [ ] Run quality gates and update progress.

### Task 4: Cloud Resource Management First Stage

**Files:**
- Create: `docs/rfcs/RFC-CloudResourceManagement.md`
- Create: `lib/resources/storage-provider.ts`
- Create: `lib/resources/local-storage-provider.ts`
- Create: `lib/resources/resource-access-policy.ts`
- Update or create tests for resource provider and permission checks.

- [ ] Write RFC for production cloud storage without opening paid services.
- [ ] Add provider interfaces and local provider only.
- [ ] Add signed-download placeholder that requires server-side authorization.
- [ ] Record cloud account and credential actions in `docs/HUMAN_ACTIONS.md`.
- [ ] Run quality gates and update progress.

### Task 5: Permission Matrix Upgrade

**Files:**
- Modify: `lib/rbac/permissions.ts`
- Update or create: `docs/PERMISSION_MATRIX.md`
- Test: `tests/rbac-permissions.test.ts`

- [ ] Add productization permissions for activities, MFA/security policy, update/version admin, and resource signed downloads.
- [ ] Verify student, parent, teacher, finance, and admin boundaries.
- [ ] Run quality gates and update progress.

### Task 6: MFA/TOTP Safe First Stage

**Files:**
- Create: `docs/rfcs/RFC-MFA-TOTP.md`
- Create: `lib/mfa/mfa-policy.ts`
- Create: `lib/mfa/totp-placeholders.ts`
- Update: `.env.example`
- Test: `tests/mfa-policy.test.ts`

- [ ] Write RFC for encrypted TOTP secrets, backup code hashing, rate limits, recovery, and tenant policy.
- [ ] Add policy and placeholder interfaces without storing real secrets.
- [ ] Record production encryption-key action in `docs/HUMAN_ACTIONS.md`.
- [ ] Run quality gates and update progress.

### Task 7: Activity Engine First Stage

**Files:**
- Create: `docs/rfcs/RFC-ActivityEngine.md`
- Create: `features/activities/activity-schema.ts`
- Create: `features/activities/activity-policy.ts`
- Create: `features/activities/word-checkin.ts`
- Test: `tests/activity-engine.test.ts`

- [ ] Implement generic activity validation primitives for `WORD_CHECKIN`.
- [ ] Implement role-aware visibility helpers.
- [ ] Keep resource selection behind resource permission policy.
- [ ] Run quality gates and update progress.

### Task 8: Windows Installer RFC

**Files:**
- Create: `docs/rfcs/RFC-WindowsInstaller.md`
- Create: `docs/WINDOWS_INSTALLER_STRATEGY.md`

- [ ] Compare PWA, Tauri, and Electron.
- [ ] Recommend PWA first and lightweight desktop shell only if later required.
- [ ] Record code signing and installer publishing as human actions.
- [ ] Run quality gates and update progress.

### Task 9: Release, Update, Rollback Docs And Scripts

**Files:**
- Create: `docs/RELEASE_PROCESS.md`
- Create: `docs/UPDATE_MANIFEST_SPEC.md`
- Create: `docs/ROLLBACK_PLAN.md`
- Create: `scripts/check-release.ps1`
- Optional create: `scripts/release.ps1` as local checklist only
- Test: `tests/release-process.test.ts`

- [ ] Add local release checks that do not deploy, sign, or publish.
- [ ] Document update manifest and rollback.
- [ ] Run quality gates and update progress.

### Task 10: Final Review And Reports

**Files:**
- Create: `docs/FINAL_PRODUCTIZATION_REPORT.md`
- Create: `docs/SECURITY_REVIEW_REPORT.md`
- Create: `docs/RELEASE_NOTES_DRAFT.md`
- Create or update: `docs/TECH_DEBT.md`
- Update: `docs/OVERNIGHT_PROGRESS.md`
- Update: `docs/BLOCKERS.md`
- Update: `docs/HUMAN_ACTIONS.md`

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm test:e2e` if available.
- [ ] Self-review against `docs/OVERNIGHT_REVIEW_CHECKLIST.md`.
- [ ] Commit and push safe productization changes.
