import packageJson from "@/package.json";

type PackageMetadata = {
  name: string;
  version: string;
};

export type AppVersion = {
  name: string;
  version: string;
  buildId: string;
  buildTime: string | null;
  shortCommitHash: string;
  releasedAt: string | null;
};

export type UpdateManifest = {
  app: string;
  latestVersion: string;
  minimumSupportedVersion: string;
  minSupportedVersion: string;
  currentVersion: string;
  buildTime: string | null;
  shortCommitHash: string;
  releasedAt: string | null;
  publishedAt: string | null;
  releaseNotes: string[];
  changelogUrl: string;
  updateUrl: string;
  forceUpdate: boolean;
};

const packageMetadata = packageJson as PackageMetadata;

function getShortCommitHash() {
  const commitHash =
    process.env.NEXT_PUBLIC_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.COMMIT_SHA ??
    "";

  return commitHash ? commitHash.slice(0, 7) : "local";
}

export function getAppVersion(): AppVersion {
  return {
    name: packageMetadata.name,
    version: packageMetadata.version,
    buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "local-dev",
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? process.env.BUILD_TIME ?? null,
    shortCommitHash: getShortCommitHash(),
    releasedAt: process.env.NEXT_PUBLIC_RELEASED_AT ?? null,
  };
}

export function getUpdateManifest(): UpdateManifest {
  const appVersion = getAppVersion();
  const minimumSupportedVersion =
    process.env.EDUOS_MIN_SUPPORTED_VERSION ?? process.env.EDUOS_MINIMUM_SUPPORTED_VERSION ?? appVersion.version;
  const releasedAt = process.env.NEXT_PUBLIC_RELEASED_AT ?? null;
  const releaseNotes = (process.env.EDUOS_RELEASE_NOTES ?? "")
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return {
    app: "EduOS",
    latestVersion: process.env.EDUOS_LATEST_VERSION ?? appVersion.version,
    minimumSupportedVersion,
    minSupportedVersion: minimumSupportedVersion,
    currentVersion: appVersion.version,
    buildTime: appVersion.buildTime,
    shortCommitHash: appVersion.shortCommitHash,
    releasedAt,
    publishedAt: releasedAt,
    releaseNotes: releaseNotes.length > 0 ? releaseNotes : ["See CHANGELOG.md for release details."],
    changelogUrl: process.env.EDUOS_CHANGELOG_URL ?? "/CHANGELOG.md",
    updateUrl: process.env.EDUOS_UPDATE_URL ?? "/",
    forceUpdate: process.env.EDUOS_FORCE_UPDATE === "true",
  };
}
