[CmdletBinding()]
param(
  [switch]$RunQualityGates
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-RepoFile {
  param([string]$Path)

  $fullPath = Join-Path $repoRoot $Path

  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Missing required release file: $Path"
  }
}

function Assert-TextContains {
  param(
    [string]$Path,
    [string]$Expected
  )

  $fullPath = Join-Path $repoRoot $Path
  $content = Get-Content -Raw -LiteralPath $fullPath

  if (-not $content.Contains($Expected)) {
    throw "Expected '$Path' to contain '$Expected'"
  }
}

$requiredFiles = @(
  "package.json",
  "CHANGELOG.md",
  "docs/RELEASE_PROCESS.md",
  "docs/UPDATE_MANIFEST_SPEC.md",
  "docs/ROLLBACK_PLAN.md",
  "docs/RELEASE_ARTIFACT_RULES.md",
  "docs/BLOCKERS.md",
  "docs/HUMAN_ACTIONS.md",
  "app/api/update-manifest/route.ts",
  "app/api/version/route.ts",
  ".gitignore",
  ".dockerignore"
)

foreach ($file in $requiredFiles) {
  Assert-RepoFile -Path $file
}

Assert-TextContains -Path ".gitignore" -Expected "/resources"
Assert-TextContains -Path ".gitignore" -Expected "/storage"
Assert-TextContains -Path ".gitignore" -Expected "/public/uploads"
Assert-TextContains -Path ".dockerignore" -Expected "/resources"
Assert-TextContains -Path "docs/UPDATE_MANIFEST_SPEC.md" -Expected "minimumSupportedVersion"
Assert-TextContains -Path "docs/RELEASE_PROCESS.md" -Expected "No deploy"
Assert-TextContains -Path "docs/RELEASE_PROCESS.md" -Expected "No code signing"
Assert-TextContains -Path "docs/RELEASE_PROCESS.md" -Expected "No production database migration"

if ($RunQualityGates) {
  Push-Location $repoRoot
  try {
    & pnpm lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & pnpm typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & pnpm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & pnpm test:e2e
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } finally {
    Pop-Location
  }
}

Write-Output "EduOS release static check passed."
Write-Output "No deploy/sign/publish action was performed."
