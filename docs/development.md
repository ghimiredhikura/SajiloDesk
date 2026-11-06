# Developer and local setup guide

The following contains the project setup, verification and historical hosting notes. The production target is now `https://sajilodesk.com` on Cloudflare; see [production deployment](cloudflare.md). The [GitHub Pages guide](github-pages.md) describes the earlier preview.

# Sajilo Desk / सजिलो डेस्क

A bilingual, browser-local utility desk for Nepal and Nepalis worldwide. The first implementation contains five tools, a responsive orange/navy interface, search with English/Nepali/Romanized aliases, device-local favorites, and three practical guides.

**Status:** the bilingual site was published on GitHub Pages on 5 November 2026 and launched at `https://sajilodesk.com` on Cloudflare on 6 November. The earlier `.com.np` application was rejected. Public contact: **sajilodesk@gmail.com**. English and Nepali pages have passed real Chrome workflows and responsive visual review. Physical-device checks and independent Nepali review remain separate checks.

## Run locally

Use Node **24 LTS** (minimum supported by this Astro release: 22.23.4). All package versions are locked.

### From this Google Drive folder (Windows)

Package installation has failed on the Google Drive virtual filesystem. Use the included helper to copy the source to `%LOCALAPPDATA%\SajiloDesk-runtime` and run it from that local NTFS folder.

For the **first launch**, open PowerShell and run:

```powershell
Set-Location -LiteralPath 'G:\My Drive\Research\Nepal_AI\SajiloDesk'
.\scripts\sync-local.ps1 -Install -Preview
```

Wait for the terminal to display the local server URL, then open either page in your browser:

