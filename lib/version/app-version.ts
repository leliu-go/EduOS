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
  currentVersion: string;
  buildTime: string | null;
  shortCommitHash: string;
  releasedAt: string | null;
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

  return {
    app: "EduOS",
    latestVersion: appVersion.version,
    minimumSupportedVersion: appVersion.version,
    currentVersion: appVersion.version,
    buildTime: appVersion.buildTime,
    shortCommitHash: appVersion.shortCommitHash,
    releasedAt: appVersion.releasedAt,
    changelogUrl: "/CHANGELOG.md",
    updateUrl: "/",
    forceUpdate: false,
  };
}
