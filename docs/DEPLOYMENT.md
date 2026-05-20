# EduOS Deployment

This guide covers the local setup path and the production settings needed to run EduOS.

## Local setup

1. Install Node.js 22 or newer, pnpm, and PostgreSQL.
2. Install project dependencies:

```bash
pnpm install
```

3. Create a local environment file:

```bash
cp .env.example .env
```

4. Edit `.env` and set at least `DATABASE_URL`, `AUTH_SECRET`, `CHECK_IN_QR_SECRET`, and `NEXT_PUBLIC_APP_URL`.
5. Create or update the local database schema from Prisma:

```bash
pnpm exec prisma db push
```

6. Seed the demo tenant and accounts:

```bash
pnpm prisma db seed
```

7. Start the development server:

```bash
pnpm dev
```

8. Before handing off any task, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Production deployment

Use a managed PostgreSQL database and configure the deployment platform to install with pnpm, build with `pnpm build`, and start with `pnpm start`.

Recommended deployment commands:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The current MVP schema can be prepared locally with `pnpm exec prisma db push`. For a real production launch, create and review Prisma migrations from the schema, then deploy with a migration flow instead of running `db push` directly against production.

Do not run demo seed data against a production tenant unless this is an intentionally disposable demo environment.

## Environment variables

| Variable              | Required         | Scope         | Notes                                                                                                                |
| --------------------- | ---------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Yes              | Server        | PostgreSQL connection string used by Prisma and the app runtime. Use SSL settings required by the database provider. |
| `AUTH_SECRET`         | Yes              | Server        | Long random secret used to sign EduOS session cookies. Required in production.                                       |
| `CHECK_IN_QR_SECRET`  | Recommended      | Server        | Long random secret for student check-in QR tokens. If unset, EduOS falls back to `AUTH_SECRET`.                      |
| `NEXT_PUBLIC_APP_URL` | Yes for QR links | Client/server | Public origin, for example `https://eduos.example.com`. Used to generate check-in URLs.                              |
| `EDUOS_DEMO_PASSWORD` | No               | Seed only     | Optional password for demo seed users. Leave unset for production unless creating a demo environment.                |
| `NODE_ENV`            | Platform-managed | Server        | Deployment platforms normally set this to `production`; EduOS requires production secrets when it is `production`.   |

## Release checklist

- `DATABASE_URL` points to the intended PostgreSQL database.
- `AUTH_SECRET` and `CHECK_IN_QR_SECRET` are long random values and are not committed.
- `NEXT_PUBLIC_APP_URL` matches the deployed origin without a trailing slash.
- `pnpm build` completes successfully.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass before release.
- Demo seed data is not applied to a real production tenant.
