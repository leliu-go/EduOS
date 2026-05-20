[CmdletBinding()]
param(
  [switch]$RunQualityGates
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$checkRelease = Join-Path $scriptRoot "check-release.ps1"

& $checkRelease -RunQualityGates:$RunQualityGates

Write-Output "Release checklist is ready for human review."
Write-Output "No deploy, code signing, production database migration, or publish step was executed."
