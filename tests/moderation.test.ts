import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair } from 'jose';
import worker from '../scripts/community-worker';
import { fixture, token, request, mutation } from './helpers/moderation';

test('private pages, asset aliases and moderation API refuse unsigned requests and missing configuration', async () => {
  const { env, db } = fixture();
  try {
    for (const path of ['/admin', '/admin/', '/admin/index.html', '/admin/api/comments', '/admin/api/comments/1']) {
      const response = await worker.fetch(request(path), env);
      assert.equal(response.status, 403, path);
      assert.match(response.headers.get('Cache-Control')!, /private, no-store/);
      assert.match(response.headers.get('X-Robots-Tag')!, /noindex/);
    }
    const response = await worker.fetch(request('/admin/'), { ...env, ADMIN_ACCESS_AUD: undefined });
    assert.equal(response.status, 503);
  } finally { db.close(); }
});

test('signature, issuer, audience, expiry, identity and token type must all verify', async () => {
  const { env, db } = fixture(); const now = Math.floor(Date.now() / 1000);
  try {
    for (const patch of [{ iss: 'https://attacker.cloudflareaccess.com' }, { aud: ['another-application'] }, { exp: now - 60 }, { exp: undefined }, { email: 'another@example.test' }, { email: undefined }, { type: 'org' }, { nbf: now + 600 }, { iat: now + 600 }, { sub: undefined }]) {
      assert.equal((await worker.fetch(request('/admin/api/comments', await token(patch)), env)).status, 403, JSON.stringify(patch));
    }
    const forged = await token({}, (await generateKeyPair('RS256')).privateKey);
    assert.equal((await worker.fetch(request('/admin/api/comments', forged), env)).status, 403);
    assert.equal((await worker.fetch(request('/admin/api/comments', 'not-a-jwt'), env)).status, 403);
  } finally { db.close(); }
});

test('owner page receives no-store headers even when asset storage is public', async () => {
  const { env, db } = fixture();
  try {
    const jwt = await token(); const page = await worker.fetch(request('/admin/', jwt), env);
    assert.equal(page.status, 200); assert.match(page.headers.get('Cache-Control')!, /no-store/); assert.equal(page.headers.get('ETag'), null);
    const redirect = await worker.fetch(request('/admin', jwt), env); assert.equal(redirect.status, 308); assert.equal(redirect.headers.get('Location'), '/admin/');
  } finally { db.close(); }
});

test('owner sees private pending/published counts with guide/category filtering and keyset pagination', async () => {
  const { env, db, insert } = fixture(); const jwt = await token();
  try {
    for (let i = 0; i < 25; i++) insert(`Pending local example ${i}.`);
    insert('A published local experience.', 'published', 'korea-d2-extension', 'experience');
    const page = await worker.fetch(request('/admin/api/comments', jwt), env).then(r => r.json()) as any;
    assert.equal(page.comments.length, 20); assert.deepEqual(page.counts, { pending: 25, published: 1 }); assert.equal(page.nextBefore, 6);
    const older = await worker.fetch(request(`/admin/api/comments?before=${page.nextBefore}`, jwt), env).then(r => r.json()) as any;
    assert.equal(older.comments.length, 5); assert.equal(older.nextBefore, null);
    const filtered = await worker.fetch(request('/admin/api/comments?status=published&thread=korea-d2-extension&category=experience', jwt), env).then(r => r.json()) as any;
    assert.equal(filtered.comments.length, 1); assert.deepEqual(filtered.counts, { pending: 0, published: 1 });
    for (const query of ['status=all', 'before=-1', 'before=1%20OR%201=1', 'thread=unknown', 'category=published']) assert.equal((await worker.fetch(request(`/admin/api/comments?${query}`, jwt), env)).status, 400);
  } finally { db.close(); }
});

test('cross-site, missing-origin, form and invalid-action requests cannot mutate a comment', async () => {
  const { env, db, insert } = fixture(); const id = insert(), jwt = await token();
  try {
    const invalidHeaders: Record<string, string>[] = [{ Origin: 'https://attacker.test' }, { Origin: '' }, { 'Sec-Fetch-Site': 'cross-site' }, { 'X-SajiloDesk-Moderation': '' }, { 'Content-Type': 'text/plain' }];
    for (const headers of invalidHeaders) assert.ok((await worker.fetch(mutation(id, jwt, 'publish', headers), env)).status >= 400);
    for (const action of ['anything', ['publish'], { action: 'publish' }, null]) assert.equal((await worker.fetch(mutation(id, jwt, action), env)).status, 400);
    assert.equal((await worker.fetch(mutation(id, '', 'delete'), env)).status, 403);
    assert.equal(db.prepare('SELECT status FROM comments WHERE id=?').get(id)!.status, 'pending');
  } finally { db.close(); }
});

test('publishing makes exactly the selected comment public; deletion removes it immediately', async () => {
  const { env, db, insert } = fixture(); const id = insert(), other = insert('Another pending local comment.'), jwt = await token();
  const publicRequest = () => worker.fetch(new Request('https://sajilodesk.com/api/comments?thread=korea-address-change'), env).then(r => r.json()) as Promise<any>;
  try {
    assert.equal((await publicRequest()).comments.length, 0);
    assert.equal((await worker.fetch(mutation(id, jwt), env)).status, 200);
    assert.deepEqual((await publicRequest()).comments.map((c: any) => c.id), [id]);
    assert.equal(db.prepare('SELECT status FROM comments WHERE id=?').get(other)!.status, 'pending');
    assert.equal((await worker.fetch(mutation(id, jwt), env)).status, 409);
    assert.equal((await worker.fetch(mutation(id, jwt, 'delete'), env)).status, 200);
    assert.equal((await publicRequest()).comments.length, 0);
    assert.equal((await worker.fetch(mutation(id, jwt, 'delete'), env)).status, 409);
  } finally { db.close(); }
});

test('unsupported methods and oversized action bodies are rejected without changes', async () => {
  const { env, db, insert } = fixture(); const id = insert(), jwt = await token();
  try {
    assert.equal((await worker.fetch(request('/admin/api/comments', jwt, { method: 'DELETE' }), env)).status, 405);
    assert.equal((await worker.fetch(request(`/admin/api/comments/${id}`, jwt), env)).status, 405);
    const oversized = request(`/admin/api/comments/${id}`, jwt, { method: 'POST', headers: { Origin: 'https://sajilodesk.com', 'Content-Type': 'application/json', 'X-SajiloDesk-Moderation': '1' }, body: JSON.stringify({ action: 'publish', padding: 'x'.repeat(600) }) });
    assert.equal((await worker.fetch(oversized, env)).status, 413);
    assert.equal(db.prepare('SELECT status FROM comments WHERE id=?').get(id)!.status, 'pending');
  } finally { db.close(); }
});
