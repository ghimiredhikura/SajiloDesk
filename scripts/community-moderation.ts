import { createRemoteJWKSet, jwtVerify } from 'jose';
import { categories, threads, type CommunityEnv } from './community-types';

const privateHeaders = {
  'Cache-Control': 'private, no-store, no-transform',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  Vary: 'Cf-Access-Jwt-Assertion, Cookie',
};
const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
function json(value: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { ...privateHeaders, 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", ...extra } });
}

export async function moderator(request: Request, env: CommunityEnv): Promise<{ email: string } | 'unconfigured' | null> {
  const { ADMIN_ACCESS_TEAM_DOMAIN: issuer, ADMIN_ACCESS_AUD: audience, ADMIN_EMAIL: email } = env;
  // Pin the issuer/JWKS to an explicitly configured Cloudflare team, never to JWT input.
  if (!issuer || !/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/.test(issuer) || !audience || !email) return 'unconfigured';
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 16000) return null;
  try {
    let keys = keySets.get(issuer);
    if (!keys) { keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), { timeoutDuration: 5000 }); keySets.set(issuer, keys); }
    const { payload } = await jwtVerify(token, keys, {
      issuer, audience, algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'nbf', 'sub', 'email', 'type'],
      clockTolerance: 5,
    });
    if (payload.type !== 'app' || typeof payload.email !== 'string' || payload.email.toLowerCase() !== email.trim().toLowerCase()) return null;
    if (typeof payload.iat !== 'number' || payload.iat > Date.now() / 1000 + 5) return null;
    return { email: payload.email };
  } catch { return null; }
}

function denied(request: Request, configured: boolean) {
  const status = configured ? 403 : 503;
  if (new URL(request.url).pathname.startsWith('/admin/api/')) return json({ error: configured ? 'sign_in_required' : 'sign_in_unavailable' }, status);
  const title = configured ? 'Sign-in required' : 'Owner sign-in is being set up';
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} | SajiloDesk</title></head><body><h1>${title}</h1><p>Community moderation is private. Sign in with the approved owner account to continue.</p><p><a href="/">Back to SajiloDesk</a></p></body></html>`, {
    status, headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" },
  });
}

export async function moderation(request: Request, env: CommunityEnv): Promise<Response> {
  const user = await moderator(request, env);
  if (!user || user === 'unconfigured') return denied(request, user !== 'unconfigured');
  const url = new URL(request.url);
  try {
    if (url.pathname === '/admin/api/comments') {
      if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
      const status = url.searchParams.get('status') || 'pending', thread = url.searchParams.get('thread') || '', category = url.searchParams.get('category') || '', before = url.searchParams.get('before');
      if (!['pending', 'published'].includes(status) || (thread && !threads.includes(thread as typeof threads[number])) || (category && !categories.includes(category as typeof categories[number])) || (before !== null && (!/^[1-9]\d{0,14}$/.test(before) || !Number.isSafeInteger(Number(before))))) return json({ error: 'invalid_query' }, 400);
      const filter = `${thread ? ' AND thread=?' : ''}${category ? ' AND category=?' : ''}`;
      const values = [...(thread ? [thread] : []), ...(category ? [category] : [])];
      const rows = await env.COMMUNITY_DB.prepare(`SELECT id,thread,name,category,message,created_at AS createdAt,status FROM comments WHERE status=?${filter} AND id<? ORDER BY id DESC LIMIT 21`).bind(status, ...values, before === null ? Number.MAX_SAFE_INTEGER : Number(before)).all();
      const counts = await env.COMMUNITY_DB.prepare(`SELECT status,count(*) AS count FROM comments WHERE 1=1${filter} GROUP BY status`).bind(...values).all<{ status: 'pending' | 'published'; count: number }>();
      const totals = { pending: 0, published: 0 }; for (const row of counts.results) totals[row.status] = row.count;
      const comments = rows.results.slice(0, 20) as { id: number }[];
      return json({ comments, counts: totals, nextBefore: rows.results.length > 20 ? comments.at(-1)!.id : null, reviewer: user.email });
    }
    const match = /^\/admin\/api\/comments\/([1-9]\d{0,14})$/.exec(url.pathname);
    if (match) {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
      // Same-origin JSON plus a custom header prevents cross-site forms and fetches.
      if (request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site' || request.headers.get('X-SajiloDesk-Moderation') !== '1') return json({ error: 'forbidden_origin' }, 403);
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'json_required' }, 415);
      const reader = request.body?.getReader(); if (!reader) return json({ error: 'invalid_action' }, 400);
      let size = 0; const chunks: Uint8Array[] = [];
      for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 512) { await reader.cancel(); return json({ error: 'too_large' }, 413); } chunks.push(value); }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      let body: unknown; try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'invalid_action' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !('action' in body) || typeof body.action !== 'string' || !['publish', 'delete'].includes(body.action)) return json({ error: 'invalid_action' }, 400);
      const id = Number(match[1]); if (!Number.isSafeInteger(id)) return json({ error: 'invalid_id' }, 400);
      const sql = body.action === 'publish' ? "UPDATE comments SET status='published' WHERE id=? AND status='pending' RETURNING id" : 'DELETE FROM comments WHERE id=? RETURNING id';
      const row = await env.COMMUNITY_DB.prepare(sql).bind(id).first<{ id: number }>();
      if (!row) return json({ error: 'comment_changed' }, 409);
      return json({ id: row.id, action: body.action });
    }
    if (url.pathname.startsWith('/admin/api/')) return json({ error: 'not_found' }, 404);
    if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, HEAD' });
    if (url.pathname === '/admin') return new Response(null, { status: 308, headers: { ...privateHeaders, Location: '/admin/' } });
    const asset = await env.ASSETS.fetch(request), response = new Response(asset.body, asset);
    for (const [key, value] of Object.entries(privateHeaders)) response.headers.set(key, value);
    response.headers.delete('ETag'); response.headers.delete('Last-Modified');
    return response;
  } catch { return json({ error: 'unavailable' }, 503); }
}
