$ErrorActionPreference = "Stop"
Set-Location "D:\Code\education"

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
}

Start-Process "http://localhost:3000/login"
pnpm dev
