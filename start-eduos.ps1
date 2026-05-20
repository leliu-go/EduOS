$ErrorActionPreference = "Stop"
Set-Location "D:\Code\education"

$databaseUrl = "postgresql://eduos:eduos_password@localhost:55432/eduos_dev?schema=public"
$authSecret = "eduos-local-dev-auth-secret-change-me"
$qrSecret = "eduos-local-dev-qr-secret-change-me"
$appUrl = "http://localhost:3000"
$loginUrl = "http://localhost:3000/login"

function Set-EnvValue($name, $value) {
  $line = "$name=`"$value`""
  $content = @()

  if (Test-Path ".env") {
    $content = @(Get-Content ".env")
  }

  $found = $false
  $content = $content | ForEach-Object {
    if ($_ -match "^$name=") {
      $found = $true
      $line
    } else {
      $_
    }
  }

  if (-not $found) {
    $content += $line
  }

  Set-Content ".env" $content -Encoding utf8
}

Set-EnvValue "DATABASE_URL" $databaseUrl
Set-EnvValue "AUTH_SECRET" $authSecret
Set-EnvValue "CHECK_IN_QR_SECRET" $qrSecret
Set-EnvValue "NEXT_PUBLIC_APP_URL" $appUrl
Set-EnvValue "EDUOS_DEMO_PASSWORD" "EduOS-demo-123456"

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  $dockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  if (Test-Path $dockerDesktop) {
    Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
    for ($i = 0; $i -lt 24; $i++) {
      Start-Sleep -Seconds 5
      docker info *> $null
      if ($LASTEXITCODE -eq 0) {
        break
      }
    }
  }
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw "Docker Desktop is not running. Start Docker Desktop, then open EduOS again."
}

docker inspect eduos-postgres *> $null
if ($LASTEXITCODE -ne 0) {
  docker run --name eduos-postgres -e POSTGRES_USER=eduos -e POSTGRES_PASSWORD=eduos_password -e POSTGRES_DB=eduos_dev -p 55432:5432 -d postgres:18
} else {
  $running = docker inspect -f "{{.State.Running}}" eduos-postgres
  if ($running -ne "true") {
    docker start eduos-postgres
  }
}

for ($i = 0; $i -lt 30; $i++) {
  docker exec eduos-postgres pg_isready -U eduos -d eduos_dev *> $null
  if ($LASTEXITCODE -eq 0) {
    break
  }
  Start-Sleep -Seconds 2
}

$env:DATABASE_URL = $databaseUrl
$env:AUTH_SECRET = $authSecret
$env:CHECK_IN_QR_SECRET = $qrSecret
$env:NEXT_PUBLIC_APP_URL = $appUrl
$env:EDUOS_DEMO_PASSWORD = "EduOS-demo-123456"

pnpm exec prisma db push
pnpm prisma db seed

Start-Process $loginUrl
pnpm dev
