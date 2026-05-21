# Dev To Deploy Workflow

Date: 2026-05-21

## Normal Path

1. Develop locally on `main` or a short-lived branch.
2. Run:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
3. Run relevant e2e tests for changed user flows.
4. Commit and push to GitHub.
5. On ECS, pull `main`.
6. Build on ECS.
7. Restart PM2.
8. Run staging smoke tests.

## GitHub Unavailable Path

If GitHub is unavailable:

1. Generate patch, bundle, and source archive.
2. Upload `artifacts/eduos-stage4-source.tar.gz` to ECS.
3. Run `scripts/server/deploy-staging.sh` with `DEPLOY_SOURCE=archive`.
4. Repair GitHub source history later with patch or bundle recovery.

## Secrets

Secrets live on ECS at `/opt/eduos/.env.production.local` or in an approved secret manager. They do not travel through git patches, bundles, or source archives.
