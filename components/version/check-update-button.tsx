"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export type UpdateManifestResponse = {
  latestVersion: string;
  minimumSupportedVersion: string;
  minSupportedVersion?: string;
  currentVersion: string;
  forceUpdate: boolean;
  changelogUrl: string;
  updateUrl: string;
  releaseNotes?: string[];
  publishedAt?: string | null;
};

type CheckUpdateButtonProps = {
  onResult: (manifest: UpdateManifestResponse) => void;
  onStatusChange?: (status: "checking" | "checked" | "failed") => void;
};

export function CheckUpdateButton({ onResult, onStatusChange }: CheckUpdateButtonProps) {
  const [isChecking, setIsChecking] = useState(false);

  async function checkForUpdates() {
    setIsChecking(true);
    onStatusChange?.("checking");

    try {
      const response = await fetch("/api/update-manifest", { cache: "no-store" });

      if (!response.ok) {
        onStatusChange?.("failed");
        return;
      }

      onResult((await response.json()) as UpdateManifestResponse);
      onStatusChange?.("checked");
    } catch {
      onStatusChange?.("failed");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={checkForUpdates} disabled={isChecking}>
      <RefreshCw className="size-4" aria-hidden="true" />
      {isChecking ? "检查中" : "检查更新"}
    </Button>
  );
}
