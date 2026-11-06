# Sajilo Desk verification report

Verification records through **6 November 2026**, including local checks and the production deployment below. This is implementation evidence, not a participant study.

## 5 November: daily information, ready-to-use examples and compact tools

- Astro checked **53 files** with zero errors, warnings or hints. All **23 automated tests** and **14 DOM-entry scenarios** passed. The production build and static route/link/label/CSP checks passed: **34 HTML pages, 62 assets, 957 local references, 70 labelled controls**.
- The real Chrome suite passed **84 responsive checks** in both languages at 320, 360, 390, 768, 1024 and 1440 px, plus **14 interactive workflows**, including real clipboard and JPEG/text downloads. Zero runtime/console errors or external page requests occurred.
- `npm run test:defaults` checks all five tools in both languages at **1366 × 768**. Every default input/result working area fits within the viewport; the lowest ends at **748.49 px**. Instructions and less-frequent photo controls expand on demand. Mobile checks at 390 × 844 confirm no horizontal overflow; long working areas scroll normally.
- Defaults are today's Nepal date with conversion, the labelled 1 January 2000 sample birth date with today's cutoff, converted sample Preeti text, one ropani with equivalents, and an original 1280 × 800 illustration preprocessed to an 800 × 500 JPEG preview.
- The defaults suite also checks the daily line with a browser time zone outside Nepal, Saturday/Sunday holidays, UN observances, calendar expiry, missing-sample recovery, and a late sample request after a user-selected image. These passed.
- Calendar tests cover every date in BS 2083, valid holiday dates, Kathmandu midnight, scoped holidays, Dashain/Tihar ranges, the two Holi regions and a curated fixed-date UN observance map spanning all 12 months. Government and UN sources, review date and coverage limits are recorded in the validation ledger and exposed in the daily card/methodology page.
- Current screenshots and reports are in the ignored runtime/source `tmp/compact/` and `tmp/visual/` directories. Desktop photo/age views, the expanded Nepali daily card, and mobile photo/date views were visually inspected. Inputs remain 16 px and primary controls retain at least 44 px height.
- Physical-device, Safari, independent Nepali review and the other launch limitations below remain outstanding.

### Daily card visibility follow-up

The worldwide key day now uses a highlighted block with 17 px bold text. Nationwide, scoped and weekly holiday status appears on its own visible line; only source details expand. Chrome checks verified both entries outside closed disclosures in English and Nepali, including simultaneous Tihar and World Science Day on 10 November 2026. Layouts passed at 320, 390, 768 and 1366 px. Both-language screenshots were visually inspected. The 23 automated tests, Astro diagnostics, build and static checks passed again.

### Compact matching hero panels

No-holiday text is now hidden both outside and inside the source disclosure. Days without a key day or holiday also hide the empty highlights container. The daily card uses compact date spacing, no rotation or fixed minimum height, and a shared footer row for sources and date conversion. On desktop/tablet, the hero copy and daily card stretch to the same top and bottom edges; on phones they stack naturally. Real Chrome checks verified equal heights and alignment at 768, 1024, 1366 and 1920 px in both languages, hidden no-holiday states, and continued visible holiday/key-day information. Ordinary daily cards remain under 340 px high at 1366 px. Astro checks, the production build, static validation and the updated defaults/browser suite passed; current desktop and mobile screenshots were visually inspected.

### Nepal key days and a separate BS/AD calendar section

- The curated Nepal key-day map contains **24 sourced entries across all 12 BS months**. It includes Bhanu Bhakta Acharya, Balkrishna Sama, Falgunanda and Prithvi Jayanti alongside national observances. Fixed BS/AD dates follow their own calendar, while Buddha Jayanti is explicitly dated for BS 2083. No empty Nepal/world entry is shown, and key days do not create holidays.
- The home page has a separate month/year Calendar section reached by “View calendar” in Today. It supports BS/AD switching, Latin/Nepali year entry, previous/next month, Today, selected-day detail and real clipboard copying of both dates. Small day numbers show the secondary calendar; the exact secondary date range appears above the grid.
- Nationwide, weekly and scoped holidays are **red** in the calendar. A selected holiday uses a red background with white date text; scope remains explicit in selected-day details. Unsupported boundary dates are disabled and do not get holiday colours.
- **31 automated tests** passed, including Gregorian leap years, cross-calendar alignment, partial AD boundary months, all 12 months of Nepal key days, source metadata, AD-based ICT Day, year-specific lunar dates and key-day/holiday separation. Astro checked **60 files**, with zero errors/warnings/hints. All **14 DOM-entry scenarios** passed.
- Static verification passed: **34 HTML pages, 65 assets, 961 local references and 74 labelled controls**.
- The core browser suite again passed **84 layout checks and 14 real workflows**. The defaults suite retained the **10 laptop working-area fits** and matching hero heights. The new calendar suite passed **12 bilingual layouts** at 320, 390, 768, 1024, 1366 and 1920 px, plus calendar switching, date selection, clipboard, navigation, leap dates, range limits and invalid-year recovery. Browser pages made no external HTTP requests and reported no runtime/console errors.
- Calendar tests additionally verify independent Nepal/world highlights, no holiday for Bhanu Jayanti, a simultaneous Nepal day/world day/weekly holiday on 9 August 2026, red weekday national holidays, red selected holidays, and scoped Teej leave. Desktop, mobile, red-holiday and dual-key-day screenshots were visually inspected. Evidence is in `tmp/calendar/`, alongside updated `tmp/compact/` and `tmp/visual/` reports.

