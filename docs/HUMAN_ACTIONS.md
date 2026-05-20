# EduOS Productization Human Actions

## Cloud Resource Management

- Stage or PZ task: Stage 4 / PZ06-PZ07 cloud resource management
- Risk type: Paid cloud storage, production credentials, and future provider migration
- Risky action intentionally not executed: No paid cloud storage account, bucket, credentials, production provider, or irreversible migration was created.
- Safe fallback implemented: `ResourceStorageProvider` interface, `LocalResourceStorageProvider`, cloud placeholder provider, resource access policy, `.env.example` placeholders, and RFC.
- Files created or updated: `lib/resources/*`, `docs/rfcs/RFC-CloudResourceManagement.md`, `.env.example`
- What the user should do later: choose a storage vendor, create a bucket/container, create least-privilege credentials, define signed URL TTL, then approve a non-destructive migration for provider metadata.
- Whether later tasks can continue: Yes.

## MFA/TOTP Production Crypto

- Stage or PZ task: Stage 6 / PZ09 MFA/TOTP safe first stage
- Risk type: Production secret encryption, backup code hashing, recovery policy, and database migration approval
- Risky action intentionally not executed: No real TOTP secret, QR provisioning URI, encryption key, backup code, KMS resource, production credential, or irreversible migration was created.
- Safe fallback implemented: MFA policy helpers, TOTP placeholder provider, tenant-scoped credential model draft, `.env.example` placeholders, tests, and RFC.
- Files created or updated: `lib/mfa/*`, `tests/mfa-policy.test.ts`, `docs/rfcs/RFC-MFA-TOTP.md`, `.env.example`
- What the user should do later: choose and provision production encryption/KMS, generate backup-code pepper, approve a non-destructive MFA credential migration, define recovery identity checks, and test enrollment/challenge/recovery flows in staging.
- Whether later tasks can continue: Yes.

## Activity Engine Persistence Approval

- Stage or PZ task: Stage 7 / PZ10 Activity Engine first stage
- Risk type: New tenant-scoped activity persistence models, indexes, audit events, and migration rollout
- Risky action intentionally not executed: No Activity Engine Prisma migration, production aggregation job, or reporting data backfill was executed.
- Safe fallback implemented: Activity validation schemas, role-aware activity policy helpers, word check-in progress logic, tests, and RFC.
- Files created or updated: `features/activities/*`, `tests/activity-engine.test.ts`, `docs/rfcs/RFC-ActivityEngine.md`
- What the user should do later: approve activity persistence models, audit event names, reporting indexes, and staged migration rollout.
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
