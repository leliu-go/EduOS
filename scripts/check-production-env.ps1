param(
  [switch]$Production
)

$ErrorActionPreference = "Stop"

$provider = if ($env:RESOURCE_STORAGE_PROVIDER) { $env:RESOURCE_STORAGE_PROVIDER } else { "local" }
$required = @()

if ($provider -eq "aliyun-oss") {
  $required = @(
    "ALIYUN_OSS_ACCESS_KEY_ID",
    "ALIYUN_OSS_ACCESS_KEY_SECRET",
    "ALIYUN_OSS_BUCKET",
    "ALIYUN_OSS_ENDPOINT"
  )
}

if ($Production -and -not $env:DATABASE_URL) {
  $required += "DATABASE_URL"
}

$missing = @()
foreach ($name in $required) {
  if (-not [Environment]::GetEnvironmentVariable($name)) {
    $missing += $name
  }
}

Write-Host "EduOS production environment check"
Write-Host ("Provider: {0}" -f $provider)

foreach ($name in $required) {
  $state = if ($missing -contains $name) { "missing" } else { "set" }
  Write-Host ("{0}: {1}" -f $name, $state)
}

if ($missing.Count -gt 0) {
  Write-Error ("Missing required environment variables: {0}" -f ($missing -join ", "))
  exit 1
}

Write-Host "Environment variable presence check passed. Secret values were not printed."
