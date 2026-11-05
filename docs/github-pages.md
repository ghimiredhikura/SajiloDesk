# GitHub Pages deployment

The current requested target is **https://ghimiredhikura.github.io/SajiloDesk/**, using the `main` branch of `ghimiredhikura/SajiloDesk`. The workflow is `.github/workflows/deploy-pages.yml`. This supersedes the earlier Cloudflare-only hosting plan.

## Current deployment (5 November 2026)

The repository is public and GitHub Pages uses the Actions workflow. HTTPS is enforced. The requested project address returns a 301 redirect to **https://ghimiredeepak.com.np/SajiloDesk/** because the account's personal website has a custom domain. That destination serves SajiloDesk successfully; its English and Nepali pages and all five tools were checked in Chrome. The personal website and its DNS were not changed. The separate `sajilodesk.com.np` domain is still pending approval.

## First deployment

1. Push the application source, lockfile and workflow to `main`. Do not upload `node_modules`, private research files or `.env`.
2. In the SajiloDesk repository, open **Settings → Pages** and select **GitHub Actions** as the publishing source.
3. The workflow installs with Node 24, runs diagnostics, tests, the static build and generated-page checks, then publishes `dist/` using GitHub Pages.
4. Check the **Actions** run and its deployment URL. Verify the language redirect, English/Nepali navigation, all tools, the sample photo and calendar on the published site.

The workflow defaults to `PUBLIC_SITE_URL=https://ghimiredhikura.github.io` and `PUBLIC_BASE_PATH=/SajiloDesk/`. Internal routes, public assets, sample-image requests, canonicals and sitemap use this base. Ordinary local development still defaults to `/`.

The repository owner's user site has a custom domain. GitHub redirects the project address to `https://ghimiredeepak.com.np/SajiloDesk/` through its inherited-domain behavior. Do not modify the personal website or its DNS as part of this deployment.

## Local verification of the project path

In a normal local checkout, or `%LOCALAPPDATA%\SajiloDesk-runtime` after syncing source:

```powershell
$env:PUBLIC_SITE_URL = 'https://ghimiredhikura.github.io'
$env:PUBLIC_BASE_PATH = '/SajiloDesk/'
$env:PUBLIC_INDEXABLE = 'false'
npm run verify
npm run preview -- --port 4333
```

Open `http://127.0.0.1:4333/SajiloDesk/`. For browser suites, set `TEST_BASE_URL=http://127.0.0.1:4333/SajiloDesk` in a second terminal, then run `npm run test:browser`, `npm run test:defaults` and `npm run test:calendar`.

## Later custom domain

Once `sajilodesk.com.np` is approved and its DNS is under the owner's control:

1. Verify the domain and configure it in this repository's **Settings → Pages → Custom domain**.
2. Set DNS records using GitHub's current custom-domain documentation, then enable HTTPS once available.
3. Set repository Actions variables `PUBLIC_SITE_URL=https://sajilodesk.com.np` and `PUBLIC_BASE_PATH=/` and rerun the workflow. A custom domain uses root paths.
4. Leave `PUBLIC_INDEXABLE=false` until the selected hostname and release are ready for search indexing; then set it to `true` and rebuild. On a project URL, the account site's root `robots.txt` is authoritative; page-level noindex is applied independently.

## Host differences

GitHub Pages serves static files. It does not interpret Cloudflare's `_headers` file. The build also places a supported CSP and referrer policy in the generated HTML. Header-only protections such as `frame-ancestors`, response cache rules and Permissions-Policy require a host that supports setting response headers; they are not claimed as GitHub Pages response headers.

References: [Astro deployment guide](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).
