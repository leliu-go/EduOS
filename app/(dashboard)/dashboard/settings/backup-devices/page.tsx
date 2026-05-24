import { redirect } from "next/navigation";

export default function BackupDevicesSettingsRedirectPage() {
  redirect("/dashboard/settings/storage");
}
