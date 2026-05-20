import packageJson from "@/package.json";

type PackageMetadata = {
  name: string;
  version: string;
};

export type AppVersion = {
  name: string;
  version: string;
  buildId: string;
  releasedAt: string | null;
};

export type UpdateManifest = {
  app: string;
  latestVersion: string;
  minimumSupportedVersion: string;
  currentVersion: string;
  releasedAt: string | null;
  changelogUrl: string;
  updateUrl: string;
  forceUpdate: boolean;
};

const packageMetadata = packageJson as PackageMetadata;

export function getAppVersion(): AppVersion {
  return {
    name: packageMetadata.name,
    version: packageMetadata.version,
    buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "local-dev",
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
    releasedAt: appVersion.releasedAt,
    changelogUrl: "/CHANGELOG.md",
    updateUrl: "/",
    forceUpdate: false,
  };
}
