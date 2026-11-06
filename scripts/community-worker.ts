// Only /api/* invokes this Worker; ordinary site assets remain static and cacheable.
export const threads = ['korea-d2-extension', 'korea-d4-extension', 'korea-e9-extension', 'korea-address-change'] as const;
const categories = ['experience', 'correction', 'request'];
interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
interface Env { COMMUNITY_DB: { prepare(sql: string): Statement }; COMMENT_SALT: string; ASSETS: { fetch(request: Request): Promise<Response> } }
export interface CommentInput { thread: string; name: string; category: string; message: string }
export function validateComment(value: unknown): CommentInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.consent !== true || (input.website !== '' && input.website !== undefined)) return null;
  if (typeof input.thread !== 'string' || !threads.includes(input.thread as typeof threads[number])) return null;
  if (typeof input.category !== 'string' || !categories.includes(input.category)) return null;
  if (typeof input.message !== 'string' || (input.name !== undefined && typeof input.name !== 'string')) return null;
  const message = input.message.normalize('NFC').trim(), name = ((input.name as string | undefined) || '').normalize('NFC').trim() || 'Visitor';
  if (message.length < 10 || message.length > 1500 || name.length > 40 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message) || /[\r\n\u0000-\u001f\u007f]/.test(name)) return null;
  return { thread: input.thread, name, category: input.category, message };
}
function json(value: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", ...extra } });
}
async function rateKey(request: Request, secret: string, day: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  // Cloudflare supplies this header. A private, day-specific hash is stored, never the raw IP.
  const ip = request.headers.get('CF-Connecting-IP') || 'local-development';
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${day}:${ip}`));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function commentsApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== '/api/comments') return json({ error: 'not_found' }, 404);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
  try {
    if (request.method === 'GET') {
      const thread = url.searchParams.get('thread');
      const before = url.searchParams.get('before');
      if (!threads.includes(thread as typeof threads[number]) || (before !== null && (!/^[1-9]\d{0,14}$/.test(before) || !Number.isSafeInteger(Number(before))))) return json({ error: 'invalid_query' }, 400);
      const results = await env.COMMUNITY_DB.prepare('SELECT id,name,message,category,created_at AS createdAt FROM comments WHERE thread=? AND status=\'published\' AND id<? ORDER BY id DESC LIMIT 21').bind(thread, before === null ? Number.MAX_SAFE_INTEGER : Number(before)).all<{ id: number; name: string; message: string; category: string; createdAt: string }>();
      const comments = results.results.slice(0, 20);
      return json({ comments, nextBefore: results.results.length > 20 ? comments.at(-1)!.id : null });
    }
    // Requests are same-origin, explicit JSON, and never accept cross-site form posts.
    if (request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json({ error: 'forbidden_origin' }, 403);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'json_required' }, 415);
    if (!env.COMMENT_SALT) return json({ error: 'unavailable' }, 503);
    if (Number(request.headers.get('Content-Length') || 0) > 24000) return json({ error: 'too_large' }, 413);
    // Limit streamed bytes too; a missing/forged Content-Length must not bypass the cap.
    const reader = request.body?.getReader(); if (!reader) return json({ error: 'invalid_comment' }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 24000) { await reader.cancel(); return json({ error: 'too_large' }, 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    let parsed: unknown; try { parsed = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'invalid_json' }, 400); }
    const comment = validateComment(parsed); if (!comment) return json({ error: 'invalid_comment' }, 400);
    const now = new Date(), day = now.toISOString().slice(0, 10);
    const hash = await rateKey(request, env.COMMENT_SALT, day);
    const limited = await env.COMMUNITY_DB.prepare('INSERT INTO comment_limits (key,day,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<3 RETURNING count').bind(hash, day).first<{ count: number }>();
    if (!limited) return json({ error: 'daily_limit' }, 429, { 'Retry-After': '86400' });
    const pending = await env.COMMUNITY_DB.prepare('SELECT count(*) AS count FROM comments WHERE status=\'pending\'').first<{ count: number }>();
    if ((pending?.count || 0) >= 500) return json({ error: 'review_queue_full' }, 503);
    // No public endpoint can publish; review happens through the owner's Cloudflare access.
    const inserted = await env.COMMUNITY_DB.prepare('INSERT INTO comments (thread,name,category,message,created_at,status) VALUES (?,?,?,?,?,\'pending\') RETURNING id').bind(comment.thread, comment.name, comment.category, comment.message, now.toISOString()).first<{ id: number }>();
    await purgeCommunity(env);
    return json({ id: inserted!.id, status: 'pending' }, 201);
  } catch { return json({ error: 'unavailable' }, 503); }
}
export async function purgeCommunity(env: Env) {
  const now = Date.now();
  await env.COMMUNITY_DB.prepare('DELETE FROM comment_limits WHERE day<?').bind(new Date(now - 86400000).toISOString().slice(0, 10)).run();
  await env.COMMUNITY_DB.prepare('DELETE FROM comments WHERE status=\'pending\' AND created_at<?').bind(new Date(now - 30 * 86400000).toISOString()).run();
}
export default {
  async fetch(request: Request, env: Env) { return new URL(request.url).pathname.startsWith('/api/') ? commentsApi(request, env) : env.ASSETS.fetch(request); },
  async scheduled(_event: unknown, env: Env) { await purgeCommunity(env); },
};
