#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://eduos.study-go.top}"

echo "Checking ${BASE_URL}"
curl -fsSIL "$BASE_URL" >/dev/null

echo "Checking ${BASE_URL}/api/version"
curl -fsS "$BASE_URL/api/version" | node -e '
let body = "";
process.stdin.on("data", chunk => body += chunk);
process.stdin.on("end", () => {
  const parsed = JSON.parse(body);
  if (!parsed.version && !parsed.currentVersion) {
    throw new Error("version metadata missing");
  }
  console.log("Version endpoint returned public metadata.");
});
'

echo "HTTP smoke checks passed."
