param(
  [switch]$CheckEndpoint
)

$ErrorActionPreference = "Stop"

$provider = if ($env:RESOURCE_STORAGE_PROVIDER) { $env:RESOURCE_STORAGE_PROVIDER } else { "local" }

Write-Host "EduOS storage provider check"
Write-Host ("Provider: {0}" -f $provider)

if ($provider -eq "local") {
  $root = if ($env:RESOURCE_STORAGE_LOCAL_ROOT) { $env:RESOURCE_STORAGE_LOCAL_ROOT } else { ".local/resource-storage" }
  $bucket = if ($env:RESOURCE_STORAGE_LOCAL_BUCKET) { $env:RESOURCE_STORAGE_LOCAL_BUCKET } else { "local-resource-storage" }

  Write-Host ("Local root configured: {0}" -f [bool]$root)
  Write-Host ("Local bucket configured: {0}" -f [bool]$bucket)
  Write-Host "Local provider is for development only. Do not package local payloads."
  exit 0
}

if ($provider -ne "aliyun-oss") {
  Write-Error ("Unsupported RESOURCE_STORAGE_PROVIDER: {0}" -f $provider)
  exit 1
}

$required = @(
  "ALIYUN_OSS_ACCESS_KEY_ID",
  "ALIYUN_OSS_ACCESS_KEY_SECRET",
  "ALIYUN_OSS_BUCKET",
  "ALIYUN_OSS_ENDPOINT"
)
$missing = @()
foreach ($name in $required) {
  if (-not [Environment]::GetEnvironmentVariable($name)) {
    $missing += $name
  }
}

foreach ($name in $required) {
  $state = if ($missing -contains $name) { "missing" } else { "set" }
  Write-Host ("{0}: {1}" -f $name, $state)
}

if ($missing.Count -gt 0) {
  Write-Error ("Missing Aliyun OSS environment variables: {0}" -f ($missing -join ", "))
  exit 1
}

if ($CheckEndpoint) {
  $endpoint = $env:ALIYUN_OSS_ENDPOINT -replace "^https?://", ""
  $endpoint = $endpoint.TrimEnd("/")
  $bucketHost = "https://$($env:ALIYUN_OSS_BUCKET).$endpoint"

  try {
    $response = Invoke-WebRequest -Uri $bucketHost -Method Head -TimeoutSec 10
    Write-Host ("OSS endpoint reachable, HTTP status: {0}" -f [int]$response.StatusCode)
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      Write-Host ("OSS endpoint reachable, HTTP status: {0}" -f [int]$_.Exception.Response.StatusCode)
    } else {
      Write-Error "OSS endpoint check failed without printing credentials."
      exit 1
    }
  }
} else {
  Write-Host "Skipped endpoint check. Pass -CheckEndpoint to perform a HEAD request against the bucket host."
}

Write-Host "Storage provider check completed. Secret values were not printed."
