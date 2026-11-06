# SajiloDesk production deployment

Production hostname: **https://sajilodesk.com/**. The source repository remains `ghimiredhikura/SajiloDesk`. Domain registration and DNS are with Cloudflare. The former GitHub Pages project was retired on 6 November 2026 at the owner's request. GitHub Actions now verifies builds without publishing a Pages site; Cloudflare production is published using the command below.

New visitors to the root open `/ne/` by default. A saved explicit English selection opens `/en/` on subsequent root visits in that browser. The no-JavaScript language chooser and search-engine `x-default` alternate also prefer Nepali.

## Hosting

`wrangler.jsonc` serves Astro's generated `dist/` as static assets on `sajilodesk.com`. The five tools and guide pages are static, with no document uploads or SSR. Only `/api/*` runs `scripts/community-worker.ts` for public comments, backed by the `COMMUNITY_DB` D1 binding. A daily scheduled handler expires unapproved comments and rate-limit records. Comments use Worker/D1 free-tier allowances; ordinary asset traffic remains separate. See [Korea service and moderation](korea-service.md) for setup, privacy, review and expansion instructions. Static asset requests are free and unlimited under Cloudflare's current pricing, subject to platform asset limits.

`wrangler.redirect.jsonc` deploys a separate, small `sajilodesk-redirect` Worker for `www.sajilodesk.com` and `http://sajilodesk.com/*`. It redirects to the HTTPS apex and preserves paths and query strings. Redirect requests use the Workers free-tier allowance. Custom-domain setup creates the corresponding DNS bindings and certificates. No paid plan or certificate subscription is needed.

Both Workers disable `workers.dev` and version preview URLs. The production origin uses root paths, not `/SajiloDesk/`. A static redirect also removes a copied `/SajiloDesk/` prefix on the new domain.

The account has a Workers subdomain registered because Cloudflare requires this account setup for Cron Triggers. The main Worker keeps its `workers.dev` route and preview URLs disabled. The daily `17 19 * * *` UTC schedule runs comment-retention cleanup.

The response headers include `Cache-Control: public, no-transform` so Cloudflare does not automatically rewrite HTML to inject a Web Analytics beacon. The application keeps its existing no-analytics behavior and restrictive script policy. This follows [Cloudflare's documented behavior](https://developers.cloudflare.com/web-analytics/faq/).

## Publish an update

From a normal local checkout, install locked dependencies with `npm ci`. For the Google Drive source, first run `scripts/sync-local.ps1` and work in `%LOCALAPPDATA%\SajiloDesk-runtime` to avoid virtual-filesystem package errors.

Authenticate once with `npm exec -- wrangler login --use-keyring`; the owner must approve Cloudflare's browser authorization. On this Windows setup, credentials use encrypted storage with the key held in Windows Credential Manager. Never add authentication tokens to the repository.

Set these build variables in PowerShell:

```powershell
$env:PUBLIC_SITE_URL = 'https://sajilodesk.com'
$env:PUBLIC_BASE_PATH = '/'
$env:PUBLIC_INDEXABLE = 'true'
$env:PUBLIC_CONTACT_EMAIL = 'sajilodesk@gmail.com'
npm run deploy
```

The deployment command verifies the site, builds the static files, and publishes the main site and redirect Worker. It does not upgrade Cloudflare's plan. Push the corresponding source commit to GitHub. Until a Cloudflare Git build integration or an appropriately scoped CI credential is configured, pushing to GitHub alone does not update this production deployment.

## Verify after publishing

- Check root language routing, `/en/`, `/ne/`, all five tools, the example photo and calendar.
- Confirm HTTP and `www` redirect to `https://sajilodesk.com` with paths and queries preserved.
- Confirm unknown pages return HTTP 404 and the configured response headers are present.
- Confirm public pages are indexable and their canonical/hreflang URLs use `sajilodesk.com` without the old project prefix. Saved tools and the 404 page remain `noindex`.
- Check both languages of the Korea guides, saved checklist, comments GET endpoint and moderation queue. Do not submit synthetic comments to production; test writes against local D1.
- Confirm `/robots.txt` and `/sitemap.xml` use the new origin. Search Console domain verification and sitemap submission are a separate owner-account step; indexing is not guaranteed by deployment.

References: [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