## Earlier verification (4 November 2026)

The following records the earlier baseline and its counts before the above changes.

## Environment and result

- Windows, Node 24.18.0; exact npm dependencies and lockfile.
- Source: `G:\My Drive\Research\Nepal_AI\SajiloDesk`.
- Working NTFS runtime: `%LOCALAPPDATA%\SajiloDesk-runtime`. Google Drive's virtual filesystem failed package installation, so dependencies and browser execution use this local directory.
- `npm run verify`: **passed** after the typography changes. Astro checked 49 files with zero errors, warnings or hints.
- Production output: **34 HTML pages**, **61 total assets**, **957 checked local references**, **70 labeled form controls**. Preview indexing remains disabled.
- Isolated real Chrome **156.0.8078.80**, controlled by Playwright 1.64.1 against Wrangler's local static-assets server. No personal browser profile was used.

## Calculation and file checks

**19 automated tests passed.** Coverage includes:

- Ten independent official BS/AD fixtures in both directions, all **45,657 supported days**, all **1,500 BS month boundaries**, invalid dates and range limits, Nepali digits, leap days and Kathmandu midnight across host time zones.
- Age-at-cutoff behavior for leap birthdays and shorter months, using the disclosed completed-month convention.
- Nepal land factors, exact international-foot conversion, reciprocal units, compound-unit validation and rounding carries.
- Preeti spelling fixtures, conjunct/repha/matra cases, punctuation, spaces, line breaks and explicit `[[English]]` preservation. Independent typist review remains pending.
- Real PNG/JPEG/WebP headers and raster encoding/decoding, aspect ratio, exact crop dimensions, input/output limits, quality search and honest unattainable targets.

**14 DOM-entry scenarios passed**, covering the home page, saved tools and five tools in each language. These exercise generated HTML and source handlers through jsdom, separately from the real-browser suite.

## Real-browser and visual review

`npm run test:browser` passed **84 layout checks**: home, all tools, and five tool pages in English and Nepali at **320, 360, 390, 768, 1024 and 1440 px**. No document-level horizontal overflow was found. Another **36 supporting-page checks** covered saved tools, about, contact, privacy, methodology, guide index and all three guides at 390 and 1440 px in both languages. Keyboard Tab → Skip to content → Enter reached the main region.

**14 real-browser workflows passed** at a 390 px viewport:

- Search in Romanized Nepali and Devanagari; saving a tool and reopening it on My Tools.
- Both date directions, invalid-date recovery and actual clipboard contents.
- Leap-day age example and clipboard contents.
- Preeti example, actual clipboard contents and downloaded UTF-8 text. Windows clipboard CRLF is normalized only by the assertion.
- One-ropani land conversion with localized output.
- Synthetic PNG selection, aspect-lock update, exact center crop, browser JPEG encoding, downloaded-file decoding, actual byte-count comparison and clear/reset.

The suite recorded **zero console/runtime errors and zero external HTTP requests** during these local workflows. This checks the exercised paths; it is not an audit of every browser permission or extension.

Screenshots were captured and visually inspected for English/Nepali homes, date results, photo forms/results, and representative guide/contact pages. Changes following inspection:

- Raised small/medium text: desktop descriptions 15–17 px, form labels 14 px, inputs 16 px, most helper text 13 px. Large headings retained their existing scale.
- Kept mobile home cards compact with clear names and short task labels; detailed descriptions remain on the All Tools page.
- Increased favorite controls to 44 px and improved spacing around controls.
- Centered the photo upload contents and reduced unused upload/preview height on phones.
- Fixed missing whitespace between mobile hero sentences.

