# EduOS Overnight Review Checklist v2

Use after each PZ task and final run.

## Scope

- [ ] Completed only requested scope.
- [ ] No unrelated refactor.
- [ ] No unnecessary dependency.
- [ ] Docs updated.

## Distribution

- [ ] One app, multi-role login.
- [ ] No database/node_modules/resources in installer.
- [ ] Release artifacts exclude caches, logs, uploads, media, secrets.
- [ ] PWA cache does not include sensitive API responses.

## Security

- [ ] Every business query tenantId-scoped.
- [ ] Protected actions server-side RBAC.
- [ ] Student cannot access teacher/admin/finance data.
- [ ] Parent only linked child data.
- [ ] Teacher only own classes/students/resources/activities.
- [ ] Admin cannot cross tenant.
- [ ] Critical mutations audited.
- [ ] No secrets in client.

## MFA

- [ ] TOTP secret encrypted.
- [ ] Backup codes hashed.
- [ ] MFA server-side.
- [ ] MFA events audited.
- [ ] No codes/secrets logged.

## Resources

- [ ] Provider abstraction exists.
- [ ] Signed/download URL after permission check.
- [ ] Students cannot access unauthorized resources.
- [ ] Resource files not committed.

## Activities

- [ ] Students only assigned published activities.
- [ ] Teachers only own class activities.
- [ ] Resources checked before activity use.
- [ ] Publish/pause/end audited.

## Risk Degrade

- [ ] High-risk items were not executed.
- [ ] Interfaces/placeholders/local providers were created where useful.
- [ ] `docs/HUMAN_ACTIONS.md` lists user actions.
- [ ] Run did not pause for paid services/real secrets/irreversible migrations.

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
```

If UI changed:

```bash
pnpm test:e2e
```
