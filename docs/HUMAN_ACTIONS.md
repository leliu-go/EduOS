# EduOS Productization Human Actions

## Cloud Resource Management

- Stage or PZ task: Stage 4 / PZ06-PZ07 cloud resource management
- Risk type: Paid cloud storage, production credentials, and future provider migration
- Risky action intentionally not executed: No paid cloud storage account, bucket, credentials, production provider, or irreversible migration was created.
- Safe fallback implemented: `ResourceStorageProvider` interface, `LocalResourceStorageProvider`, cloud placeholder provider, resource access policy, `.env.example` placeholders, and RFC.
- Files created or updated: `lib/resources/*`, `docs/rfcs/RFC-CloudResourceManagement.md`, `.env.example`
- What the user should do later: choose a storage vendor, create a bucket/container, create least-privilege credentials, define signed URL TTL, then approve a non-destructive migration for provider metadata.
- Whether later tasks can continue: Yes.

## Day 2 Stage 4 Aliyun OSS Production Setup

- Stage or PZ task: Day 2 Stage 4 / cloud resource management real provider preparation
- Risk type: Paid cloud resource, real OSS bucket, real RAM credentials, production RDS/OSS smoke testing
- Risky action intentionally not executed: No Aliyun console purchase, bucket creation, RAM credential creation, production secret entry, production deployment, or production database migration was executed by Codex.
- Safe fallback implemented: `AliyunOssStorageProvider`, env-only config loading, no-secret validation scripts, `.env.production.example`, private-bucket signed URL flow, local provider, and authorization tests.
- Files created or updated: `lib/storage/*`, `lib/env/production-env.ts`, `lib/resources/download-authorization.ts`, `scripts/check-production-env.ps1`, `scripts/check-storage-provider.ps1`, `.env.production.example`, `docs/CLOUD_RESOURCE_MANAGEMENT.md`, `docs/ALIYUN_DEPLOYMENT_GUIDE.md`, `docs/PRODUCTION_ENVIRONMENT.md`
- What the user should do later: create a private OSS bucket, create least-privilege RAM credentials, set real env vars in `.env.production.local` or a secret manager, run `scripts/check-storage-provider.ps1 -CheckEndpoint`, and approve the production migration/release plan.
- Whether later tasks can continue: Yes.

## MFA/TOTP Production Crypto

- Stage or PZ task: Stage 6 / PZ09 MFA/TOTP safe first stage
- Risk type: Production secret encryption, backup code hashing, recovery policy, and database migration approval
- Risky action intentionally not executed: No real TOTP secret, QR provisioning URI, encryption key, backup code, KMS resource, production credential, or irreversible migration was created.
- Safe fallback implemented: MFA policy helpers, TOTP placeholder provider, tenant-scoped credential model draft, `.env.example` placeholders, tests, and RFC.
- Files created or updated: `lib/mfa/*`, `tests/mfa-policy.test.ts`, `docs/rfcs/RFC-MFA-TOTP.md`, `.env.example`
- What the user should do later: choose and provision production encryption/KMS, generate backup-code pepper, approve a non-destructive MFA credential migration, define recovery identity checks, and test enrollment/challenge/recovery flows in staging.
- Whether later tasks can continue: Yes.

## Day 2 MFA/TOTP Production Enforcement

- Stage or PZ task: Day 2 Stage G / MFA/TOTP first production-ready layer
- Risk type: Production KMS, real TOTP secret provisioning, recovery policy, and staging migration execution
- Risky action intentionally not executed: No production KMS key, real TOTP secret, QR provisioning URI, production challenge enforcement, or production migration was executed.
- Safe fallback implemented: Additive `UserMfaCredential` schema and migration, local development encryption provider, backup-code hashing, MFA audit wrapper, login decision helper, and tests.
- Files created or updated: `prisma/schema.prisma`, `prisma/migrations/20260521001000_add_user_mfa_credentials/migration.sql`, `lib/mfa/*`, `lib/auth/mfa-login.ts`, `tests/unit/mfa.test.ts`, `docs/SECURITY_MFA_PLAN.md`, `docs/MFA_IMPLEMENTATION_STATUS.md`
- What the user should do later: provision KMS or managed key storage, generate and store `MFA_BACKUP_CODE_PEPPER`, approve staging migration, then test enrollment/challenge/recovery flows with high-privilege accounts.
- Whether later tasks can continue: Yes.

## Activity Engine Persistence Approval

