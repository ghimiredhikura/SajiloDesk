# Sajilo Desk verification report

Verification records through **7 November 2026**, including local checks and the production deployment below. This is implementation evidence, not a participant study.

## 7 November: full PDF previews and clearer output

- Original PDFs now preview immediately, with all pages scrollable. Result previews include all extracted/merged/compressed pages; Original/Result switches and a merged-input file chooser support comparison. Fit-width/zoom preserves the current page. The 30-page fixture reaches the final page with at most five allocated canvases. Previews render at screen density rather than the former 60 DPI JPEG.
- Default compression selectively re-encodes suitable JPEG images at 92% without resampling or rasterising text/vectors. The browser suite verified smaller output, unchanged image dimensions and byte-for-byte identical text/vector content streams. Lossless mode retained the original JPEG bytes. Unsupported/masked/colour-managed images are kept unchanged. Scanned-page rebuilding is explicit at 250 DPI/90% rather than the old 120 DPI/72% default.
- Image export now defaults to 300 DPI PNG, with 95% JPEG available. The fine-text/vector fixture produced a 2,480 × 3,509 PNG; its fine text and hairlines were visually inspected. Source quality and pixel bounds remain explicit.
- All 52 automated tests pass, including density metadata with unchanged PNG/JPEG pixels. Astro reports zero errors/warnings/hints; static links, labels, language alternates and CSP checks pass. PDF browser checks pass eight bilingual Chrome layouts and two iPhone 14 WebKit touch flows, including all-page scrolling, source/result switching, file previews, download correctness, memory bounds, errors/cancel and no uploads/external requests. Physical iOS testing remains separate.

## 7 November: iPhone Korea selector correction

- Reproduced the reported failure in WebKit with iPhone 14 device settings and an input blur during the option tap: the original build retained an empty visa and disabled task, and the search font was 14 px. The same probe after the fix commits E-9, enables the task and reports a 16 px input.
- The focused mobile suite passes four bilingual WebKit/Chromium flows with portrait/landscape layouts, real current/target taps, the forced focus-loss sequence, explicit-only navigation, scrolling/pointercancel, keyboard selection, compatible/incompatible choice handling, the compact guide selector, dropdown toggling and a short viewport. Pinch zoom remains enabled. Screenshots were visually inspected.
- The existing relevance suite still passes all 49 current visa choices and six bilingual responsive workflows. All 50 automated tests, Astro checks (zero errors/warnings/hints) and static link/label/CSP checks pass. No content, eligibility rules, homepage layout, database or moderation changes were made.
- This verifies emulated touch/WebKit behaviour and CSS zoom guards, not the physical iPhone's OS keyboard or automatic zoom. See [the selector implementation notes](korea-selector-rules.md#iphone-touch-and-focus-regression).

## 7 November: relevant Korea menus and everyday PDF tools

- Korea menus now derive procedures and target-status shortlists from the selected current status. The real native select and typed search use the same allowed choices. Changing status clears incompatible task/target values, and guarded submission rejects injected or stale values. All 49 current-status choices and six bilingual responsive flows passed, including E-9, D-2, F-5, C-3, old direct links and the special-case route. The rules are navigation aids, not a legal eligibility determination; see [selector sources and boundaries](korea-selector-rules.md).
- The sixth utility supports PDF extraction, merging with file reordering, compression and a selected page as JPG/PNG, with an initial example result. The PDF Chrome suite passed eight bilingual layouts (320/390/768/1366 px), actual downloads, page order/dimensions/rotation, image dimensions, scanned compression, original-file fallback, invalid/encrypted/signed/form inputs, cancellation, search and favourites. There were no runtime/console errors, external requests or uploads.
- All 50 automated tests pass, including real PDF copy and range/boundary cases. Static build, sitemap, local references, labels, language alternates, CSP and platform asset checks pass. The 14 existing tool DOM workflows remain covered. PDF page previews and both desktop/mobile layouts were visually inspected. Physical-device and Safari checks remain separate.
- PDF limitations, compression trade-offs, input/output bounds and local asset preparation are documented in [the PDF tool guide](pdf-tool.md). No D1 schema or comment changes are needed for the PDF utility; the special-case Korea comment thread uses the existing moderation system.

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

## Concise homepage headlines (6 November 2026)

