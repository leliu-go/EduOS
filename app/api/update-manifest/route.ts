import { NextResponse } from "next/server";

import { getUpdateManifest } from "@/lib/version/app-version";

export function GET() {
  return NextResponse.json(getUpdateManifest(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
