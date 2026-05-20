# EduOS Release Process

## Scope

This release process is a local safety checklist. It prepares EduOS for a human
release review but performs **No deploy**, **No code signing**, **No production
database migration**, and no public publishing.

No production database migration is executed by the local release scripts.

## Preconditions

- One EduOS app serves all roles.
- `package.json` is the version source of truth.
- `/api/version` and `/api/update-manifest` expose public release metadata only.
- Resource storage remains cloud-designed; installers and deployment artifacts
  do not include course resources, uploads, videos, word books, question banks,
  logs, caches, local databases, or secrets.

## Local Release Checklist

1. Update `package.json` version.
2. Update `CHANGELOG.md`.
3. Run `scripts/check-release.ps1`.
4. Run `scripts/check-release.ps1 -RunQualityGates` before tagging.
5. Review `docs/BLOCKERS.md` and `docs/HUMAN_ACTIONS.md`.
6. Confirm rollback instructions in `docs/ROLLBACK_PLAN.md`.
7. Confirm update manifest behavior in `docs/UPDATE_MANIFEST_SPEC.md`.

## Quality Gates

The required local gates are:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Human-Only Production Actions

- Production deployment.
- Production database migration.
- Production secret rotation.
- CDN invalidation.
- Code signing.
- Windows installer publishing.
- Store publishing.
- Paid cloud service changes.

These actions require explicit human approval and should be recorded in
`docs/HUMAN_ACTIONS.md` when deferred.

## Release Evidence

Each release candidate should record:

- Git commit.
- Version.
- Changelog section.
- Quality gate results.
- Known blockers.
- Human-approved operations.
- Rollback target.
