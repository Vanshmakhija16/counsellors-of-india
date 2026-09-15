# verify-deploy.ps1
# Run this BEFORE every deploy. If any step fails, DO NOT deploy -
# fix the error first, since it's a shared codebase and a build
# failure takes down India too, not just America.

Write-Host "`n=== 1. Installing dependencies ===" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install FAILED - stopping." -ForegroundColor Red; exit 1 }

Write-Host "`n=== 2. TypeScript type-check ===" -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "TYPE ERRORS FOUND - stopping. Fix these before deploying." -ForegroundColor Red; exit 1 }

Write-Host "`n=== 3. Lint ===" -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) { Write-Host "LINT ERRORS FOUND - review before deploying." -ForegroundColor Yellow }

Write-Host "`n=== 4. Production build (this is the real test) ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBUILD FAILED - DO NOT DEPLOY. This would break BOTH portals." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== ALL CHECKS PASSED ===" -ForegroundColor Green
Write-Host "Build succeeded. Safe to deploy - but still manually check both" -ForegroundColor Green
Write-Host "tenants locally first (see test-both-tenants.ps1)." -ForegroundColor Green
