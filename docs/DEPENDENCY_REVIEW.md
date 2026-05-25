# Dependency Review

Date: 2026-05-25

## Commands

- `pnpm audit`
- `pnpm outdated`
- `pnpm why @hono/node-server`
- `pnpm why postcss`

## Initial Audit Findings

`pnpm audit` initially found two moderate advisories:

- `@hono/node-server <1.19.13`, path: `prisma -> @prisma/dev -> @hono/node-server`.
- `postcss <8.5.10`, path: `next -> postcss`.

## Fix Applied

Added pnpm overrides in `package.json`:

- `@hono/node-server`: `1.19.13`
- `postcss`: `8.5.14`

After `pnpm install`, `pnpm audit` reported no known vulnerabilities.

## Outdated Packages

`pnpm outdated` listed small patch/minor updates:

- `@types/node`
- `@types/react`
- `postcss`
- `react-hook-form`
- `tsx`
- `vitest`
- `@hookform/resolvers`
- `eslint`

No broad upgrade was performed during this sprint.

## Notes

- No new production dependency was added.
- Overrides were chosen instead of a framework upgrade to reduce blast radius.