- Stage or PZ task: Stage 7 / PZ10 Activity Engine first stage
- Risk type: New tenant-scoped activity persistence models, indexes, audit events, and migration rollout
- Risky action intentionally not executed: No staging/production Activity Engine migration, production aggregation job, external push integration, or reporting data backfill was executed.
- Safe fallback implemented: Additive Activity Engine schema/migration, validation schemas, role-aware policy helpers, word check-in progress logic, server action skeletons, tests, and RFC.
- Files created or updated: `features/activities/*`, `tests/activity-engine.test.ts`, `tests/unit/activity.test.ts`, `prisma/migrations/20260521002000_add_activity_engine/migration.sql`, `docs/ACTIVITY_ENGINE_PLAN.md`, `docs/rfcs/RFC-ActivityEngine.md`
- What the user should do later: approve staging migration rollout, audit event names, reporting indexes, teacher/student UI fixtures, and future progress aggregation.
- Whether later tasks can continue: Yes.

## Windows Installer Publishing

- Stage or PZ task: Stage 8 / PZ14 Windows installer RFC
- Risk type: Code signing, installer identity, native wrapper permissions, auto-update provider, and public publishing
- Risky action intentionally not executed: No Windows installer, desktop shell, code signing certificate, auto-update channel, or store listing was created.
- Safe fallback implemented: Windows installer RFC, PWA-first strategy, and tests that assert database, `node_modules`, and course resources must not be bundled.
- Files created or updated: `docs/rfcs/RFC-WindowsInstaller.md`, `docs/WINDOWS_INSTALLER_STRATEGY.md`, `tests/windows-installer-strategy.test.ts`
- What the user should do later: approve whether a desktop shell is needed, choose code signing and publishing channels, and complete native wrapper security review.
- Whether later tasks can continue: Yes.

## Release Publishing And Rollback Operations

- Stage or PZ task: Stage 9 / PZ15 release, update, and rollback
- Risk type: Production deployment, production database migration, CDN invalidation, forced update, rollback, and release publishing
- Risky action intentionally not executed: No deployment, production migration, code signing, CDN invalidation, forced update, release tag, or public publishing was executed.
- Safe fallback implemented: Release process docs, update manifest spec, rollback plan, and local check scripts that do not deploy.
- Files created or updated: `docs/RELEASE_PROCESS.md`, `docs/UPDATE_MANIFEST_SPEC.md`, `docs/ROLLBACK_PLAN.md`, `scripts/check-release.ps1`, `scripts/release.ps1`, `tests/release-process.test.ts`
- What the user should do later: approve deployment target, migration plan, release channel, rollback target, and update manifest publication before a real production release.
- Whether later tasks can continue: Yes.

When a high-risk item is downgraded, record:

- Stage or PZ task
- Risk type
- Risky action intentionally not executed
- Safe fallback implemented
- Files created or updated
- What the user should do later
- Whether later tasks can continue

## 2026-05-21 Day 3 Product Experience Follow-Ups

- Review the new finance workflow and decide whether order creation/renewal should be a guided wizard in Day 4.
- Decide refund approval policy: finance-only, principal final approval, or amount-based approval tiers.
- Approve whether audit log UI should be exposed to finance staff or only admins.
- Approve when to connect staging release manifest publishing; current UI only reads the safe local manifest endpoint.
- Approve any real payment provider exploration separately. No real payment provider was connected in Day 3.

## 2026-05-21 Day 4 Student/Teacher Experience Follow-Ups

- Review whether resources should also appear as a secondary shortcut on student/teacher home cards after moving the fifth bottom-nav item to "我的".
- Approve the scope for a dedicated student activity page and teacher activity progress page.
- Approve the next iteration of teacher lesson execution page: attendance, resources, homework, classroom performance, and feedback in one flow.
- Approve deeper Playwright coverage using a stable seeded demo database for mobile-role deep links and cross-tenant denial.

## 2026-05-21 Day 5 Golden Path Follow-Ups

- Review the Day 5 QA reports and decide which remaining flow gaps should become Day 6 implementation scope.
- Approve whether the QA golden-path seed data can be used as the stable local/staging demo tenant.
- Approve the refund approval policy: finance-only, principal final approval, or amount-based approval tiers.
- Approve whether to add a guarded QA data cleanup script limited to `qa-*` users and `QA_` records.
- Review the pg deprecation warning before any `pg@9` upgrade.
