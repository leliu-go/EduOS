import type { AliyunOssStorageProviderConfig } from "@/lib/storage/aliyun-oss-provider";

export type EnvLike = Record<string, string | undefined>;

const aliyunOssRequiredEnv = [
  "ALIYUN_OSS_ACCESS_KEY_ID",
  "ALIYUN_OSS_ACCESS_KEY_SECRET",
  "ALIYUN_OSS_BUCKET",
  "ALIYUN_OSS_ENDPOINT",
] as const;

export type ProductionEnvReport = {
  ok: boolean;
  provider: string;
  missing: string[];
  redacted: Record<string, "set" | "missing">;
};

function getProvider(env: EnvLike) {
  return env.RESOURCE_STORAGE_PROVIDER?.trim() || "local";
}

function getOptionalNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function validateProductionEnv(env: EnvLike = process.env): ProductionEnvReport {
  const provider = getProvider(env);
  const required = provider === "aliyun-oss" ? aliyunOssRequiredEnv : [];
  const missing = required.filter((key) => !env[key]?.trim());
  const redacted: Record<string, "set" | "missing"> = {};

  for (const key of required) {
    redacted[key] = env[key]?.trim() ? "set" : "missing";
  }

  return {
    ok: missing.length === 0,
    provider,
    missing,
    redacted,
  };
}

export function loadAliyunOssConfigFromEnv(
  env: EnvLike = process.env,
): AliyunOssStorageProviderConfig {
  const report = validateProductionEnv({
    ...env,
    RESOURCE_STORAGE_PROVIDER: "aliyun-oss",
  });

  if (!report.ok) {
    throw new Error(`Missing Aliyun OSS environment variables: ${report.missing.join(", ")}`);
  }

  return {
    accessKeyId: env.ALIYUN_OSS_ACCESS_KEY_ID?.trim() ?? "",
    accessKeySecret: env.ALIYUN_OSS_ACCESS_KEY_SECRET?.trim() ?? "",
    bucket: env.ALIYUN_OSS_BUCKET?.trim() ?? "",
    endpoint: env.ALIYUN_OSS_ENDPOINT?.trim() ?? "",
    internalEndpoint: env.ALIYUN_OSS_INTERNAL_ENDPOINT?.trim() || undefined,
    publicEndpoint: env.ALIYUN_OSS_PUBLIC_ENDPOINT?.trim() || undefined,
    region: env.ALIYUN_OSS_REGION?.trim() || undefined,
    signedUrlTtlSeconds: getOptionalNumber(env.ALIYUN_OSS_SIGNED_URL_TTL_SECONDS, 300),
  };
}
