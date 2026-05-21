"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type UpdateManifestResponse = {
  latestVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  changelogUrl: string;
};

type VersionUpdatePanelProps = {
  currentVersion: string;
};

export function VersionUpdatePanel({ currentVersion }: VersionUpdatePanelProps) {
  const [manifest, setManifest] = useState<UpdateManifestResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "checked" | "failed">("idle");

  async function checkForUpdates() {
    setStatus("checking");

    try {
      const response = await fetch("/api/update-manifest", { cache: "no-store" });

      if (!response.ok) {
        setStatus("failed");
        return;
      }

      setManifest((await response.json()) as UpdateManifestResponse);
      setStatus("checked");
    } catch {
      setStatus("failed");
    }
  }

  const latestVersion = manifest?.latestVersion ?? currentVersion;
  const hasUpdate = latestVersion !== currentVersion;

  return (
    <div className="grid gap-3 rounded-md border p-4">
      <div>
        <p className="font-medium text-foreground">检查更新</p>
        <p className="mt-1 text-sm text-muted-foreground">
          从安全的 update manifest 获取版本信息，不暴露环境变量或密钥。
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={checkForUpdates}
          disabled={status === "checking"}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {status === "checking" ? "检查中" : "检查更新"}
        </Button>
        {hasUpdate ? (
          <Button type="button" onClick={() => window.location.reload()}>
            刷新到新版
          </Button>
        ) : null}
      </div>
      {status === "checked" ? (
        <p className="text-sm text-muted-foreground">
          {hasUpdate
            ? `发现新版本 v${latestVersion}，刷新到新版后生效。`
            : `当前 v${currentVersion} 已是最新版本。`}
        </p>
      ) : null}
      {status === "failed" ? (
        <p className="text-sm text-red-600">更新检查失败，请稍后重试。</p>
      ) : null}
    </div>
  );
}
