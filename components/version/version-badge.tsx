import { Badge } from "@/components/ui/badge";
import { getAppVersion } from "@/lib/version/app-version";

export function VersionBadge() {
  const appVersion = getAppVersion();

  return <Badge variant="secondary">v{appVersion.version}</Badge>;
}
