import type { Metadata } from "next";

import { InstallPwaPrompt } from "@/components/install/install-pwa-prompt";
import { Toaster } from "@/components/ui/sonner";

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
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <InstallPwaPrompt />
        <Toaster />
      </body>
    </html>
  );
}
