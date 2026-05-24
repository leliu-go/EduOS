# EduOS Update Manifest Spec

The update manifest remains a reserved contract for a future desktop shell or separately distributed client. It is not part of the current PWA update workflow.

## Current Status

- Current EduOS updates are applied on the server through `git pull`, build, and PM2 restart.
- Users refresh or reopen the PWA after the server is updated.
- The Admin UI shows `版本信息`; it does not show a manual "检查更新" button.

## Reserved Endpoint

`/api/update-manifest`

The endpoint may return public release metadata only. It must never expose tenant data, database URLs, auth secrets, storage credentials, MFA secrets, service keys, or `.env` contents.

## Reserved Fields

| Field                     | Type           | Description                                                 |
| ------------------------- | -------------- | ----------------------------------------------------------- |
| `app`                     | string         | Product name, currently `EduOS`.                            |
| `latestVersion`           | string         | Latest known application version.                           |
| `minimumSupportedVersion` | string         | Oldest version allowed by a future client updater.           |
| `minSupportedVersion`     | string         | Compatibility alias for client/update tooling.              |
| `currentVersion`          | string         | Running application version.                                |
| `releasedAt`              | string or null | Optional ISO release timestamp.                             |
| `publishedAt`             | string or null | Public release timestamp alias.                             |
| `releaseNotes`            | string[]       | Short public release notes for future updater UI.            |
| `buildTime`               | string or null | Optional public build timestamp from build-time metadata.   |
| `shortCommitHash`         | string         | Short public commit hash for diagnostics; never a secret.   |
| `changelogUrl`            | string         | Public changelog path.                                      |
| `updateUrl`               | string         | Public URL users can refresh or open.                       |
| `forceUpdate`             | boolean        | Reserved for future forced update policy.                   |

## Security Rules

- No deploy action is performed by the manifest endpoint.
- No code signing action is performed by the manifest endpoint.
- No production database migration is performed by the manifest endpoint.
- Clients must not use update metadata as authorization data.
