import { NextResponse } from "next/server";

import { getAppVersion } from "@/lib/version/app-version";

export function GET() {
  return NextResponse.json(getAppVersion(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
