# EduOS Overnight Safety and Continue Rules v2

## Core Rule

Codex should automatically continue low-risk tasks. For high-risk tasks, Codex must not execute the risky operation. Instead, it must:

1. Write a concrete plan/RFC.
2. Leave safe interfaces, adapters, placeholders, config keys, local providers, or mock providers.
3. Record the deferred human action in `docs/HUMAN_ACTIONS.md` and, if needed, `docs/BLOCKERS.md`.
4. Continue to the next safe task.

**Do not pause only because a high-risk external or irreversible step exists. Downgrade it and continue.**

## Low-risk Tasks: Continue

Continue without asking when the task is reversible and local, such as docs, UI polish, safe tests, small lint/type fixes, provider interfaces, local providers, empty-state UI, non-destructive schemas, permission tests, and release documentation.

## High-risk Tasks: Degrade and Continue

### Destructive / irreversible DB work

Do not run it. Write RFC, migration draft, rollback plan, and human checklist. Continue.

### Real secrets / credentials

Do not invent or store them. Add `.env.example`, provider interface, local dev provider, and setup docs. Continue.

### Paid cloud services / external accounts

Do not create paid services. Write setup checklist and leave config placeholders. Continue.

### Code signing / production deployment / installer publishing

Do not publish, sign, push, or deploy. Write guide and scripts/placeholders if safe. Continue.

## Create docs/HUMAN_ACTIONS.md

Each entry should include:

```txt
- Task ID
- Risk type
- Risky action intentionally not executed
- Safe fallback implemented
- Files created/updated
- What user should do after waking up
- Whether later tasks can continue
```

## Stop Only If

1. Git/repo integrity is broken.
2. Project root cannot be determined.
3. Continuing would weaken RBAC, tenant isolation, auth, MFA, privacy, or secret handling.
4. Same quality gate fails after 3 focused attempts and blocks most later tasks.
5. Codex cannot safely determine independent next tasks.

## Never Do

1. Never commit `.env` or secrets.
2. Never generate fake production keys.
3. Never push/deploy to production.
4. Never run destructive migrations without approval.
5. Never use UI-only permission protection.
6. Never cache sensitive API responses.
7. Never bundle database/resources/node_modules into installer.
8. Never split into separate principal/teacher/student apps.
