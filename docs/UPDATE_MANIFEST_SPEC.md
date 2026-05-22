# EduOS Update Manifest Spec

## Endpoint

`/api/update-manifest`

The endpoint returns public release metadata only. It must never expose tenant
data, database URLs, auth secrets, storage credentials, MFA secrets, or service
keys.

## Fields

| Field                     | Type           | Description                                                    |
| ------------------------- | -------------- | -------------------------------------------------------------- |
| `app`                     | string         | Product name, currently `EduOS`.                               |
| `latestVersion`           | string         | Latest known application version from `package.json`.          |
| `minimumSupportedVersion` | string         | Oldest version allowed to continue without a forced update.    |
| `minSupportedVersion`     | string         | Compatibility alias for client/update tooling.                 |
| `currentVersion`          | string         | Running application version.                                   |
| `releasedAt`              | string or null | Optional ISO release timestamp from `NEXT_PUBLIC_RELEASED_AT`. |
| `publishedAt`             | string or null | Public release timestamp alias.                                |
| `releaseNotes`            | string[]       | Short public release notes for update UI.                      |
| `buildTime`               | string or null | Optional public build timestamp from build-time metadata.      |
| `shortCommitHash`         | string         | Short public commit hash for diagnostics; never a secret.      |
| `changelogUrl`            | string         | Public changelog path.                                         |
| `updateUrl`               | string         | Public URL users can refresh or open.                          |
| `forceUpdate`             | boolean        | Whether clients should block usage until refresh.              |

## Current First Stage Behavior

The first-stage manifest is conservative:

- `latestVersion`, `minimumSupportedVersion`, and `currentVersion` all use the
  current package version.
- `forceUpdate` is `false`.
- The UI shows a non-disruptive update banner only when the manifest reports a
  newer version.
- The admin settings UI can manually fetch the manifest through the `检查更新`
  button and reveal `刷新到新版` only when the manifest reports a newer version.

## Future Publisher Rules

- Manifest publishing is a human-approved release action.
- Forced updates require incident or compliance approval.
- Rollback must update `latestVersion`, `minimumSupportedVersion`, and
  `forceUpdate` deliberately.
- Update metadata must be cache-controlled with `no-store`.

## Security Rules

- No deploy action is performed by the manifest endpoint.
- No code signing action is performed by the manifest endpoint.
- No production database migration is performed by the manifest endpoint.
- Clients must not use update metadata as authorization data.

## Production Metadata Overrides

Production deployment may override latest release metadata through safe public
environment variables such as `EDUOS_LATEST_VERSION`,
`EDUOS_MIN_SUPPORTED_VERSION`, and `EDUOS_RELEASE_NOTES`. These values are not
secrets and must never contain credentials, tenant data, or `.env` contents.