Evidence is saved in the ignored `tmp/visual/` directory in the runtime and copied to the source workspace. `browser-report.json` records the reproducible core checks; `supporting-report.json` records the additional page/keyboard checks. Full-page screenshots show fixed mobile navigation at the captured viewport's bottom; visitors scroll the content behind it. Footer padding leaves the final links accessible.

## Static deployment checks

Generated pages passed local link, one-H1, title/description, language, reciprocal hreflang, canonical, sitemap, button-name, form-label and CSP checks. All scripts/fonts/assets are local. Inline Astro scripts have generated CSP hashes. No server entry, secret file or research document is included in `dist`.

Wrangler's local static-assets server returned 200 for representative English/Nepali routes and 404 for an unknown navigation route, with the configured security headers. Robots and sitemap returned 200. The output is below the documented free asset count and per-file limits. HTTPS, actual hosting quotas and public canonical hostnames have not been verified on a deployed site because no deployment was requested yet.

## Remaining launch checks

1. Independent Nepali wording and Preeti typist review, especially rare glyphs and mixed Office/PDF text. Broader historical calendar spot checks beyond the current official fixtures.
2. Physical Android testing on a modest-memory device and a slow connection. Current phone coverage uses desktop Chrome viewports, not physical phones.
3. Safari/iOS and Firefox, EXIF orientation fixtures, image encoder differences, and the user-denied clipboard path. Real Chrome's synthetic image download passed; it does not establish these other cases.
4. Real-device smoke tests on the production URL and owner-account Search Console verification/sitemap submission. The Cloudflare launch checks below supersede the earlier pending deployment status.
5. The proposed five-shop/ten-user pilot and competitor timed benchmark. No interviews, outreach, measured retention or traffic forecasts are claimed.

Public contact is **sajilodesk@gmail.com**. These initial checks preceded publication; the dated deployment records below describe the subsequent GitHub Pages preview and Cloudflare production launch. No application analytics or advertising has been activated.

## GitHub Pages project-path preparation (5 November 2026)

Prepared `/SajiloDesk/` routes, language redirects, favicon/license links, sample-image loading, canonicals, language alternates and sitemap for the requested project URL. `PUBLIC_BASE_PATH=/` remains the local/custom-domain option. The Pages workflow runs `npm run verify` with Node 24 before uploading and deploying the static output. The public README is now visitor-facing; developer/setup instructions are in `docs/development.md` and `docs/github-pages.md`.

With `PUBLIC_BASE_PATH=/SajiloDesk/`, Astro checked 61 files without errors/warnings/hints; all 31 tests and 14 DOM-entry scenarios passed. Static verification checked 34 HTML pages, 68 assets, 962 local references and 74 labelled controls. Real Chrome passed 84 layout checks and 14 workflows at the project path, plus the defaults and 12-layout calendar suites. No runtime/console errors or unexpected external page requests occurred. Generated HTML includes a supported CSP/referrer policy because GitHub Pages does not interpret Cloudflare `_headers`. This records local preparation and validation; remote publication must be verified separately.

## Nepali wording review before publication (5 November 2026)

Reviewed Nepali copy throughout the homepage, navigation, calendar, five tools, instructions, result/status/error messages, saved tools, three guides and four information pages. Reworded literal translations as task-focused Nepali; clarified area-unit conversion, file size versus pixel dimensions, Preeti text and completed-age conventions. Saved tools use consistent wording about the favourites list. Proper observance names and source links were retained apart from a few clearer Nepali labels.

The Today card now explicitly formats the Nepali weekday, Gregorian month and clock digits without relying on the browser having the Nepali `Intl` locale. English formatting and the date/area/photo calculation rules are unchanged.

Verification after the wording pass: 31 unit/calculation tests, 34 generated pages, 14 DOM-entry scenarios, 84 responsive browser checks and 14 browser workflows passed. Defaults still fit all 10 English/Nepali tool workspaces at 1366 × 768; the calendar suite passed 12 layouts. An additional review covered all 16 Nepali routes at 320, 390, 768 and 1366 px (64 layouts) without document overflow or runtime errors. Independent native-speaker editorial sign-off and specialist Preeti glyph review are still separate checks; this is an agent-led wording review.

## Public GitHub Pages verification (5 November 2026)

