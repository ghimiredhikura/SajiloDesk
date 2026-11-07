# Korea selector relevance · reviewed 7 November 2026

The picker shows **procedures relevant to the chosen status and usual possible target routes**, not every guide in the catalogue. It does not decide eligibility. Nationality, exact subcode, past statuses, qualifications, age, family circumstances and programme notices can change the answer.

An omitted target is not declared legally impossible. **Other / special-case route** opens a dedicated review guide with the selected current status preserved. Entry-visa guidance remains available through **Applying before entering Korea?** rather than appearing as an in-country task. Old guide URLs and comments remain available.

## Evidence used

- [HiKorea manual, 261106 edition](https://www.hikorea.go.kr/board/BoardNtcDetailR.pt?BBS_SEQ=1&BBS_GB_CD=BS10&NTCCTT_SEQ=1062&page=1): status chapters, student part-time eligibility, D-2/D-4/E-7 restrictions, E-7-4 pathways, F-3 humanitarian changes, F-6 and H-1 restrictions, official/agreement exemptions and F-5 card renewal.
- [MOJ employment-reporting notice and attachment](https://www.immigration.go.kr/bbs/moj/182/601588/artclView.do): defined reporting status list, including F-5 exclusion. Do not infer this reporting duty for every visa that might allow some activity.
- [Immigration Act Article 24](https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0024&lsiSeq=290729&urlMode=lsScJoRltInfoR): prior status-change permission and the special treatment of a changed exempt identity. A menu choice is not that permission.

The source review and licence/precedence notes in [the research matrix](korea-research-2026-11.md) continue to apply. These UI shortlists are independently written navigation guidance; they are not an exhaustive official eligibility matrix.

| Situation | Picker behaviour |
|---|---|
| E-9 | Worker extension, workplace and employment-report tasks; hide student work, school changes, ordinary additional-activity and direct permanent-residence tasks. The target shortlist offers E-7-4, qualifying family circumstances and humanitarian cases, with special cases labelled. Do not offer ordinary E-9 → D-2/D-4/E-7 conversion. |
| D-2 | Academic tasks, suitable student work, visa changes and other relevant resident procedures; hide the worker employment-information report and duplicate employer-change task. A new part-time employer is handled in the student-work guide. D-2-5 is excluded from the ordinary student part-time list. |
| D-4 | D-4-1/7 have student part-time choices. The parent D-4 choice covers other training subtypes and does not presume language-student permission. |
| F-5 | Card renewal/reissue, applicable residence reports, travel/family and administrative help. Hide ordinary stay extension, first registration, employment-reporting, employer permission, a new PR application and routine status conversion. School reporting is explicitly qualified by ages 6–18. |
| Short stay | Hide ordinary ARC/address/passport-report and registered-resident work tasks. C statuses can check an exceptional short-stay extension; B statuses use departure arrangements. F-1-D is a published potential route for qualifying B-1/B-2/C-3 visitors. Family/humanitarian exceptions are labelled, not presented as routine conversions. |
| H-1 | Qualifying professional changes depend on the working-holiday agreement. Do not offer an ordinary H-1 → F-6 conversion; the current manual restricts it. |
| G-1 | Student/humanitarian/family exceptions and restoration of a qualifying former E-9 status require individual review. Target labels make that explicit. |
| A statuses | Do not presume ordinary foreigner registration/report duties. Agreement-based extension and additional activities retain their mission/agreement conditions. |

## Implementation contract

- `getTaskChoices` and `getChangeTargets` in `src/lib/korea-catalog.ts` own relevance and bilingual conditional labels.
- `koreaJourney` rejects choices outside those lists. A hidden native option or old query must not bypass this guard.
- Both native options and the searchable combobox use the **same filtered list**. Searching a blocked target must not reveal it again through the global visa directory.
- Changing the current status retains compatible selections and clears incompatible tasks/targets. Any open stale result list is dismissed when its permitted choices change.
- The target field appears only for a status-change task; ordinary tasks retain two choices.
- Unit tests cover all offered and omitted combinations. Browser tests cover all 49 current choices, both controls, bilingual mobile/desktop flows, resetting, special cases and old direct links.

## iPhone touch and focus regression

The 7 November mobile correction addresses a reproduced event-order failure: when the input loses focus during a tap on a result, closing the list immediately prevents the visa from being committed and leaves step two disabled. [WebKit issue 322721](https://bugs.webkit.org/show_bug.cgi?id=322721) documents the corresponding iOS focus behaviour; cancelling pointerdown alone is insufficient.

The combobox now tracks a primary pointer gesture, keeps results visible across the intervening blur, and commits only on the option's click after a stationary pointerup. Movement, list scrolling and pointercancel do not select an option. Closing on pointerup was also rejected because a following compatibility click could reach a submit button underneath the disappearing row. Keyboard and assistive-technology activation remain supported. A touch selection dismisses the input without refocusing/reopening the list.

Both search inputs and the native task/target controls use a minimum 16 px font on narrow or coarse-pointer screens; desktop sizes remain unchanged. The viewport still permits user zoom. Results are positioned and height-limited against the visual viewport and mobile navigation.

Run `npm run test:korea-mobile` against local Wrangler after installing Playwright WebKit (`npx playwright install webkit`). It tests iPhone 14 device settings in WebKit and Chromium, in English/Nepali and portrait/landscape, including real taps, a forced blur during the tap, no accidental form submission, gesture cancellation, keyboard selection, smart resets and a reduced-height viewport. These are emulated browser tests; physical iOS keyboard and automatic zoom need device verification.
