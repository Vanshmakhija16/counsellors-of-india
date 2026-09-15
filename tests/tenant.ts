// Shared tenant test config.
//
// src/middleware.ts resolves the tenant purely from the real HTTP Host
// header (see resolveTenantId in src/lib/tenants/index.ts). Browsers do
// not allow overriding the Host header on real requests — including
// through Playwright's page.route() interception, since Host is a
// protected/forbidden header at the browser network-stack level. So
// faking it that way silently doesn't work; the request still goes out
// as "localhost" and you always get the India tenant back.
//
// The reliable way to test a non-default tenant locally is the one your
// own code already documents (see the domains list in src/lib/tenants/us.ts):
// map a real hostname to 127.0.0.1 via the OS hosts file, then navigate
// to that hostname directly so the browser sends a real, correct Host
// header.
//
// ONE-TIME SETUP (Windows, as Administrator):
//   1. Open Notepad as Administrator
//   2. Open C:\Windows\System32\drivers\etc\hosts
//   3. Add this line:
//        127.0.0.1  counsellorsofamerica.local
//   4. Save
//
// Then `npm run dev` and these tests will hit the real US tenant at
// http://counsellorsofamerica.local:3000.

export const US_BASE_URL =
  process.env.US_BASE_URL ?? 'http://counsellorsofamerica.local:3000'