Published the approved headlines, “Everyday tasks, made sajilo.” and “तपाईंको दैनिकी, अब अझ सजिलो।” with the forced line break removed. Supporting descriptions and the orange emphasis remain in place. `npm run verify` passed. Chrome checks covered both languages at 320, 390, 768, 1024, 1366 and 1920 px: no horizontal overflow or console/runtime errors, one headline line from 768 px upward, and natural wrapping on phones. The hero and daily card still have matching heights in the side-by-side layout. Representative desktop/mobile screenshots were visually inspected. Live checks confirmed both approved headlines at `sajilodesk.com`; Cloudflare version `2a66cadc-10de-4fb9-97c0-d63e3bb78e6f`.

## Compact daily card and responsive hero typography (6 November 2026)

The daily card now uses its content height instead of stretching to match the left hero. On an ordinary day at 1366 px, it measures about **190 px instead of 247 px**; key days, holidays and expanded source details can still make it grow. The background illustration is smaller so the dates remain clear. Existing daily-card layout checks now require top alignment rather than equal panel heights.

Hero headings now use locally bundled **Mukta 700** for both Latin and Devanagari, with the font's full licence included in the public notices. Desktop sizes are retained. Below 601 px, the heading scales between 22 and 32 px; both approved headlines fit on one line at 320, 360, 390, 430 and 600 px. The desktop/tablet checks also passed at 768, 1366 and 1920 px. Representative mobile/desktop screenshots were visually inspected.

`npm run verify`, final static-build checks and the bilingual defaults/daily-card suite passed, including the holiday/key-day visibility and expanded-details cases. Live Chrome checks at 320, 390 and 1366 px confirmed both headline translations on one line, actual Mukta font loading, the smaller daily card, zero horizontal overflow and no console/runtime errors. Cloudflare version: `b2749885-09e4-4a8b-a806-635299c90e5d`.

## Larger small text on desktop and mobile (6 November 2026)

At the owner's request, increased the three smallest rendered text tiers by exactly 30% across both screen layouts: **10 → 13 px, 11 → 14.3 px, and 12 → 15.6 px**. Shared CSS tokens apply the same scaling to labels, hints, captions, calendar secondary dates, navigation and other small text in both languages. A computed-font audit across all 32 localized pages at 390 and 1366 px confirmed the original 10/11/12 px text is now rendered at the requested larger sizes. Hero headings retain the previously approved responsive sizes.

`npm run verify`, **84 responsive page checks and 14 browser workflows**, the **12-layout calendar suite**, and the bilingual defaults suite all passed. All ten default tool work areas still fit a 1366 × 768 viewport. Representative English/Nepali desktop/mobile home, calendar and photo-tool screenshots were visually inspected. Live Chrome checks at 390 and 1366 px confirmed 13/14.3/15.6 px sample text in both languages, working Mukta headings on one line, no horizontal overflow and zero runtime/console errors. Cloudflare version: `fc8aaee5-c1c1-4ffb-83b5-81c8074e19be`.

## Life abroad · Korea (6 November 2026)

Added a homepage entry and bilingual visa → task → guide flow. Current visas are D-2, D-4-1 and E-9; tasks are extending the existing stay and self-reporting an address change. There are three status-specific extension guides and one shared address guide. A compact selector on a detail page opens only when needed. The entry uses questions instead of separate visa panels. Main descriptions are short; scope, exceptions and individual document instructions remain available in disclosures. Existing tools, approved homepage text, daily information, calendar and larger small-text sizes are retained.

Document cards distinguish baseline, conditional and school-confirmation items, as well as blank forms and issued evidence. Korean names, issuer/acquisition instructions, official sources and an actual review date are included. Conditions cover thesis preparation, employment-period/re-employment differences and housing. Checklist choices/ticks save locally and export to UTF-8 text without uploading documents. Source coverage and limitations are recorded in [korea-service.md](korea-service.md).

Real public comments use the site's own Worker and D1 database. New comments are pending; public queries return approved rows only. No visitor login, external widget or third-party script is required. Same-origin JSON/consent validation, bounded input, prepared SQL, a honeypot, daily private IP-hash limits, text-only rendering, pagination and owner-only moderation are implemented. The daily cleanup expires pending comments within 31 days and rate-limit records within 72 hours; the scheduled boundary case was tested. The privacy page and local-data clearing reflect these features. Synthetic comments were used only in the local database and removed after testing.

Validation passed:

- `npm run verify`: zero Astro errors/warnings/hints, **36 unit tests**, **14 DOM-entry scenarios**, **44 HTML pages**, **89 static assets**, **1,400 local references** and **204 labelled controls**.
- `npm run test:korea`: **60 English/Nepali responsive layouts** at 320/390/768/1024/1366 px, all six visa/task combinations, conditional lists, saved preparation across language changes, UTF-8 export, reset, unavailable storage, no-JavaScript reading, real local D1 submission/private review, origin/input validation, rate cap, safe HTML-as-text rendering, thread isolation, pagination and the actual scheduled cleanup. Zero page errors or external requests.
- Existing tools: **84 responsive checks and 14 browser workflows**, real clipboard/JPEG output, ten laptop default work areas, and the **12-layout calendar suite** passed. Subsequent changes were scoped to Korea copy/selection and the comments service.
- Live isolated Chrome: **29 checked pages**, **12 bilingual visa/task journeys**, all five tools in both languages, fresh Nepali default and saved English preference, readable mobile/desktop selectors, privacy text, all four comment threads returning HTTP 200 with `no-store`, production sitemap/robots, CSP and `no-transform`. Zero runtime/console errors, zero external requests and **no production test submissions**. Representative screenshots were visually inspected.

Production main Worker version: **`2e0bd80a-810f-4f4f-a4d8-d2cf9276dc9c`**. Cloudflare's API confirmed 100% deployment, the daily `17 19 * * *` UTC trigger and disabled `workers.dev`/preview routes. The redirect Worker and personal-site hosting were unchanged. The source remains in GitHub; production is on `sajilodesk.com`.

## Consistent typography and compact layout (6 November 2026)

Matched Korea typography to the existing site by role: guide-index headings, tool headings, section/card/panel headings, body text, labels and form controls. The original enlarged small-text tiers remain. Computed-style comparisons confirmed **124 existing text samples** kept their font size, line height, weight and family; **170 role comparisons** across both languages at 320/390/768/1024/1366 px matched the corresponding original components.

Added shared compact spacing with content-height panels, smaller section gaps, a shorter header, tighter cards, calendar padding and footer spacing. Optional checklist settings now open on demand. The preparation panel uses shorter actions and a compact mobile reset control with an accessible name. Scope and review date share one row. During the 390 × 844 Nepali layout refinement, the first document moved from about **1,155 px to 730 px** down the page, and the preparation panel reduced from about **331 px to 156 px**, while retaining the chosen text scale.

`npm run verify` passed with zero diagnostics, **36 unit tests**, **14 DOM-entry scenarios**, **44 HTML pages**, **1,392 local references** and **204 labelled controls**. Browser validation passed **84 responsive checks / 14 tool workflows**, all **ten laptop default work areas**, the **12-layout calendar suite**, and **60 Korea layouts / all six visa-task journeys**, including saved settings inside the disclosure, export, storage failure, comments and scheduled cleanup. The retention test invokes the running local dev proxy directly. The later refinements were confined to the Korea interface and its test harness.

Live Chrome checks passed **68 typography comparisons and 12 responsive layouts** at 390/1366 px in both languages with no page errors or horizontal overflow. Screenshots were visually inspected. Main Worker version: **`8579d62b-d96d-4ed8-a22e-7f72e4500aa1`**. The owner's compact-layout preference is recorded in [development.md](development.md).

## Longer welcome screen (6 November 2026)

The root welcome/language chooser now waits about three seconds before opening the saved language or the Nepali default. Language selection opens immediately; keyboard focus on a language choice or interaction with a link cancels the automatic redirect. Direct language-page visits have no welcome delay.

`npm run verify` passed. The new `npm run test:welcome` passed eight browser scenarios: visible at 2.9 seconds, automatic navigation after three seconds for both language preferences, keyboard and pointer interaction, blocked storage, direct language routes and the no-JavaScript chooser. Live real-time Chrome checks passed fresh Nepali entry, remembered English, switching back, blocked storage and the no-JavaScript fallback without console/runtime errors. Worker version: `9c0b703e-0dd4-4277-87da-e27f0c1712bc`.

## Private visual moderation (6 November 2026)

Added a compact `/admin/` page with Pending/Published counts, guide/type filters, older-comment pagination, refresh, Publish, and confirmed Delete. Private routes verify a Cloudflare Access application JWT and the approved owner's email before serving either the page or its database API. Public submission, visitor tools and guides retain their behavior. No real production comment was published or deleted during this work.

Validation passed with zero Astro diagnostics, **43 unit tests**, **14 DOM-entry scenarios**, **45 HTML pages**, **1,445 local references** and **206 labelled controls**. Seven new security/SQL unit scenarios exercise invalid/forged/expired/wrong-identity tokens, missing configuration, private caching, CSRF/form rejection, bounded actions, filtered pagination, public publication visibility and deletion. `npm run test:moderation` passed signed-identity browser workflows at **320/390/768/1366 px**, plain-text rendering including Nepali, publishing, cancel/deletion, filtered empty states, server failures, Access login redirects and expired JWTs. Test writes used in-memory local SQLite only. Desktop/mobile screenshots were inspected.