After the owner approved public repository visibility, `ghimiredhikura/SajiloDesk` was made public and Pages was enabled with the Actions publishing source. [Workflow run 41971594564](https://github.com/ghimiredhikura/SajiloDesk/actions/runs/41971594564) successfully verified, built and deployed application commit `bd485e645798914cd90dfb67bef5affab476f382`. The initial run before Pages was available failed to deploy; the later successful run supersedes it.

An unauthenticated HTTPS request to `https://ghimiredhikura.github.io/SajiloDesk/` returned 301 to `https://ghimiredeepak.com.np/SajiloDesk/`, then 200. The project inherits the personal site's domain. HTTPS enforcement is enabled on this project's Pages settings; no personal-site or DNS changes were made.

An isolated Chrome session opened the requested address, followed the project and language redirects, switched English/Nepali, checked the Nepali weekday/month and clock display, navigated both BS/AD calendar views and found holiday markings. It opened all five tools in both languages and verified usable default results, including the actual 800 × 500 photo output. The Nepali homepage and Romanized search also passed at a 390 px viewport. No browser runtime/console errors or failed HTTP responses occurred in these live checks. These checks supersede the earlier pre-deployment status above. Physical-device and independent editorial checks remain outstanding; `sajilodesk.com.np` remains pending and search indexing remains disabled until the final hostname/release is ready.

## Cloudflare production launch and Nepali default (6 November 2026)

Published the static site at **https://sajilodesk.com/** after the owner purchased the domain and approved Cloudflare access. Cloudflare provisioned DNS and trusted HTTPS for the apex and `www`; a separate redirect Worker sends HTTP and `www` requests to the HTTPS apex while preserving paths and queries. The `.com.np` application was rejected. The existing GitHub Pages project remains a separate, non-indexable preview; the personal site's settings were not changed. Production deployment instructions are in [cloudflare.md](cloudflare.md).

The production verification passed Astro diagnostics, all **31 unit/calculation tests**, **14 DOM-entry scenarios**, and static checks for **34 HTML pages, 69 assets, 962 local references and 74 labelled controls**. Production canonicals, alternate-language links, robots and sitemap use the custom domain without the project prefix. Public pages are indexable; saved tools and the 404 page retain `noindex`. The local Cloudflare server passed **84 responsive layouts and 14 browser workflows**, the ten-tool-workspace defaults suite, and the **12-layout calendar suite**.

Isolated real Chrome checks on the live hostname passed English/Nepali switching, Nepal date/clock text, both calendar modes and holiday markings, all five tools in both languages with their working example results, the actual 800 × 500 JPEG preview, and mobile Nepali layout/search. Live checks also verified the response security headers, production robots/sitemap, saved-page exclusions, a genuine HTTP 404, and HTTP/`www`/old-project-prefix redirects with preserved queries. These exercised paths produced no runtime/console errors or failed HTTP responses. A plain automated HTTP client received Cloudflare error 1010; the live checks therefore used an isolated real Chrome browser without changing Cloudflare's security settings.

Cloudflare initially injected its Web Analytics beacon, which conflicted with the site's no-analytics policy and script restrictions. The documented `Cache-Control: public, no-transform` header prevents that automatic injection; subsequent live checks found no beacon or related errors. The favicon fallback now redirects to the existing SVG. No application analytics, advertisements or paid Cloudflare plan were enabled.

New root visitors now open **`/ne/`**. Targeted local and live Chrome checks passed fresh storage, a saved explicit English choice, switching back to Nepali, unavailable storage, and the no-JavaScript language chooser. The default search-engine alternate also points to Nepali. Saved language choices remain respected. The final main Worker version is `40745940-cea5-46e5-94a0-ffbdee487085`; the redirect Worker version is `7e27282a-33f8-4eee-8859-e44c52a7a36e`.

Search Console verification/submission and actual Google indexing have not been performed. Physical-device, other-browser and independent editorial/typist checks remain separate follow-up work.

## Retired GitHub Pages copy (6 November 2026)

At the owner's request, removed GitHub Pages from `ghimiredhikura/SajiloDesk`. GitHub returned HTTP 204 for the removal and HTTP 404 on the subsequent Pages-settings query; the public source repository and its production homepage remain available. Replaced the Pages publishing workflow with `.github/workflows/verify.yml`, which only installs dependencies and verifies the custom-domain production build. It has no Pages deployment job or publishing permissions.

Isolated Chrome verified HTTP 404 for both `https://ghimiredeepak.com.np/SajiloDesk/` and its `/ne/` page. The personal homepage still returned HTTP 200. `https://sajilodesk.com/` returned HTTP 200 and opened `/ne/` with the Nepali document language. No Cloudflare configuration or personal-site settings were changed for this retirement.
