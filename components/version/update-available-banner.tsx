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

function activateWaitingServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    window.location.reload();
    return;
  }

  navigator.serviceWorker.getRegistration().then((registration) => {
    if (!registration?.waiting) {
      window.location.reload();
      return;
    }

    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => window.location.reload(), 800);
  });
}

export function UpdateAvailableBanner({ currentVersion }: UpdateAvailableBannerProps) {
  const [manifest, setManifest] = useState<UpdateManifestResponse | null>(null);
  const [hasWaitingWorker, setHasWaitingWorker] = useState(false);
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

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let isMounted = true;

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration || !isMounted) {
        return;
      }

      if (registration.waiting) {
        setHasWaitingWorker(true);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;

        installingWorker?.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            setHasWaitingWorker(true);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasManifestUpdate =
    manifest !== null && manifest.latestVersion !== currentVersion && manifest.latestVersion !== "";
  const hasUpdate = hasManifestUpdate || hasWaitingWorker;

  if (!hasUpdate || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 left-4 z-50 flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm shadow-lg md:left-auto md:w-[380px]">
      <div>
        <p className="font-medium text-foreground">发现新版本，刷新后生效</p>
        <p className="mt-1 text-muted-foreground">
          当前 v{currentVersion}
          {manifest?.latestVersion ? `，可更新到 v${manifest.latestVersion}` : ""}。保存当前操作后再刷新。
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
        <Button type="button" size="icon" aria-label="立即刷新" onClick={activateWaitingServiceWorker}>
          <RefreshCw className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
