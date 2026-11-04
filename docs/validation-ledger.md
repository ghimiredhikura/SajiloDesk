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
