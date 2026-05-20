$ErrorActionPreference = "Stop"
Set-Location "D:\Code\education"

$dbUser = "eduos"
$dbPassword = "eduos_password"
$dbName = "eduos_dev"
$dbPort = 55432

$databaseUrl = "postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}?schema=public"
$authSecret = "eduos-local-dev-auth-secret-change-me"
$qrSecret = "eduos-local-dev-qr-secret-change-me"
$appUrl = "http://localhost:3000"
$loginUrl = "http://localhost:3000/login"

$localPostgresRoot = Join-Path (Get-Location) ".local\postgres"
$localPostgresData = Join-Path $localPostgresRoot "data"
$localPostgresLog = Join-Path $localPostgresRoot "postgres.log"
$localPostgresPasswordFile = Join-Path $localPostgresRoot "pwfile.txt"

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

function Find-PostgresBin {
  $candidates = @()

  if ($env:POSTGRES_BIN) {
    $candidates += $env:POSTGRES_BIN
  }

  $postgresRoot = Join-Path $env:ProgramFiles "PostgreSQL"
  if (Test-Path $postgresRoot) {
    $candidates += Get-ChildItem -Path $postgresRoot -Directory -ErrorAction SilentlyContinue |
      Sort-Object Name -Descending |
      ForEach-Object { Join-Path $_.FullName "bin" }
  }

  $fromPath = Get-Command pg_ctl.exe -ErrorAction SilentlyContinue
  if ($fromPath) {
    $candidates += Split-Path $fromPath.Source -Parent
  }

  foreach ($candidate in $candidates | Where-Object { $_ } | Select-Object -Unique) {
    $required = @("initdb.exe", "pg_ctl.exe", "pg_isready.exe", "psql.exe", "createdb.exe")
    $missing = $required | Where-Object { -not (Test-Path (Join-Path $candidate $_)) }
    if ($missing.Count -eq 0) {
      return $candidate
    }
  }

  throw "PostgreSQL tools were not found. Install PostgreSQL for Windows, then open EduOS again."
}

