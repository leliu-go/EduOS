# Aliyun OSS Smoke Test

Date: 2026-05-21

## Scope

This smoke test is safe for staging and may use only:

```text
test/eduos-smoke.txt
```

Do not print AccessKey secrets. Do not print `.env.production.local`. Do not clear the bucket. Do not delete homework, mistakes, resources, activities, videos, word books, question banks, or uploads.

## If You Are On ECS

```bash
cd /opt/eduos/current
bash scripts/server/check-oss-provider.sh
bash scripts/server/oss-smoke-test.sh
```

Expected result:

- OSS variables are reported as `set`.
- Endpoint is reachable.
- `test/eduos-smoke.txt` uploads.
- Signed URL HEAD returns HTTP 200.
- The signed URL itself is not printed.

## Delete Policy

This repository does not automatically delete OSS objects during smoke tests. If cleanup is approved, delete only:

```text
test/eduos-smoke.txt
```

If deletion fails, record it in `docs/HUMAN_ACTIONS.md` and continue.

## Endpoint Plan

Current code supports:

- `ALIYUN_OSS_ENDPOINT`
- optional `ALIYUN_OSS_INTERNAL_ENDPOINT`
- optional `ALIYUN_OSS_PUBLIC_ENDPOINT`

If split endpoints are not set, both upload and signed URL generation use `ALIYUN_OSS_ENDPOINT`. First-stage staging can use:

```text
ALIYUN_OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
```
