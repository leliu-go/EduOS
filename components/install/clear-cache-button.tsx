"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

async function clearEduosCaches() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      registration.active?.postMessage({ type: "CLEAR_EDUOS_CACHES" });
      registration.waiting?.postMessage({ type: "CLEAR_EDUOS_CACHES" });
      registration.installing?.postMessage({ type: "CLEAR_EDUOS_CACHES" });
    }
  }

  if ("caches" in window) {
    const cacheNames = await window.caches.keys();

    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith("eduos-"))
        .map((cacheName) => window.caches.delete(cacheName)),
    );
  }
}

export function ClearEduosCacheButton() {
  const [status, setStatus] = useState<"idle" | "clearing" | "done" | "failed">("idle");

  async function handleClearCache() {
    setStatus("clearing");

    try {
      await clearEduosCaches();
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClearCache}
        disabled={status === "clearing"}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {status === "clearing" ? "清理中" : "清理本地缓存"}
      </Button>
      {status === "done" ? (
        <p className="text-xs text-muted-foreground">本地 EduOS 缓存已清理，重新打开页面会拉取最新资源。</p>
      ) : null}
      {status === "failed" ? (
        <p className="text-xs text-red-600">缓存清理失败，请关闭 EduOS 后重新打开。</p>
      ) : null}
    </div>
  );
}
