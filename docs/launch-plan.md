# Sajilo Desk: launch, measurement and distribution

Reviewed **4 November 2026**. This is an operating plan; deployment, account connections, outreach and interviews must be reported separately when they actually occur. The source project and test report establish implementation status.

## Hosting decision and current free-plan limits

Use **Cloudflare Workers Static Assets, Free plan, asset-only**, with GitHub storing source history. Keep Astro output static and calculations/files in the browser. Cloudflare currently directs new projects toward Workers. A static site needs neither a Worker script nor a database. [Cloudflare Pages overview](https://developers.cloudflare.com/pages/)

| Item | Current documented allowance | Project implication |
| --- | --- | --- |
| Static requests | Free and unlimited | Serve generated HTML, CSS, JS and datasets directly |
| Asset storage | No additional charge | No separate upload-storage service needed |
| Files per Worker version | 20,000 on Free | Count files in `dist` before release |
| Individual deployed asset | 25 MiB maximum | Font/image/library bundles must remain below this; this is not a visitor file limit |
| Workers Builds | 3,000 build minutes/month; one concurrent build; 20-minute timeout | Keep builds small and watch account-wide build use |
| Builds resources | 2 vCPU, 8 GB memory, 20 GB disk; build/log retention 90 days | Normal static build fits; keep source and release history in GitHub |
| Worker execution, if added later | Separate Free quota: 100,000 requests/day and 10 ms CPU/request | Do not add SSR, middleware or `run_worker_first` casually |

Sources: [static-asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [platform asset/runtime limits](https://developers.cloudflare.com/workers/platform/limits/), [Builds limits and pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/). Quotas are a dated snapshot, not a promise that provider terms never change. The NPR 0 target excludes owner time, subscriptions used during development, purchased domains and future paid services.

Use a single production target. Cloudflare Pages remains a fallback if an existing externally managed DNS subdomain makes it materially simpler, but do not maintain duplicate production deployments. GitHub Pages is not the chosen commercial hosting route; its usage restrictions should be reviewed before considering it. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## Deployment procedure

1. Install the repository's locked dependencies with `npm ci`; run `npm run verify` for typecheck, tests, build and generated-output checks. Confirm that `dist` contains the bilingual HTML pages, assets, sitemap, robots file and real `404.html`.
2. Review `wrangler.jsonc` (or equivalent): `name: "sajilodesk"`, implementation compatibility date, `assets.directory: "./dist"`, and `assets.not_found_handling: "404-page"`. No server entry point, `run_worker_first`, storage binding or paid feature is required. Verify the generated asset route at an unknown path returns HTTP 404. [Static generation and custom 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
3. Push the selected source checkout to the owner's GitHub repository once authorized access exists. Keep source materials containing any private registration data out of a public repository.
4. In Cloudflare Workers Builds, connect that repository and production branch; use the checkout root as build directory, `npm run build` as build command, and `npx wrangler deploy` as deploy command. Use the repository's pinned Wrangler version. Set the configured production base URL to the actual selected hostname before an indexable build. [Build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
5. A provider hostname is suitable while domain approval is pending. Deploy first with preview indexing disabled if the canonical hostname is unsettled. Record the returned URL and version/commit; do not fabricate a `workers.dev` address.
6. Verify HTTPS, all five real tool journeys in both languages, copy/download behavior, direct links, canonical/hreflang/sitemap hostnames, unknown-route 404 and sensitive-input network behavior on that actual URL. Only then mark the deployed release verified.
7. Roll back by selecting the prior known-good Cloudflare version in Deployments, or using `npx wrangler rollback <version-id>` after verifying the target. Preserve the source commit and tag so the same static assets can be rebuilt. [Workers rollback documentation](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

These steps are instructions, not evidence that access is connected or a site has been deployed. Before enabling a commercial arrangement, review the current [Cloudflare Developer Platform terms](https://www.cloudflare.com/service-specific-terms-developer-platform/).

## Domain and account actions

The owner confirmed on 4 November 2026 that `sajilodesk.com.np` is **not yet approved** and requested site and deployment preparation only. No deployment or DNS change has been made. The [.np registry](https://register.com.np/FAQs) says registration is free, but personal domains must derive from the applicant's documented name. Brand/service requests require applicable supporting documentation. Do not treat a drafted application as approval. [Registration instructions](https://register.com.np/how-to-register-np-domain)

The owner should provide or complete the following only where not already available:

- GitHub destination and authenticated repository access; Cloudflare account authorization for the static deployment.
- Registry approval and DNS control for `sajilodesk.com.np`, or confirmation of the fallback hostname.
- Public contact is confirmed: **sajilodesk@gmail.com**. Domain-registration phone, address and identity documents remain private.
- Search Console ownership verification and a Cloudflare Web Analytics site token if aggregate measurement is enabled.
- A competent Nepali reviewer and permission before recruiting or messaging pilot participants.

Workers Custom Domains require an **active Cloudflare zone** and a Worker. Add the approved hostname in Workers Settings → Domains & Routes → Add → Custom Domain; Cloudflare creates its DNS record and certificate. Existing CNAME conflicts must be resolved deliberately. [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

If migrating a domain's nameservers, first export/import every existing DNS record and verify the personal website and email after the change. `tools.ghimiredeepak.com.np` is a possible fallback only with owner-approved DNS access. If its parent is outside Cloudflare, Pages can use an external-DNS CNAME after adding the domain to the Pages project. [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## Search discovery and measurement

Use separate `/en/` and `/ne/` URLs, one canonical per page, reciprocal `hreflang`, plain HTML links and substantial original instructions. Google recommends separate language URLs rather than cookie-only content changes. Keep each page's main content in its selected language. Do not mass-produce thin phrase-variant pages. [Google multilingual guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

Once production ownership is verified, submit the canonical sitemap in Search Console. Each week review indexing, country, device, query, impressions, clicks and the landing pages with meaningful impressions. Do not interpret impressions as successful task completion. [Search Console guidance](https://developers.google.com/search/docs/monitor-debug/search-console-start)

[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/about/) is currently free and uses a browser beacon for aggregate pageviews/visits and performance. Its [Core Web Vitals report](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/) measures LCP, INP and CLS with percentile views and dimensions such as URL/country/device context. It is not established here as a custom-event, returning-user or cohort analytics platform. Do not claim those capabilities or install extra tracking to obtain them without a verified free capability and privacy review.

Keep dates, pasted text, file bytes, filenames and document contents out of analytics and URLs. Observe copy/download success during the pilot instead. Persist only explained language/favorite conveniences. Update the public privacy page when measurement is actually activated; never imply an uninstalled beacon is running.

Field targets when sample sizes permit: mobile P75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. Before that, report reproducible lab conditions and limitations. [Core Web Vitals definitions](https://web.dev/articles/vitals)

## Five-shop / ten-user Butwal–Tilottama pilot

**No recruitment or interviews have happened in this research pass.** Owner approval precedes outreach. Recruit five print/cyber shops plus ten adult users including students, first-time applicants, Nepali-script users and Romanized typists. Use participants' ordinary phones and mobile data where practical. Do not collect identity documents or real dates of birth.

Facilitator script:

1. “Please show how you usually complete this task, using the sample information. What would you search for?” Record exact words with consent.
2. Give a synthetic BS date and a synthetic deadline. Ask for the converted date and completed age. Observe whether the calendar basis is understood.
3. Give synthetic Preeti text and a sample photo, then request copyable Unicode and a readable image under a stated generic KB limit. Do not use a real government submission.
4. Repeat an equivalent task with Sajilo Desk and the usual tool. Alternate order between participants to reduce learning bias. Use different synthetic inputs with comparable difficulty.
5. “What would make you use this again? Which result would you double-check? Where would you expect the next step?” Avoid suggesting desired answers.
6. Let shops bookmark or favorite useful tools. In weeks 3–4, record independent reuse with a simple voluntary shop diary or short consented check-in; avoid cookies that silently identify people.

Record a pseudonymous participant ID, audience type, device/browser, viewport, connection condition, tool/version, task, order, elapsed seconds, taps/clicks, help requests, errors, final correctness, copy/download success and one short comment. Use median times and per-task counts; separate shop reuse from household reuse. Keep optional contact details outside the public dataset and remove them after the pilot.

Proposed decision criteria inherited from the earlier PDF: at least 8/10 users finish unaided; median task completion at least 30% faster than their baseline; zero critical output errors; at least 3/5 shops return independently in week four. These are directional thresholds for a tiny convenience sample, not population estimates. Investigate any critical wrong output immediately. Replicate outside Butwal before generalizing.

For the competitor benchmark, use a 360–390 px Android viewport and at least one desktop browser. Run date conversion, age-at-cutoff and image-under-KB tasks on the verified competitor URLs in [research.md](research.md). Measure steps, error recovery, language coverage, load/interaction timings, ad obstruction, stated/actual limits, source freshness and related-tool navigation. Mark failed/unavailable tasks rather than inventing scores.

## First 30 days

| Period | Work | Evidence to retain |
| --- | --- | --- |
| Days 1–7 | Complete correctness review, Nepali review and real-device smoke tests; verify hosting and indexing configuration; recruit approved pilot | Test report, reviewer corrections, deployment URL/version, indexing status |
| Days 8–14 | Compare core tasks; improve the most frequent errors; publish one helpful demonstration per strong task; issue QR cards only for working canonical links | Task success counts, baseline/prototype median times, wording from users |
| Days 15–21 | Observe shop reuse; review Search Console query/page evidence; improve high-impression pages without adding thin duplicates | Query/page export and voluntary reuse diary |
| Days 22–30 | Review independent reuse and support workload; choose one next opportunity; test the same workflow outside the initial area if it passes | Decision record: add, revise, or defer; no promised audience number |

Distribution should demonstrate a real result: a 30–45-second Nepali photo-size example, a BS→AD→age walkthrough, and a print-shop card linking directly to the tool. Draft content locally first; ask the owner before posting to communities or contacting anyone. Do not spam unrelated groups. English versions can be shared in relevant diaspora contexts after permission. QR cards should point to the final canonical hostname, not a disposable preview.

## Revenue options after useful traffic exists

Keep all core tools free. Test these in order of operational fit, without activating any network during development:

| Route | Suitability and validation | Cost/trust constraints |
| --- | --- | --- |
| Clearly labeled category sponsorship | A relevant local business may value a small, defined audience; test willingness with a concrete placement and real traffic data | No implied government endorsement; fixed area away from input/result/download; owner approves sponsor |
| Display advertising | Apply only after original content, working tools and a stable public site exist; current [AdSense eligibility](https://support.google.com/adsense/answer/9724) requires suitable original content, policy compliance and an adult account holder | Approval/revenue are not guaranteed; recheck supported content languages, current consent/privacy rules for user geography, ad placement and performance before application |
| Disclosed referral partnerships | Test only where the partner directly helps the visitor's task and its terms are approved | Label compensation; do not rank by commission or route official applications through a paid intermediary |

No RPM or traffic forecast is established. Use `monthly revenue = monthly pageviews / 1,000 × page RPM`, with the same pageview base and currency. For illustration only, **100,000 monthly pageviews × USD 0.50 / 1,000 = USD 50/month**; both numbers are hypothetical, not a Nepal benchmark or earnings promise. Subtract maintenance, review, support, any future paid infrastructure and taxes/fees where applicable. Use actual approved partner terms and measured traffic before business decisions.

Two concrete AdSense constraints require attention before activation. As of this review, Google's [supported publisher-language list](https://support.google.com/adsense/answer/9727?hl=en) includes English but **does not include Nepali**; it disallows ad code on pages primarily in an unsupported language. Keep `/ne/` pages free of AdSense unless that policy changes, and seek approval for any proposed English inventory. For personalized ads to EEA, UK and Swiss visitors, Google's [publisher consent requirements](https://support.google.com/adsense/answer/13554116?hl=en) require a certified CMP integrated with the IAB framework. Recheck the current rules and site configuration at launch rather than assuming a bilingual site is automatically eligible.

Reserve predictable placement in the design if needed, but avoid empty ad boxes at launch. Never obscure the main task or place a misleading advertisement beside “Download”. Recheck the selected network's live policies and applicable regional consent requirements at activation; this plan is not a completed legal/privacy review.
