"use client";

import { MobileErrorState } from "@/components/mobile/ErrorState";

export default function BackupDevicesSettingsError() {
  return (
    <MobileErrorState
      title="备份设备加载失败"
      description="请重试，或确认数据库已应用 Admin 备份设备的 additive migration。"
    />
  );
}
