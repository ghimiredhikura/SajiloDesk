# Sajilo Desk verification report

Verified locally on **4 November 2026**. This is implementation evidence, not a public deployment or participant study.

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
4. Final hostname/domain approval, authorized Cloudflare deployment, live HTTPS/canonical/indexing checks, and real-device smoke tests on that URL.
5. The proposed five-shop/ten-user pilot and competitor timed benchmark. No interviews, outreach, measured retention or traffic forecasts are claimed.

Public contact is **sajilodesk@gmail.com**. Domain `sajilodesk.com.np` is not yet approved. Deployment configuration is ready; no public deployment, DNS change, analytics or advertising activation has occurred.
