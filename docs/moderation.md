# Community moderation

Open **https://sajilodesk.com/admin/** and sign in with the approved owner identity through Cloudflare Access. Bookmark this private address; it is not linked from the visitor navigation or sitemap.

Production Access configuration was installed on 6 November 2026 after the owner created the application. Anonymous login redirects were verified; the owner's first signed-in visit is the remaining manual check. The setup instructions below are for future reconfiguration.

## Everyday use

- **Pending** shows submissions awaiting review. **Publish** makes a comment visible immediately on its guide in both languages.
- **Published** shows live comments. **Delete** removes a comment permanently after confirmation. It works in either tab.
- Filter by guide or type, use **Load older comments** to continue, and **Refresh** to get the latest queue. Tab counts follow the selected filters.
- Check relevance, personal details and spam before publishing. Verify factual corrections against official sources before changing a guide.
- Use **Sign out** when finished. An expired sign-in disables moderation actions and offers a new sign-in.

Publishing and deleting do not require a rebuild or deployment. The visitor refreshes the guide to see the change. Existing terminal moderation remains available in [korea-service.md](korea-service.md).

## One-time Cloudflare Access setup

This application uses Cloudflare Access rather than storing an owner password. Enable Cloudflare One / Zero Trust on the owner's existing account. Choose the **Free** plan; Cloudflare currently requires billing details even for that free plan. This is a separate account setup from purchasing the domain or deploying the Worker.

1. In **Zero Trust → Access controls → Applications**, create a **Self-hosted and private** application named **SajiloDesk moderation**.
2. Set the public hostname to **sajilodesk.com**, path **admin**. Protect this path and its descendants, including `/admin/api/*`; do not protect the whole public website.
3. Add an **Allow** policy with **Include → Emails → the owner's exact approved email**. Do not use Everyone or an unrestricted email domain.
4. Use Cloudflare account sign-in, or enable a **One-time PIN** login method for that same email. Set the application session to **8 hours**.
5. Save the application. Copy its **Application Audience (AUD) Tag** from **Additional settings**, and the team's `https://<team>.cloudflareaccess.com` domain.
6. Configure these Worker environment values through the owner-authenticated deployment workflow:

| Value | Meaning |
| --- | --- |
| `ADMIN_ACCESS_TEAM_DOMAIN` | Exact HTTPS team origin, with no trailing slash. |
| `ADMIN_ACCESS_AUD` | Audience of this specific moderation application. |
| `ADMIN_EMAIL` | Exact email allowed to moderate. Store as a Worker secret to keep it out of the public repository. |

Keep the issuer, audience and email in private Worker configuration, not browser JavaScript. Account API credentials and owner authentication tokens must never be committed. The current Wrangler OAuth grant does not include Access administration; completing Access setup requires the owner's dashboard or a separately authorized, appropriately scoped API credential. After configuration, publish the Worker and verify an actual owner sign-in. Do not mark sign-in ready based only on local fixtures.

Until these values exist, all moderation paths return **503** without comment data. Once configured, missing or invalid identity returns **403**. Cloudflare should normally intercept an anonymous visit and show its sign-in screen before the request reaches the Worker. A 403 after sign-in means the policy/issuer/audience/owner configuration needs checking.

## Implementation and verification

`scripts/community-moderation.ts` verifies Cloudflare's signed `Cf-Access-Jwt-Assertion` with the pinned team JWKS, RS256, issuer, audience, expiry, not-before time, application-token type and exact owner email. It does not trust the email header, an unsigned JWT, or a service token. Signing keys refresh automatically. Static assets and APIs under `/admin` run through the Worker first. All private responses are `private, no-store, no-transform`, with `noindex` headers.

Mutation requests require authenticated identity, exact same-origin JSON and the moderation header. Only validated numeric IDs and prepared SQL are used. A repeated publish/delete returns a conflict instead of changing another row. Text is rendered with DOM `textContent`; there is no HTML preview, bulk approval or attachment support. No comment content or identity token is logged by this application.

Run `npm run verify` and `npm run test:moderation` from the synced local runtime. Security unit tests use real signed test JWTs and in-memory SQLite. The browser suite serves the built page with the production Worker handlers, covers desktop/mobile and both scripts, and tests filtering, pagination, cancel/delete, public visibility, failure and expired sessions. Test keys and fixtures exist only in test modules; there is no development bypass in the production Worker. Browser write tests never use the production database.

References: [Access setup](https://developers.cloudflare.com/cloudflare-one/setup/), [self-hosted applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/), [JWT verification](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [one-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/).
