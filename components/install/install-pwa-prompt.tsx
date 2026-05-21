"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedStorageKey = "eduos-pwa-install-dismissed";

function isLocalDevelopmentRuntime() {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function clearLocalServiceWorkerState() {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });

  if ("caches" in window) {
    window.caches.keys().then((cacheNames) => {
      cacheNames
        .filter((cacheName) => cacheName.startsWith("eduos-"))
        .forEach((cacheName) => {
          void window.caches.delete(cacheName);
        });
    });
  }
}

export function InstallPwaPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(dismissedStorageKey) === "true",
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (isLocalDevelopmentRuntime()) {
      clearLocalServiceWorkerState();
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA install remains optional; registration failure must not block login.
    });
  }, []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!installEvent || isDismissed) {
    return null;
  }

  async function install() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  function dismiss() {
    window.localStorage.setItem(dismissedStorageKey, "true");
    setIsDismissed(true);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm shadow-lg md:left-auto md:w-[360px]">
      <div>
        <p className="font-medium text-foreground">安装 EduOS</p>
        <p className="mt-1 text-muted-foreground">将同一套 EduOS 添加到桌面，登录后按角色进入对应工作台。</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" size="icon" variant="outline" aria-label="稍后再说" onClick={dismiss}>
          <X className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" size="icon" aria-label="安装 EduOS PWA" onClick={install}>
          <Download className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
