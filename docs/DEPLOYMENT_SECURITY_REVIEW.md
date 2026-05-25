# Deployment Security Review

Date: 2026-05-25

## Reviewed Files

- `scripts/server/deploy-staging.sh`
- `scripts/server/deploy-production.sh`
- `scripts/server/check-rds-connection.sh`
- `scripts/server/check-oss-provider.sh`
- `scripts/server/health-check.sh`
- `scripts/server/rollback.sh`
- `docs/DEPLOYMENT_RUNBOOK.md`
- `docs/FINAL_DEPLOY_TO_ECS_STEPS.md`

## Findings

### P1 - Staging artifact cleanup is powerful

`scripts/server/deploy-staging.sh` has an artifact path that clears the app directory before extracting an uploaded bundle. It is intended for controlled staging deployment but remains a high-impact filesystem operation. Production deployment has more explicit exclusions.

Recommendation: keep this behind operator review and add an allowlist of removable paths before using it on any long-lived server.

### P1 - Production migrations remain correctly gated

Deployment scripts are designed to avoid automatic production migrations unless `RUN_PRODUCTION_MIGRATIONS=true`. This is correct and should not be loosened.

## Positive Controls

- Migration scanners reject dangerous SQL patterns such as `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, and unsafe deletes.
- RDS and OSS check scripts state that secret values are redacted.
- Deployment docs state that `.env.production.local` stays on the server and out of git.

## Remaining Risks

- Run production deploy only after backup, migration SQL review, and HTTPS verification.
- Add deployment-history automation that records commit hash, build time, migration decision, PM2 result, and health-check result without printing secrets.

