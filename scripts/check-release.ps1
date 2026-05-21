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

function Assert-GitFileNotTracked {
  param([string]$Path)

  Push-Location $repoRoot
  try {
    $tracked = & git ls-files -- $Path
    if ($tracked) {
      throw "$Path must not be tracked in git"
    }
  } finally {
    Pop-Location
  }
}

function Assert-NoDestructiveMigrationSql {
  $migrationsPath = Join-Path $repoRoot "prisma/migrations"
  if (-not (Test-Path -LiteralPath $migrationsPath)) {
    return
  }

  $patterns = @(
    "DROP\s+TABLE",
    "DROP\s+COLUMN",
    "TRUNCATE",
    "DELETE\s+FROM\s+[^\r\n;]+(;|$)",
    "migrate\s+reset"
  )

  Get-ChildItem -LiteralPath $migrationsPath -Recurse -Filter "*.sql" | ForEach-Object {
    $content = Get-Content -Raw -LiteralPath $_.FullName
    foreach ($pattern in $patterns) {
      if ($content -match $pattern) {
        throw "Potential destructive migration SQL found in $($_.FullName): $pattern"
      }
    }
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
Assert-TextContains -Path "public/sw.js" -Expected "CACHEABLE_STATIC_PREFIXES"
Assert-TextContains -Path "public/sw.js" -Expected "/api/"
Assert-TextContains -Path "public/sw.js" -Expected "networkOnly"
Assert-GitFileNotTracked -Path ".env.production.local"
Assert-NoDestructiveMigrationSql

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
