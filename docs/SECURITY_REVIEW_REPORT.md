# EduOS Security Review Report

Run date: 2026-05-21

## Review Result

Allow continuation for the productization baseline. No P0/P1 issues were found
in the productization changes that require stopping the run. Production
deployment, real secrets, irreversible migrations, code signing, cloud services,
and installer publishing remain intentionally blocked for human approval.

## Scope Reviewed

- PWA install behavior and service worker caching.
- Version and update metadata endpoints.
- Resource storage provider abstraction and access policy.
- RBAC permission matrix.
- MFA/TOTP policy and placeholders.
- Activity Engine `WORD_CHECKIN` primitives.
- Windows installer strategy.
- Release, update, and rollback process.

## Security Findings

### Tenant And Role Boundaries

- Productization helpers keep tenant checks explicit.
- Students do not receive admin, teacher portal, finance, activity management,
  MFA enforcement, or security policy permissions.
- Parents receive activity/resource viewing only through guardian-bound scopes.
- Teachers receive activity progress/resource permissions only for their own
  assigned scopes.
- Finance receives finance and own-account MFA hardening, but no scheduling or
  activity management.

### PWA And Update Safety

- Service worker rules avoid caching `/api/`, login, dashboard, teacher, student,
  parent, and unauthorized routes.
- Version and update endpoints return public metadata only.
- Update banner is non-disruptive and does not force refresh.

### Resource Safety

- Resource storage is provider-based.
- Local provider is development-only.
- Cloud provider remains a placeholder until credentials and vendor choice are
  approved.
- Resource files are excluded from source/install artifacts.

### MFA Safety

- No real TOTP secret is generated.
- No provisioning URI is generated.
- No backup code is generated or stored.
- No MFA migration is applied.
- Production encryption, backup-code pepper, recovery, and audit behavior are
  documented before implementation.

### Activity Safety

- `WORD_CHECKIN` schemas validate target counts, assignment shape, and
  submissions.
- Students can check in only assigned published activities.
- Parents cannot submit check-ins.
- Resource use requires both activity visibility and resource authorization.
- Persistent activity models and migrations are deferred for review.

### Packaging And Release Safety

- Windows strategy is PWA first.
- Installer docs explicitly forbid bundling database, `node_modules`, course
  resources, media, uploads, logs, caches, and secrets.
- Release scripts are local checks only and perform no deploy, signing, publish,
  or production migration.

## Residual Risks

- Real cloud storage integration still needs vendor-specific security review.
- Parent resource authorization should be tightened during the persisted
  resource assignment model work so the parent actor is checked against a
  concrete guardian relation, not only a precomputed child scope.
- Real MFA implementation needs encryption, hashing, rate limiting, audit logs,
  recovery workflows, and lockout tests.
- Activity persistence needs tenant-scoped indexes, audit logs, and assignment
  constraints.
- E2E runs show a non-blocking `pg` deprecation warning about concurrent
  `client.query()` usage; this should be tracked before upgrading to `pg@9`.
