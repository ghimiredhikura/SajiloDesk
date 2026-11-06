# Life abroad · Korea

The first release covers **in-country stay extensions for registered D-2 degree students, D-4-1 university language students and E-9 EPS workers**, plus **self-filed address-change reports for these registered residents**. Visitors first choose their current visa and task; the selector then opens the matching guide. The address guide preserves visa context in the URL without putting personal data there. It does not cover new entry visas, first registration, workplace changes, status changes, re-entry or eligibility decisions. These remain separate procedures until their official information and exceptions have been reviewed.

## Source review · 6 November 2026

The source registry and bilingual document dictionary live in `src/lib/korea.ts`. Every document identifies its source, issuer, acquisition method, type and requirement scope. The published review date is an actual manual review, not the build timestamp. A warning appears when that review is more than 90 days old.

Visible descriptions are deliberately short. Full scope and exceptions sit in a disclosure; document instructions open individually. The detail page's visa/task selector stays collapsed until needed. The important expiry/reporting reminder remains visible.

| Source | Use and limits |
| --- | --- |
| [Gov24 stay extension](https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12700000097&HighCtgCD=A01008) | Baseline passport, residence card for visits, address evidence and status-specific documents. Not a complete account of local or case-specific assessment. |
| [Gov24 address change](https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12700000026&HighCtgCD=A01010) | Updated 29 Jun 2026. Self-report scope, 15-day reporting period, passport OR residence card, housing evidence, online/personal and office routes. Representative and overdue cases are explicitly separated. |
| [HiKorea forms](https://www.hikorea.go.kr/board/BoardApplicationListR.pt) and [MOJ Form 34 explanation](https://immigration.go.kr/bbs/immigration/213/561864/artclView.do) | Current-form discovery and correct purpose. The MOJ explanatory post is from 2022; link to the live library instead of republishing an old form. |
| [KAIST student immigration](https://io.kaist.ac.kr/menu/io.do?mguid=8ECD2D0A-21E5-E511-940C-2C44FD7DF8B9) | Academic/financial documents, thesis and extra-semester cases. Its balance thresholds and local issuance locations are not generalized to other institutions. |
| [KAIST certificates](https://www.kaist.ac.kr/en/html/edu/031006.html) | Issuer example: enrollment/transcript through school certificate services; tuition confirmation through academic portals. |
| [SKKU language-student guidance](https://koreansli.skku.edu/ksli_eng/program/visa.do) | Additional academic/tuition documents and housing evidence. Local conditions are marked for confirmation with the reader's school. |
| [Dongyang Mirae language checklist](https://www.dongyang.ac.kr/dmu_31003/2310/subview.do) | Undated school guidance supports the D-4 attendance and financial-document examples. Its numerical fees/thresholds are not adopted. Additional records remain conditional and school-specific. |
| [EPS employment process](https://www.eps.go.kr/eo/EmployJobProc.eo?tabGb=01) | Employer employment-permit renewal and immigration extension are separate. Employer services are moving to Work24; follow the official EPS link there. |
| [EasyLaw worker stay extension](https://easylaw.go.kr/CSP/CnpClsMain.laf?ccfNo=4&cciNo=1&cnpClsNo=2&csmSeq=2042&popMenu=ov) | Government explanation dated 15 Sep 2026, checked against the statutory E-9 document list. |
| [EasyLaw re-employment](https://www.easylaw.go.kr/CSP/CnpClsMainPreview.laf?ccfNo=3&cciNo=2&cnpClsNo=2&csmSeq=2042&popMenu=ov&search_put=) | Confirmation is issued following the employer's re-employment request. An unsure answer retains this item. |
| [Annex 5-2 snapshot](https://www.law.go.kr/LSW/flDownload.do?bylClsCd=110201&flSeq=157814773) | Revision 24 Dec 2024; explicitly dated. Cross-checked with the more recent government explanation; not described as the latest consolidated law. |
| [Geomdan accommodation form](https://www.geomdan.go.kr/dong.geomdan/peti/petiDetail.do?cate=1&pgno=2&seq=720) | Official form discovery. Evidence/attachments depend on the housing arrangement. |
| [KIS 1345](https://www.immigration.go.kr/immigration_eng/1862/subview.do) | Current official contact details and hours; no hardcoded ARS menu or language option number. |

Financial minimums, fees, copies/originals, certificate age, authentication and medical-document requirements are left for individual confirmation. Do not convert a university-specific requirement into a national rule. Reader comments never update the official checklist automatically.

## Adding another guide

1. Separate entry visas, registration, extensions, changes, reporting and re-entry.
2. Establish the official baseline and scope. Verify the issuing body, current notices, exceptions, form location and certificate-acquisition route.
3. Write natural English and Nepali explanations; keep the actual Korean search term.
4. Add sources and actual review date, condition handling, routing, sitemap and comment-thread allowlist. The database bounds thread length; the Worker enforces the exact published-thread allowlist.
5. Test conditions, storage failure, export, mobile layout and no-JavaScript reading. Publish only what was verified.

## Public comments and review

Comments are **real shared comments**, stored in the account's Cloudflare D1 database `sajilodesk-community` (APAC). No GitHub or other visitor account is required. The frontend uses only same-origin `/api/comments` requests, without external scripts or widgets. Static pages and existing tools remain served as assets; `/api/*` and private `/admin` routes invoke the Worker. A daily cleanup trigger removes old pending comments and rate-limit records.

Only `published` rows can be returned publicly. New submissions always enter `pending`; the caller cannot supply a publication status. There is no public moderation API. Submissions require an exact same-origin JSON request and consent, valid length/category/thread, an empty honeypot, and a daily private IP-hash limit of three per connection. Shared connections share that limit. Comment content is rendered as text, never HTML. There are no file attachments or email collection.

For visual review, use the [private moderation page](moderation.md) at `https://sajilodesk.com/admin/` after completing Cloudflare Access sign-in setup. It has Pending/Published tabs, guide/type filters and Publish/Delete controls. The following terminal fallback also remains available from the synced local runtime, authenticated with the owner's existing Wrangler access:

```powershell
npm run community -- pending
npm run community -- approve 123
npm run community -- published
npm run community -- delete 123
```

Replace `123` with an actual comment ID. Before approval, check relevance, personal details, spam and misleading advice. A correction is a lead for official-source review, not proof of a changed requirement. Delete comments containing private details; do not publish them just to explain why they were removed. Removal requests go to `sajilodesk@gmail.com` with the guide and comment/receipt ID. Unapproved comments expire within 31 days; approved comments remain until removed. Rate-limit hashes expire within 72 hours. Hosting-provider logs/backups follow Cloudflare's policies; these retention descriptions concern active application tables.

## Database and secret setup (once per environment)

Production binding is in `wrangler.jsonc`. Never recreate or overwrite the production database when deploying an ordinary content change. The schema file is idempotent for initial setup, not a replacement for future migrations.

```powershell
npm exec -- wrangler d1 execute sajilodesk-community --remote --file scripts/community-schema.sql
npm exec -- wrangler secret put COMMENT_SALT
```

Supply a long random secret through stdin/the prompt. It is used for the daily HMAC and must never be committed, printed or embedded in browser code. A separate `.dev.vars` in the local runtime can contain `COMMENT_SALT=local-development-only`; `.dev.vars*` is ignored. Initialize local D1 with the same schema using `--local`. The initial development database used a three-thread CHECK. The one-time `scripts/community-migrate-threads.sql` migration preserved rows/IDs and replaced it with a length bound; it has already been applied to the local and production databases. Do not run it again during normal deployments. New installations use the final schema directly.

Run `npm run test:korea` only against local D1: it inserts synthetic comments and clears the local test data, never the production database.

For the complete local service (use the synced NTFS runtime on this Windows setup):

```powershell
npm exec -- wrangler d1 execute sajilodesk-community --local --file scripts/community-schema.sql
# Put COMMENT_SALT=local-development-only in the runtime's ignored .dev.vars.
npm exec -- wrangler dev --local --port 8791 --test-scheduled
```

In another terminal in the same runtime, run `npm run test:korea`. Its default URL is `http://127.0.0.1:8791`. Normal `astro dev` serves the static UI without the comments API.