function Invoke-NativeQuiet {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"

  try {
    & $FilePath @Arguments *> $null
    return $LASTEXITCODE
  } catch {
    return 1
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Invoke-NativeOutput {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"

  try {
    $output = & $FilePath @Arguments 2>$null
    return @{ Code = $LASTEXITCODE; Output = $output }
  } catch {
    return @{ Code = 1; Output = @() }
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Initialize-LocalPostgres($pgBin) {
  $pgVersionFile = Join-Path $localPostgresData "PG_VERSION"

  if (Test-Path $pgVersionFile) {
    return
  }

  if ((Test-Path $localPostgresData) -and ((Get-ChildItem -Force $localPostgresData).Count -gt 0)) {
    throw "Local Postgres data directory exists but is not initialized: $localPostgresData"
  }

  New-Item -ItemType Directory -Force $localPostgresRoot | Out-Null
  Set-Content -Path $localPostgresPasswordFile -Value $dbPassword -NoNewline -Encoding utf8

  try {
    $initdb = Join-Path $pgBin "initdb.exe"
    & $initdb -D $localPostgresData -U $dbUser --pwfile=$localPostgresPasswordFile -A scram-sha-256 -E UTF8
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to initialize local Postgres data directory."
    }
  } finally {
    Remove-Item -Path $localPostgresPasswordFile -Force -ErrorAction SilentlyContinue
  }
}

function Test-LocalPostgresAccepting($pgBin) {
  $pgIsReady = Join-Path $pgBin "pg_isready.exe"
  return (Invoke-NativeQuiet $pgIsReady @("-h", "localhost", "-p", "$dbPort")) -eq 0
}

function Start-LocalPostgres($pgBin) {
  if (Test-LocalPostgresAccepting $pgBin) {
    return
  }

  $pgCtl = Join-Path $pgBin "pg_ctl.exe"
  $options = "-p $dbPort -c listen_addresses=localhost"
  & $pgCtl -D $localPostgresData -l $localPostgresLog -o $options start
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to start local Postgres. Check $localPostgresLog"
  }

  for ($i = 0; $i -lt 30; $i++) {
    if (Test-LocalPostgresAccepting $pgBin) {
      return
    }
    Start-Sleep -Seconds 1
  }

  throw "Local Postgres did not become ready. Check $localPostgresLog"
}

function Ensure-LocalDatabase($pgBin) {
  $psql = Join-Path $pgBin "psql.exe"
  $createdb = Join-Path $pgBin "createdb.exe"
  $previousPgPassword = $env:PGPASSWORD
  $env:PGPASSWORD = $dbPassword

  try {
    $query = "SELECT 1 FROM pg_database WHERE datname = '$dbName';"
    $check = Invoke-NativeOutput $psql @("-h", "localhost", "-p", "$dbPort", "-U", $dbUser, "-d", "postgres", "-w", "-tAc", $query)
    if ($check.Code -ne 0) {
      throw "Cannot connect to local Postgres on port $dbPort as $dbUser. If another database is using this port, stop it and open EduOS again."
    }

    if ((($check.Output -join "").Trim()) -ne "1") {
      & $createdb -h localhost -p $dbPort -U $dbUser -w $dbName
      if ($LASTEXITCODE -ne 0) {
        throw "Failed to create database $dbName."
      }
    }

    $verify = Invoke-NativeQuiet $psql @("-h", "localhost", "-p", "$dbPort", "-U", $dbUser, "-d", $dbName, "-w", "-c", "select 1;")
    if ($verify -ne 0) {
      throw "Cannot connect to database $dbName as $dbUser."
    }
  } finally {
    $env:PGPASSWORD = $previousPgPassword
  }
}

function Test-AppReady($url) {
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    return ($response.StatusCode -ge 200) -and ($response.StatusCode -lt 400)
  } catch {
    return $false
  }
}

function Wait-AppReady($url, $timeoutSeconds) {
  $deadline = (Get-Date).AddSeconds($timeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-AppReady $url) {
      return $true
    }

    Start-Sleep -Milliseconds 500
  }

  return $false
}

function Get-ListeningProcessId($port) {
  try {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop |
      Select-Object -First 1

    if ($connection) {
      return $connection.OwningProcess
    }
  } catch {
    return $null
  }

  return $null
}

Set-EnvValue "DATABASE_URL" $databaseUrl
Set-EnvValue "AUTH_SECRET" $authSecret
Set-EnvValue "CHECK_IN_QR_SECRET" $qrSecret
Set-EnvValue "NEXT_PUBLIC_APP_URL" $appUrl
Set-EnvValue "EDUOS_DEMO_PASSWORD" "EduOS-demo-123456"

$pgBin = Find-PostgresBin
Initialize-LocalPostgres $pgBin
Start-LocalPostgres $pgBin
Ensure-LocalDatabase $pgBin

$env:DATABASE_URL = $databaseUrl
$env:AUTH_SECRET = $authSecret
$env:CHECK_IN_QR_SECRET = $qrSecret
$env:NEXT_PUBLIC_APP_URL = $appUrl
$env:EDUOS_DEMO_PASSWORD = "EduOS-demo-123456"

pnpm exec prisma db push
pnpm prisma db seed

if (Wait-AppReady $loginUrl 5) {
  Write-Host "EduOS is already running at $loginUrl"
  Start-Process $loginUrl
  exit 0
}

$existingAppPid = Get-ListeningProcessId 3000
if ($existingAppPid) {
  Write-Host "Port 3000 is already in use by process $existingAppPid."
  Write-Host "EduOS may still be starting. Open $loginUrl after it becomes ready."
  Write-Host "If it is stuck, stop that process first: taskkill /PID $existingAppPid /F"
  Start-Process $loginUrl
  exit 0
}

Start-Process $loginUrl
pnpm dev -- --port 3000
