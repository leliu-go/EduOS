"use client";

import { RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type UpdateManifestResponse = {
  latestVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  changelogUrl: string;
};

type UpdateAvailableBannerProps = {
  currentVersion: string;
};

export function UpdateAvailableBanner({ currentVersion }: UpdateAvailableBannerProps) {
  const [manifest, setManifest] = useState<UpdateManifestResponse | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/update-manifest", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: UpdateManifestResponse | null) => {
        if (isMounted) {
          setManifest(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setManifest(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasUpdate =
    manifest !== null && manifest.latestVersion !== currentVersion && manifest.latestVersion !== "";

  if (!hasUpdate || isDismissed) {
    return null;
  }

  return (
    <div className="fixed left-4 right-4 top-4 z-50 flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm shadow-lg md:left-auto md:w-[380px]">
      <div>
        <p className="font-medium text-foreground">EduOS 有新版本</p>
        <p className="mt-1 text-muted-foreground">
          当前 v{currentVersion}，可更新到 v{manifest.latestVersion}。保存当前操作后再刷新。
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="稍后"
          onClick={() => setIsDismissed(true)}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" size="icon" aria-label="刷新到新版本" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
