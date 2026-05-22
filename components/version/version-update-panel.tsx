"use client";

import { useState } from "react";

import {
  CheckUpdateButton,
  type UpdateManifestResponse,
} from "@/components/version/check-update-button";
import { Button } from "@/components/ui/button";

type VersionUpdatePanelProps = {
  currentVersion: string;
};

export function VersionUpdatePanel({ currentVersion }: VersionUpdatePanelProps) {
  const [manifest, setManifest] = useState<UpdateManifestResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "checked" | "failed">("idle");

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
        <CheckUpdateButton onResult={setManifest} onStatusChange={setStatus} />
        {hasUpdate ? (
          <Button type="button" onClick={() => window.location.reload()}>
            刷新到新版
          </Button>
        ) : null}
      </div>
      {status === "checked" ? (
        <div className="grid gap-1 text-sm text-muted-foreground">
          <p>
            {hasUpdate
              ? `发现新版本 v${latestVersion}，刷新到新版本后生效。`
              : `当前 v${currentVersion} 已是最新版本。`}
          </p>
          {manifest?.releaseNotes?.length ? (
            <ul className="list-disc pl-5">
              {manifest.releaseNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {status === "failed" ? (
        <p className="text-sm text-red-600">更新检查失败，请稍后重试。</p>
      ) : null}
    </div>
  );
}
