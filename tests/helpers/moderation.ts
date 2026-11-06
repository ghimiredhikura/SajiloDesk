// Test-only identity issuer and in-memory SQLite. No production authentication bypass.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import type { CommunityEnv, Statement } from '../../scripts/community-types';

export const issuer = 'https://sajilodesk-local-test.cloudflareaccess.com';
const audience = 'local-moderation-tests', email = 'owner@example.test';
const keys = await generateKeyPair('RS256');
const publicKey = { ...await exportJWK(keys.publicKey), alg: 'RS256', kid: 'local-test-key' };
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if ((input instanceof Request ? input.url : String(input)) === `${issuer}/cdn-cgi/access/certs`) return Response.json({ keys: [publicKey] });
  return realFetch(input, init);
};
export async function token(patch: Record<string, unknown> = {}, signingKey = keys.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ iss: issuer, aud: [audience], email, type: 'app', sub: 'test-owner', iat: now, nbf: now, exp: now + 3600, ...patch }).setProtectedHeader({ alg: 'RS256', kid: 'local-test-key' }).sign(signingKey);
}
export function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../../scripts/community-schema.sql', import.meta.url), 'utf8'));
  const env: CommunityEnv = {
    ADMIN_ACCESS_TEAM_DOMAIN: issuer, ADMIN_ACCESS_AUD: audience, ADMIN_EMAIL: email,
    COMMENT_SALT: 'local-test-only',
    COMMUNITY_DB: { prepare(sql) {
      const prepared = db.prepare(sql); let values: unknown[] = [];
      const statement: Statement = {
        bind(...params) { values = params; return statement; },
        async first<T>() { return (prepared.get(...values as never[]) as T | undefined) ?? null; },
        async all<T>() { return { results: prepared.all(...values as never[]) as T[] }; },
        async run() { return prepared.run(...values as never[]); },
      }; return statement;
    } },
    ASSETS: { async fetch() { return new Response('<h1>Private moderation</h1>', { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public', ETag: 'test-etag' } }); } },
  };
  function insert(message = 'A local-only moderation test.', status = 'pending', thread = 'korea-address-change', category = 'request') {
    return Number(db.prepare('INSERT INTO comments (thread,name,category,message,created_at,status) VALUES (?,?,?,?,?,?)').run(thread, 'Test reader', category, message, new Date().toISOString(), status).lastInsertRowid);
  }
  return { db, env, insert };
}
export function request(path = '/admin/api/comments', jwt?: string, options: RequestInit = {}) {
  return new Request(`https://sajilodesk.com${path}`, { ...options, headers: { ...(jwt ? { 'Cf-Access-Jwt-Assertion': jwt } : {}), ...options.headers } });
}
export function mutation(id: number, jwt: string, action: unknown = 'publish', headers: Record<string, string> = {}) {
  return request(`/admin/api/comments/${id}`, jwt, { method: 'POST', headers: { Origin: 'https://sajilodesk.com', 'Content-Type': 'application/json', 'X-SajiloDesk-Moderation': '1', ...headers }, body: JSON.stringify({ action }) });
}
