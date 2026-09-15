# Pre-deploy checklist — run every time before deploying

## 1. Automated checks
```powershell
.\verify-deploy.ps1
```
Do not proceed if this fails.

## 2. Local dual-tenant test (first time only, then just `npm run dev`)
```powershell
# Run PowerShell AS ADMINISTRATOR
.\test-both-tenants.ps1
```

## 3. Manual click-through — India (counsellorsofindia.local:3000)
- [ ] Homepage loads, saffron branding, coi.png logo
- [ ] /login — saffron button, saffron focus rings, logo at original size/position
- [ ] /signup — saffron theme throughout, step counter (Account/Plan/Payment/Build) is saffron
- [ ] Footer shows India logo + "Counsellors of India"
- [ ] No console errors in browser devtools

## 4. Manual click-through — America (counsellorsofamerica.local:3000)
- [ ] Homepage loads, blue theme
- [ ] /login — blue button, blue focus rings, smaller logo, shifted layout
- [ ] /signup — blue theme, red hover on right panel, blue step counter
- [ ] Footer shows US logo
- [ ] No console errors

## 5. After deploying to production
- [ ] Open real counsellorsofindia.com — confirm unchanged
- [ ] Open counsellorsofamerica.com (or whatever URL is live) — confirm America theme
- [ ] Do ONE test signup/login flow on each, end to end

## If anything breaks on India after a deploy
Roll back immediately (redeploy the previous build/commit), then debug
locally with the dual-tenant test script before trying again — don't
debug live on production.
