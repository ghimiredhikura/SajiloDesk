param([switch]$Install,[switch]$Check,[switch]$Preview)
$ErrorActionPreference = 'Stop'
$sajiloSource = Split-Path -Parent $PSScriptRoot
$sajiloRuntime = Join-Path $env:LOCALAPPDATA 'SajiloDesk-runtime'
New-Item -ItemType Directory -Force -Path $sajiloRuntime | Out-Null
# A local NTFS runtime avoids Google Drive virtual filesystem package-install errors.
foreach ($entry in @('src','public','tests','scripts','docs','package.json','package-lock.json','astro.config.mjs','tsconfig.json','wrangler.jsonc','wrangler.redirect.jsonc')) {
  $sourceEntry = Join-Path $sajiloSource $entry
  if (Test-Path -LiteralPath $sourceEntry) { Copy-Item -LiteralPath $sourceEntry -Destination $sajiloRuntime -Recurse -Force }
}
Push-Location -LiteralPath $sajiloRuntime
try {
  if ($Install) { npm ci --no-fund; if ($LASTEXITCODE -ne 0) { throw 'Installation failed.' } }
  if ($Check) { npm run verify; if ($LASTEXITCODE -ne 0) { throw 'Verification failed.' } }
  if ($Preview) { npm run dev }
  if (Test-Path -LiteralPath 'dist') { Copy-Item -LiteralPath 'dist' -Destination $sajiloSource -Recurse -Force }
} finally { Pop-Location }
