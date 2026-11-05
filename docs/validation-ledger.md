# Sources and validation ledger

Reviewed 4 November 2026. This records implementation evidence separately from research hypotheses and human sign-off.

## Date conversion

- Package: `@remotemerge/nepali-date-converter` **1.2.7**, MIT, exact dependency/lockfile, local production bundle. [Source](https://github.com/remotemerge/nepali-date-converter); full license in `public/licenses/nepali-date-converter.txt`.
- Range: BS 1975-01-01–2099-12-30 / Gregorian 1918-04-13–2043-04-13. No date rollover or extrapolation.
- Ten independent fixtures use the [Nepal Embassy Abu Dhabi holiday list](https://ae.nepalembassy.gov.np/pages/holidays-16/), including 2082-01-01 = 2025-04-14, 2082-02-15 = 2025-05-29, 2082-06-03 = 2025-09-19, and 2082-11-07 = 2026-02-19. All ten are in `tests/dates.test.ts`.
- The source itself has inconsistent rows (for example its May 12 month label and December 2 row). These were **excluded**, not silently repaired. A government label is not sufficient without internal consistency.
- Every one of **45,657 supported days** round-trips. All 1,500 BS month boundaries are tested, including rejection of the next invalid day. Gregorian leap days across the supported range are included.
- Round-trip consistency does not independently verify every historical/future table entry. Future BS values should be compared with the calendar issued for the year. Independent spot checks across earlier decades and annual table review remain prudent before high-consequence reliance.
- Date-only UTC epoch-day arithmetic avoids host-zone shifts. “Today” alone uses `Asia/Kathmandu`; midnight behavior is checked across four host time zones.

## Age

The original birth date anchors monthly anniversaries. Move by whole months, clamping the day to the target month’s last day when necessary; count only anniversaries reached at the cutoff. Divide completed months into 12-month years, then count remaining days from the final anniversary. February 29 reaches February 28 in a common year. January 31 to February 28 is one month; to March 30 is one month plus 30 days. This is disclosed in both languages. It is not an official eligibility ruling.

## Land area

Versioned constants are in `src/lib/land.ts`. Nepal convention:

- 1 ropani = 16 aana = 64 paisa = 256 daam = **5,476 ft²**.
- 1 bigha = 20 kattha = 400 dhur = **72,900 ft²**.
- 1 ft = **0.3048 m exactly**, so 1 ft² = **0.09290304 m²**. [NIST](https://www.nist.gov/pml/us-surveyfoot).

Primary references:

- [FIG 2021 presentation, Chhatkuli/Joshi/Deuja/Panday](https://fig.net/resources/proceedings/fig_proceedings/fig2021/ppt/ts07.5/TS07.5_chhatkuli_joshi_et_al_11130_ppt.pdf), PDF page 4: the two square-foot base factors were readable in the retrieved document text.
- [Government-hosted Construction Handbook, conversion table](https://giwmscdnone.gov.np/media/app/public/54/posts/1711001516_6.pdf), PDF page 16: downloaded, extracted and visually inspected on 4 November 2026. Confirms the compound ratios and both base square-foot factors. The local evidence is in the ignored `tmp/land-construction-handbook.pdf` and `tmp/land-conversion-table.png` files.
- [Phalewas municipal building/planning handbook](https://phalewasmun.gov.np/sites/phalewasmun.gov.np/files/shahari_yojana_bhawan_mapdanda_2075.pdf): government-hosted corroborating conversion table. Indexed metric approximations are not used as exact factors.

Some official tables round metric areas inconsistently. Sajilo Desk uses the base ft² values and exact international-foot conversion consistently: **1 ropani = 508.73704704 m²**, **1 bigha = 6772.631616 m²**. Preserve internal precision; round output only. Known examples, all-unit reciprocals, carry rounding, zero and invalid input are automated tests. This does not authenticate a land record or boundary.

## Preeti

`@lacspace/preeti` **1.1.0**, Lacspace Free Licence v1.0, commercially permissive with retained notice. The exact license shipped with the package is copied to `public/licenses/lacspace-preeti.txt`. The older `preeti` package with a non-commercial license was **not used**.

Automated spelling fixtures cover नेपाल, किरण, निर्माण, प्रकृति, कार्य, विकास, काठमाण्डू, क्ष, ज्ञ, श्री, danda, repeated spaces and line breaks. `[[English]]` spans are preserved explicitly because plain text has no source-font metadata. There is no claim of reliable heuristic language detection. Output is assigned to `textarea.value`, never HTML.

**Independent competent Nepali typist review has not happened.** Review rare glyphs, alternate fonts, mixed Office/PDF text, half letters, repha and long-vowel ordering with synthetic samples before public launch. Correct the corpus and implementation together when a mismatch is found. Whole-document conversion and Unicode→Preeti are outside this release.

## Photos

Only JPEG, PNG and still WebP are accepted. A header is checked before image decoding; input is capped at 20 MiB / 24 MP / 12,000 px per side, and output at 16 MP. Browser `createImageBitmap(..., { imageOrientation: 'from-image' })` is used. Fit preserves aspect ratio and prevents enlargement; center crop returns exact dimensions. Canvas re-encoding does not copy EXIF; JPEG transparency is flattened to white.

PNG has no quality-based size search. JPEG/WebP search quality down to 10%, retaining the highest tested value within the target. An impossible target is not called successful. Displayed dimensions/size come from the actual result; a smaller-dimensions action updates the controls visibly. Cancellation takes effect after the active encoding operation.

Native Canvas tests encode, decode and inspect real JPEG/PNG/WebP output. DOM tests select a synthetic PNG through the page handler, resize/crop, download a JPEG Blob and inspect its dimensions and bytes. Real headless Chrome also completed this workflow in English and Nepali, downloaded the JPEG, and verified its decoded dimensions and displayed byte count. Result screenshots were visually inspected. **EXIF-specific fixtures, Safari behavior and low-memory physical Android testing remain pending.** See [the test report](test-results.md) for the exact browser coverage.

## Privacy and licenses

Only language and known favorite-tool IDs use localStorage. All inputs remain in the active page; no input is stored in URLs, sent to an API or logged to analytics. No analytics, ad code, remote font or external runtime CDN is installed. Feedback creates a local text draft and provides an approved mailto address; it never sends automatically. Every externally sourced runtime license and both font licenses are retained in `public/licenses/`.

## Today card: annual holidays and worldwide days (5 November 2026)

- `src/lib/observances.ts` stores explicit BS 2083 dates. Coverage is 14 April 2026 through 13 April 2027, inclusive. It does not repeat lunar holidays in later years. Outside coverage it explicitly requests a calendar update.
- [MoHA annual notice](https://moha.gov.np/page/government-and-public-holidays-in-2083): the 12-page scanned Gazette was downloaded and pages 1–6 rendered and visually read. Pages 2–3 contain nationwide festival dates and the Dashain/Tihar ranges; pages 4–6 distinguish regional, community, women-employee, education-only and disability-related leave. These scopes are preserved.
- [Official supplementary weekend notice](https://daorasuwa.moha.gov.np/post/sa-lka-sa-ra-vajana-ka-b-tha-2): both scanned pages were rendered and read. Saturday and Sunday are weekly holidays for government offices, public bodies and educational institutions, effective 23 Chaitra 2082. The year map therefore includes both weekdays.
- The later [Gazette listing](https://dop.gov.np/category/530/) confirms the nationwide 23 Bhadra Gen Z Martyrs’ Day holiday. The [President’s 2083 Bakra Eid message](https://president.gov.np/सम्माननीय-राष्ट्रपति-श्-447/) confirms 14 Jestha. These are additional dated entries rather than estimated lunar dates.
- Eid-ul-Fitr, Muhammad Jayanti, Guru Nanak Jayanti, Bhoto Jatra and Siruwa have no exact date in the inspected annual notice. Do not guess them or infer nationwide status from embassy calendars. Add confirmed dates and applicable scope when a relevant notice is available. Local/provincial or subsequent ad hoc notices can add holidays; no-holiday status is hidden rather than implying that all offices are open.
- [UN international days](https://www.un.org/en/observances/list-days-weeks): selected fixed-date observances cover all 12 Gregorian months, with bilingual labels. They are shown separately from Nepal holiday status. Moving observances (for example World Habitat Day and World Philosophy Day) are excluded rather than assigned a fixed month/day.
- The worldwide key day appears in a larger highlighted block, with a separate holiday notice visible outside the disclosure only when a holiday is listed. Source details expand, and both entries update every minute using `Asia/Kathmandu`. No external API or browser request is needed to select a date.
- Tests cover all mapped days, year boundaries, Kathmandu midnight, Saturday/Sunday, festival ranges, both Holi regions, scoped holidays, bilingual labels and valid fixed dates.

## Ready-to-use defaults and example image

- Date conversion opens on today in Nepal with a result; the existing Today and example actions remain.
- Age opens with an explicitly labelled 1 January 2000 AD sample birth date and today's Nepal cutoff. Preeti opens with the existing synthetic sample and converted text. Land opens with one ropani and its equivalents.
- `public/examples/mountain-sample.jpg` is an original 1280 × 800 geometric illustration generated by `scripts/generate-example.mjs`. It contains no portrait or third-party photo and needs no external asset licence. Photo resizing opens with an 800 × 500 JPEG preview, quality 85%, target 200 KB. The actual output size is measured normally.
- Choosing a personal image replaces the sample. Clearing releases it; the example action reloads it. A late sample fetch cannot overwrite a user-selected image, and failure to fetch the sample leaves personal file selection available.
- Tool instructions and advanced photo settings are expandable. Inputs retain their reading sizes and buttons retain a 44 px minimum height. Small phones still scroll where content cannot fit; no result is clipped or scaled down to force a fit.

## Nepal key days and month/year calendar (5 November 2026)

- `src/lib/nepal-key-days.ts` is an independent observance dataset with 24 sourced entries across all 12 BS months. It does not set holiday status. The reviewed edition applies from BS 2083 onward, not to historical observance practice.
- Historical figures include Bhanu Bhakta Acharya (Asar 29, [President's message](https://president.gov.np/सम्माननीय-राष्ट्रपति-श्-455/)), Balkrishna Sama (Magh 24, [Kathmandu Metropolitan City](https://metronews.kathmandu.gov.np/news/detail/0702609283)), and Falgunanda/Prithvi Jayanti (the inspected MoHA annual Gazette). Buddha Jayanti uses the explicit BS 2083 date only; no annual lunar extrapolation is performed. An unverified Devkota or Lekhnath date was not added.
- Other primary sources: [Vice President's Paddy Day message](https://vpn.gov.np/content/68/dhaan-diwas/), [Forest Department gallery](https://www.dofsc.gov.np/gallery-list/) (Shrawan 24 Soil Conservation / 25 Community Forest), [National Child Rights Council](https://ncrc.gov.np/content/77/regarding-the-celebration-of-national-children-s-day/), [Education Ministry Science Day notice](https://moest.gov.np/content/13314/the-motto-of-the-twelfth-national-science/), [CEHRD Education Day notice](https://old.cehrd.gov.np/file_data/mediacenter_files/media_file-11-1106586325.pdf), [NDRRMA earthquake-day notice](https://ndrrma.gov.np/en/news/210), and [Lumbini Cooperative Registrar](https://cro.lumbini.gov.np/en/albums).
- Library Day (Bhadra 15), Tax Day (Mangsir 1), Loktantra Day (Baisakh 11) and ICT Day use the government document URLs stored on each entry. Importantly, the [ICT notice](https://giwmscdnone.gov.np/media/app/public/323/posts/1714025835_17.pdf) says **2 May**; it is stored as AD rather than hardcoded to a BS date. Event dates were checked against indexed primary-source contents; historical background prose is not reproduced.
- The Today card shows independent labelled Nepal and world highlights, hiding empty entries. Where multiple Nepal entries coincide, all names and their source links are retained. Holidays remain separate and no-holiday notices remain hidden.
- `src/lib/calendar.ts` builds a Sunday-first grid using UTC date-only weekday arithmetic. It uses the existing BS table, handles Gregorian leap months and disables out-of-range days within AD April 1918 / April 2043. No unsupported conversion is attempted for those cells.
- Calendar controls accept Latin/Nepali year digits, clamp boundary-year months to supported months, preserve the selected day when switching BS/AD, show both full dates, and copy a labelled BS/AD pair. Month navigation selects the first available day if the prior selection is outside that month. Current day comes from Asia/Kathmandu.
- This is a separate home-page section, not a sixth calculation tool. No input/date is stored, put in a URL, or sent to an external service. Sources are ordinary outbound links opened only by user action.

- Holiday colouring uses the same nationwide/scoped/weekly status as the selected-day notice. Unselected holiday dates use red numbers; selected holidays use a red background with white text. A Nepal/world observance alone does not trigger holiday colouring. Scope is explicitly named in selected-day details and in the legend. The browser suite verifies these colours and the scoped Teej notice.