The existing Korea suite passed **60 bilingual layouts and all six visa/task journeys**, including local D1 public/pending isolation, validation, pagination and scheduled cleanup. The welcome suite passed all **eight** scenarios. Wrangler's dry run succeeded; live read-only Chrome checks confirmed both languages, public comment reads, private `no-store` responses on all five moderation routes, robots exclusion and no admin sitemap entry. Worker/D1 binding, daily cron and disabled alternate preview routes were retained.

The owner completed Cloudflare Access application setup and supplied its AUD tag. The verified team issuer, application audience and approved owner email were installed as Worker secrets through authenticated Wrangler; the existing comment salt was retained. Active Worker version after configuration: **`86800566-288f-4b16-affa-b76ba64b4ad2`**. Anonymous live Chrome visits to `/admin`, `/admin/`, `/admin/index.html` and both moderation API paths all redirect to the expected team's login screen with the matching application audience. The team RSA signing-key endpoint is reachable. Both public language homepages and all four public comment reads still work, with no page errors. The daily cron and disabled Workers preview endpoints were retained.

The owner subsequently confirmed that authenticated moderation and publishing worked. Automated production checks remained read-only. No owner password, OTP, authentication cookie or signed-in session was requested, copied or automated during activation. See [moderation setup](moderation.md) for future configuration changes.

## Clear public comment layout (6 November 2026)

Moved published comments below the full sharing form on all four Korea guides, in both languages. A separate **Community comments / पाठकका टिप्पणीहरू** heading and discussion icon identify the public discussion. Compact cards separate the author, category badge, date/receipt and message, with semantic author headings and date elements. Comment content still renders as plain text. The discussion and form share the same maximum width, with short gaps and no fixed card heights.

`npm run verify` passed with zero diagnostics, **43 unit tests**, **14 DOM scenarios**, **45 HTML pages**, **1,445 local references** and **206 labelled controls**. The existing Korea browser suite passed **60 responsive layouts and all six visa/task journeys**, including submission, safe comment rendering, pagination and retention. Targeted English/Nepali layout checks passed at **320/390/768/1366 px**, using local-only response fixtures with mixed-script text, long names/unbroken text and the empty state. The heading, form-before-comments order, aligned widths and no-overflow checks passed. No production comment was submitted or moderated by the automated checks.

Deployed Worker version: **`f78a510e-5d9f-442d-b683-cc753b10a11e`**. Production comments and the owner authentication configuration were retained.

## SajiloDesk Korea country branding (7 November 2026)

Applied the approved compact country ribbon and matching Korea hub/guide branding. The Latin brand remains **SajiloDesk** in both languages, followed by a smaller **KOREA** label. The brand is **17 px**, down from **19 px** in the preview; the country label is **11.5 px**. The ribbon now says **Life in Korea, made sajilo. / कोरियाको दैनिकी, अझ सजिलो।**, with the approved short document-guide description and existing guide link. The hub retains its working visa → task selector, and detailed guides retain their document checklists and sources. The previous Nepali-only reduction applied to the retired visa-document headline; the new headline follows the approved country-ribbon typography.

`npm run verify` passed with zero Astro diagnostics, **43 unit tests**, **14 DOM scenarios**, **45 HTML pages**, **1,445 local references** and **206 labelled controls**. The Korea browser suite passed **60 bilingual responsive layouts and all six visa/task journeys**, including saved checklists, exports, safe comments and local D1 retention. Targeted branding checks passed **24 layouts** at 320/390/768/1366 px, exact brand/country sizes, label-above-headline placement and working homepage guide links. Mobile and desktop screenshots were inspected.

A separate fixed-date Chrome comparison confirmed **72 homepage section snapshots** (header, hero, daily card, tools, calendar, workflow, trust and footer/mobile navigation across both languages and four widths) match the existing production content, typography and dimensions outside the Korea ribbon. The production build uses `release/korea-country-brand` from `336c54f`, excluding the earlier, still-unpublished broad-audience copy on `main`.

Published as Worker version **`95071809-d8f9-4e30-9914-2078c3531297`**. Read-only production checks repeated all **24 branding layouts** and the **72 unchanged-section comparisons** successfully. Public comments remain readable, all five moderation paths still redirect anonymous visitors to the expected Access application, and the four existing Worker secrets remain configured. The static preview was replaced with the live Korea hub in the app panel.
