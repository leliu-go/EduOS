import type { Metadata } from "next";

import { InstallPwaPrompt } from "@/components/install/install-pwa-prompt";
import { Toaster } from "@/components/ui/sonner";
import { UpdateAvailableBanner } from "@/components/version/update-available-banner";
import { getAppVersion } from "@/lib/version/app-version";

import "./globals.css";

export const metadata: Metadata = {
  title: "EduOS",
  description: "Education operations system",
  applicationName: "EduOS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "EduOS",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appVersion = getAppVersion();

  return (
    <html lang="zh-CN">
      <body>
        {children}
        <UpdateAvailableBanner currentVersion={appVersion.version} />
        <InstallPwaPrompt />
        <Toaster />
      </body>
    </html>
  );
}
