# test-both-tenants.ps1
# MUST run PowerShell as Administrator (hosts file edit needs it).
#
# Adds local hostnames pointing at 127.0.0.1 so you can run
#   npm run dev
# and open BOTH tenants side by side before deploying:
#   http://counsellorsofindia.local:3000
#   http://counsellorsofamerica.local:3000
#
# Requires these hostnames to already be present in your tenant
# domains arrays (src/lib/tenants/in.ts and us.ts), e.g.:
#   domains: ['counsellorsofamerica.com', 'counsellorsofamerica.local', ...]

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entries = @(
    "127.0.0.1 counsellorsofindia.local",
    "127.0.0.1 counsellorsofamerica.local"
)

$current = Get-Content $hostsPath -Raw

foreach ($entry in $entries) {
    if ($current -notmatch [regex]::Escape($entry)) {
        Add-Content -Path $hostsPath -Value $entry
        Write-Host "Added: $entry" -ForegroundColor Green
    } else {
        Write-Host "Already present: $entry" -ForegroundColor Yellow
    }
}

Write-Host "`nDone. Now run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nThen open BOTH in your browser and click through login/signup/footer on each:" -ForegroundColor Cyan
Write-Host "  http://counsellorsofindia.local:3000   - must still be saffron, unchanged" -ForegroundColor White
Write-Host "  http://counsellorsofamerica.local:3000 - should be blue/red themed" -ForegroundColor White
Write-Host "`nTo remove these entries later, edit as Administrator:" -ForegroundColor DarkGray
Write-Host "  $hostsPath" -ForegroundColor DarkGray
