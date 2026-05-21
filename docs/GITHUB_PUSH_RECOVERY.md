# GitHub Push Recovery

Date: 2026-05-21

## Current State

Local `main` is ahead of `origin/main` by 4 commits:

```text
docs: record day 2 push recovery
productization: prepare aliyun staging and cloud client architecture
1218e60 docs: record stage 4 push blocker
85e4d6f productization: add aliyun oss resource storage groundwork
```

Uncommitted items intentionally not included:

- `next-env.d.ts`
- `EduOS_Codex_Overnight_Run_Pack_v2/`

## Push Failure

Latest failures observed from this machine:

```text
fatal: unable to access 'https://github.com/leliu-go/EduOS.git/': Recv failure: Connection was reset
fatal: unable to access 'https://github.com/leliu-go/EduOS.git/': Failed to connect to github.com port 443 after 21051 ms: Could not connect to server
```

## Generated Recovery Artifacts

Generated locally:

```text
artifacts/patches/0001-productization-add-aliyun-oss-resource-storage-groun.patch
artifacts/patches/0002-docs-record-stage-4-push-blocker.patch
artifacts/patches/0003-productization-prepare-aliyun-staging-and-cloud-clie.patch
artifacts/patches/0004-docs-record-day-2-push-recovery.patch
artifacts/eduos-stage4.bundle
artifacts/eduos-stage4-source.tar.gz
artifacts/eduos-day2-stage.bundle
artifacts/eduos-day2-source.tar.gz
```

`artifacts/` is ignored by git and must not be committed.

## Recovery Option 1: Retry Git Push

```powershell
git push origin main
```

If it succeeds, update `docs/DAY2_PROGRESS.md` with the successful push time and commit that update.

## Recovery Option 2: Apply Patch On A Machine With GitHub Access

```bash
git clone https://github.com/leliu-go/EduOS.git
cd EduOS
git am /path/to/artifacts/patches/*.patch
git push origin main
```

## Recovery Option 3: Use Git Bundle

On the target machine:

```bash
git clone https://github.com/leliu-go/EduOS.git
cd EduOS
git bundle verify /path/to/artifacts/eduos-day2-stage.bundle
git pull /path/to/artifacts/eduos-day2-stage.bundle main
git push origin main
```

## Recovery Option 4: Deploy Source Archive To Staging

Upload `artifacts/eduos-day2-source.tar.gz` to ECS, then deploy with the artifact mode described in `docs/ALIYUN_STAGING_DEPLOYMENT.md`.

This route can validate staging even while GitHub is unavailable, but GitHub should still be repaired later so source history remains canonical.