- English: [http://127.0.0.1:4321/en/](http://127.0.0.1:4321/en/)
- Nepali: [http://127.0.0.1:4321/ne/](http://127.0.0.1:4321/ne/)

Keep PowerShell running while using the site. If port 4321 is busy, use the port printed in the terminal with `/en/` or `/ne/` appended. To open the English page from a **second PowerShell window** at the default port:

```powershell
Start-Process 'http://127.0.0.1:4321/en/'
```

For **later launches**, reuse the installed dependencies:

```powershell
Set-Location -LiteralPath 'G:\My Drive\Research\Nepal_AI\SajiloDesk'
.\scripts\sync-local.ps1 -Preview
```

Stop the server with **Ctrl+C**. After editing source files in Google Drive, stop it and rerun the helper to copy the changes. Add `-Install` again after dependency changes. Despite its name, the helper's `-Preview` switch starts `npm run dev`; it does not serve a production build.

To run typechecking, tests, the static build and entry-handler checks:

```powershell
.\scripts\sync-local.ps1 -Check
```

The helper copies a built `dist` back to this project folder. It does not copy `.env`, credentials or the supplied private/source materials. It performs a one-shot sync, not continuous file watching; use a normal local Git checkout for continuous editing.

### From a normal local checkout

In a checkout on a local drive, run:

```sh
npm ci
npm run dev
```

Open the English or Nepali URL above once the server is ready. The root remembers only the chosen language and defaults to Nepali. Choosing English explicitly makes subsequent root visits use English in that browser. Tool inputs are never placed in URLs or persistent storage.

## Ready-to-try defaults and daily information

All five tools open with usable values and a result: today's Nepal date, a labelled sample birth date with today's cutoff, sample Preeti text, one ropani, and an original example image resized to 800 × 500. Replace the values or image to use your own. Today and the existing example actions remain available. Tool instructions and advanced photo settings expand when needed.

“Today at a glance” shows a highlighted worldwide key day and a separate notice when a holiday is listed, with expandable source details. Nepal holidays use the published **BS 2083** calendar (14 April 2026–13 April 2027), including **Saturday and Sunday** weekly holidays and labelled regional/community exceptions. Worldwide highlights use selected fixed-date UN observances. Source links and the review date are shown in the card. Later notices may add holidays; unknown lunar dates are not guessed. Update `src/lib/observances.ts` annually and when new official notices appear. Outside the mapped year, the card requests an update.

With the local site running, check ready-to-use defaults, compact layouts and example-image recovery:

```sh
npm run test:defaults
```

Like the browser suite below, this defaults to `http://127.0.0.1:8787`; set `TEST_BASE_URL` to use another local server.

## Nepal key days and the calendar section

The Today card has separate labelled highlights for Nepal and world key days. The curated Nepal map has **24 entries spanning all 12 BS months**, including Bhanu Bhakta Acharya, Balkrishna Sama, Falgunanda and Prithvi Jayanti, plus national observances. Each entry links to a source. Entries appear only on matching dates; an observance does not create a public holiday.

Fixed BS dates repeat in BS; National ICT Day follows its fixed AD date, 2 May. Lunar Buddha Jayanti is explicitly dated for BS 2083 and is not repeated blindly in later years. The reviewed key-day edition starts at BS 2083. Maintain entries and their source references in `src/lib/nepal-key-days.ts`.

The home page has a separate **Calendar** section (`/en/#calendar` or `/ne/#calendar`), linked by “View calendar” in Today. Switch BS/AD, select a month/year, navigate months, return to Today, and select a day to see both dates and its Nepal/world observances and holiday status. Each day cell shows the other calendar's date underneath, with the full secondary month range above. Holiday dates are marked red, including selected holidays; regional/community scope remains in the selected-day details. Unsupported boundary dates are disabled. Copy both dates from the selection panel.

```sh
npm run test:calendar
```

This uses the same `TEST_BASE_URL` and isolated Chrome setup as the other browser suites.

## What works

| Tool | Behavior and limits |
| --- | --- |
| BS ↔ AD | Explicit year/month/day, both numeral systems, strict validation, two-calendar copy. BS 1975-01-01 through 2099-12-30; AD 1918-04-13 through 2043-04-13. Bundled MIT calendar library v1.2.7. |
| Age on a date | Birth/cutoff independently accept BS or AD; cutoff defaults to Nepal today. Gregorian completed months, grouped into years, with remaining days. Missing anniversaries clamp to the shorter month’s last day. |
| Preeti → Unicode | Paste, example, reset, readable preview, copy and UTF-8 text download. `[[English]]` preserves explicitly marked spans. 50,000-character limit. No Romanized typing or reverse conversion claim. |
| Photo resize/compress | JPEG, PNG, still WebP; browser orientation; fit or center crop; aspect lock; quality and generic KB targets; preview/actual bytes/download. Input ≤20 MiB, ≤24 MP and ≤12,000 px/side; output ≤16 MP. PNG ignores quality. Impossible targets are reported with a 25%-smaller option. |
| Land area | Ropani–Aana–Paisa–Daam, Bigha–Kattha–Dhur, decimal units, ft² and m². Nepal convention; full-precision calculations, 4-decimal display. |

Supporting pages: Home, All Tools, My Tools, About, Feedback, Privacy, Sources/Methods, guide index and three guides, each in English and Nepali. Feedback prepares a local draft or opens the approved email address; it does not send messages automatically.

## Verification

```sh
npm run verify
```

Runs Astro/TypeScript diagnostics, 31 calculation/raster/calendar tests (including every supported calendar day), the production build, static link/metadata/label/CSP checks, and 14 generated-HTML/DOM-event scenarios covering both languages. The image tests use a native Canvas adapter; the event tests use jsdom. A separate real-browser suite is available:

```sh
# Terminal 1, after building:
npm exec -- wrangler dev --local --port 8787
# Terminal 2, in the same local checkout:
npm run test:browser
```

The browser suite uses Playwright with an isolated installed Chrome browser, not your personal profile. It checks English/Nepali home and tool layouts at six widths from 320 to 1440 px, runs 14 real workflows, validates clipboard/download contents, and saves screenshots plus a JSON report in `tmp/visual/`. `TEST_BASE_URL` and `BROWSER_CHANNEL` can override the default local URL and Chrome channel. Restart Wrangler after rebuilding if its asset watcher reports stale files. See [the test report](test-results.md) for exact evidence and remaining checks.

```sh
npm run build                 # ordinary portable static output in dist/
npm run preview              # preview production output
npm exec -- wrangler dev --local --port 8787
```

The Wrangler command exercises the configured static-asset routing and 404 behavior locally. There is no SSR entry point, database, Worker script, API service or paid runtime dependency. Only the photo/text tool pages load their processing code. Fonts are served locally.

## Deploy when ready

The single target is **Cloudflare Workers Static Assets — Free, asset-only**. No live deployment or DNS changes have been made.

1. Complete the remaining physical-device, Safari and Nepali review in the test report.
2. Connect the GitHub repository to Cloudflare Workers Builds and select `main` and the repository root.
3. Use `npm run verify` as the build command and `npx wrangler deploy` as the deploy command. Set Node 24 in the build environment.
4. Set `PUBLIC_SITE_URL` to the **actual HTTPS hostname** assigned by Cloudflare or your approved domain. Keep `PUBLIC_INDEXABLE=false` while the hostname/release is unsettled. The default local build uses `http://localhost:4321` and noindex; never publish that build as indexable production.
5. Set `PUBLIC_CONTACT_EMAIL=sajilodesk@gmail.com`. No analytics token is needed; analytics is not installed.
6. After production review, set `PUBLIC_INDEXABLE=true`, rebuild, verify canonicals/hreflang/sitemap, then deploy. Configure preview indexing separately if enabling preview builds.

For an authorized local deployment, copy `.env.example` to `.env`, fill the actual hostname, sign in with `npx wrangler login`, then run `npm run deploy`. The deployment helper refuses a missing/non-HTTPS/example hostname and verifies before publishing. Do not paste account tokens into source or chat. Source control excludes `.env`.

`wrangler.jsonc` publishes `dist/`, uses `not_found_handling: "404-page"`, and has no Worker `main` or `run_worker_first`. The build finalizer hashes any Astro-inlined scripts into the CSP. Every deployment must use `npm run build` (or `verify`), not a bare `astro build` that skips that finalizer.

Current free limits, reviewed 4 November 2026: unlimited/free static requests; 20,000 deployed files/version; 25 MiB/file; 3,000 Workers Builds minutes/month, one concurrent build, 20-minute build timeout. No additional static-asset storage charge. Recheck [Cloudflare’s limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) and [Builds quotas](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) before launch. Owner time, development subscriptions and any purchased domain are outside the NPR 0 runtime target.

For `sajilodesk.com.np`, wait for registry approval and confirm DNS control. Workers Custom Domains require an active Cloudflare zone. Preserve all existing DNS/email records if a nameserver change is needed. A provider-assigned hostname can be used first; none has been claimed. Exact domain, indexing, pilot and rollback steps are in [the launch plan](launch-plan.md).

Rollback: select the prior verified Cloudflare deployment, or use `npx wrangler rollback <verified-version-id>`. Rebuild the matching Git commit if needed. Record the production URL, source commit and Cloudflare version on every release.

## Project map and decisions

- `src/pages/`: pre-rendered language/tool/guide routes, sitemap, robots and 404.
- `src/lib/`: deterministic date, age, land, text and image functions.
- `src/scripts/`: page handlers, search, favorites and clipboard/download actions.
- `src/components/`, `src/layouts/`, `src/styles/`: shared bilingual interface.
- `tests/`: fixtures, full-range calendar checks, raster output checks and DOM-event scenarios.
- `public/licenses/`: full third-party notices distributed with the site.
- [Research and 14-opportunity backlog](research.md): evidence, unknowns, competitors and ranked top five.
- [Launch and growth plan](launch-plan.md): five-shop/ten-user pilot, first 30 days, hosting, domain and future revenue.
- [Sources and validation ledger](validation-ledger.md): exact methods, dataset versions and human-review boundaries.

Keep the core free. No fake live prices, testimonials, user counts, official presets or analytics claims. PDF utilities, Romanized typing, reverse text conversion and live data feeds are future work. No outreach or ad installation has occurred.
