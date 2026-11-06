// Exercises real Worker authentication/SQL and the built UI using local-only fixtures.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import worker from './community-worker';
import { fixture, token } from '../tests/helpers/moderation';

const { db, env, insert } = fixture();
const pendingId = insert('Please consider more visa guides. This is a local-only example.');
insert('A published local experience.', 'published', 'korea-d2-extension', 'experience');
const nepaliId = insert('यो स्थानीय परीक्षणका लागि मात्र राखिएको सुझाव हो।', 'pending', 'korea-e9-extension', 'correction');
insert('<img src=x onerror="window.__commentExecuted=true"> This must remain plain text.', 'pending', 'korea-d4-extension', 'experience');
for (let i = 0; i < 23; i++) insert(`Local-only pagination fixture ${i}.`);
const dist = path.resolve('dist');
const headersFile = await readFile(path.join(dist, '_headers'), 'utf8');
const csp = headersFile.match(/Content-Security-Policy:\s*(.+)/)![1];
env.ASSETS.fetch = async request => {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const file = path.resolve(dist, `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`);
  if (!file.startsWith(`${dist}${path.sep}`)) return new Response('Not found', { status: 404 });
  try {
    const bytes = await readFile(file);
    const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml' };
    return new Response(bytes, { headers: { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Security-Policy': csp, 'Cache-Control': 'public' } });
  } catch { return new Response('Not found', { status: 404 }); }
};
let base = '';
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks: Buffer[] = []; for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
    const request = new Request(`${base}${incoming.url}`, { method: incoming.method, headers: incoming.headers as Record<string, string>, ...(!['GET', 'HEAD'].includes(incoming.method || '') ? { body: Buffer.concat(chunks).toString('utf8') } : {}) });
    const response = await worker.fetch(request, env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch { outgoing.writeHead(500); outgoing.end('Local fixture failed'); }
});
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const context = await browser.newContext({ extraHTTPHeaders: { 'Cf-Access-Jwt-Assertion': await token() } });
const page = await context.newPage(); const errors: string[] = [], external: string[] = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', request => { if (new URL(request.url()).origin !== base) external.push(request.url()); });
await mkdir('tmp/moderation', { recursive: true });
try {
  const anonymous = await browser.newContext();
  for (const route of ['/admin', '/admin/', '/admin/index.html', '/admin/api/comments']) assert.equal((await anonymous.request.get(`${base}${route}`)).status(), 403);
  await anonymous.close();
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    assert.equal((await page.goto(`${base}/admin/`))!.status(), 200);
    await page.locator('#review-status').filter({ hasText: '20 pending' }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Fits ${width}`);
    for (const button of await page.locator('.review-actions button').all()) assert.ok((await button.boundingBox())!.height >= 44);
    await page.screenshot({ path: `tmp/moderation/${width}.png`, fullPage: false });
  }
  await page.click('#review-more'); await page.locator('#review-status').filter({ hasText: '26 pending' }).waitFor();
  assert.equal(await page.locator('.review-card').count(), 26);
  assert.equal(await page.locator('.review-message img').count(), 0);
  assert.equal(await page.evaluate(() => (window as any).__commentExecuted), undefined);
  await page.selectOption('#review-thread', 'korea-e9-extension'); await page.locator('#review-status').filter({ hasText: '1 pending' }).waitFor();
  assert.ok((await page.locator('.review-message').textContent())!.includes('स्थानीय'));
  await page.getByRole('button', { name: `Delete comment ${nepaliId}`, exact: true }).click();
  assert.equal(await page.locator('#review-delete-dialog').isVisible(), true);
  assert.equal(await page.locator('#review-cancel-delete').evaluate(node => node === document.activeElement), true);
  await page.click('#review-cancel-delete'); assert.equal(await page.locator('.review-card').count(), 1);
  await page.getByRole('button', { name: `Publish comment ${nepaliId}`, exact: true }).click();
  await page.locator('#review-status').filter({ hasText: `Comment #${nepaliId} published` }).waitFor();
  assert.equal(await page.locator('.review-card').count(), 0);
  const publicData = await context.request.get(`${base}/api/comments?thread=korea-e9-extension`).then(r => r.json());
  assert.equal(publicData.comments[0].id, nepaliId);
  await page.locator('[data-review-tab=published]').click(); await page.locator('#review-status').filter({ hasText: '1 published' }).waitFor();
  assert.equal(await page.locator('.review-primary').count(), 0);
  await page.getByRole('button', { name: `Delete comment ${nepaliId}`, exact: true }).click(); await page.click('#review-confirm-delete');
  await page.locator('#review-status').filter({ hasText: `Comment #${nepaliId} deleted` }).waitFor();
  assert.equal((await context.request.get(`${base}/api/comments?thread=korea-e9-extension`).then(r => r.json())).comments.length, 0);
  await page.selectOption('#review-thread', ''); await page.locator('#review-status').filter({ hasText: '1 published' }).waitFor();
  await page.locator('[data-review-tab=pending]').click(); await page.locator('#review-status').filter({ hasText: '20 pending' }).waitFor();
  await page.selectOption('#review-category', 'request'); await page.locator('#review-status').filter({ hasText: '20 pending' }).waitFor();
  assert.equal(await page.locator('.review-category').filter({ hasText: 'Experience' }).count(), 0);
  // A failed publish keeps the comment pending and displays an actionable error.
  await page.selectOption('#review-thread', 'korea-d4-extension'); await page.locator('.review-empty').waitFor();
  await page.selectOption('#review-category', 'experience'); await page.locator('#review-status').filter({ hasText: '1 pending' }).waitFor();
  const id = await page.locator('.review-card').getAttribute('data-comment-id');
  await page.route(`**/admin/api/comments/${id}`, route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
  await page.getByRole('button', { name: `Publish comment ${id}`, exact: true }).click(); await page.locator('#review-status').filter({ hasText: 'Please try again' }).waitFor();
  assert.equal(db.prepare('SELECT status FROM comments WHERE id=?').get(Number(id))!.status, 'pending');
  await page.unroute(`**/admin/api/comments/${id}`);
  // Access itself redirects expired sessions to its login screen before the Worker.
  await page.route('**/admin/api/comments?*', route => route.fulfill({ status: 302, headers: { Location: '/cdn-cgi/access/login' } }));
  await page.click('#review-refresh'); await page.locator('#review-sign-in').waitFor();
  assert.equal(await page.locator('#review-refresh').isDisabled(), true);
  await page.unroute('**/admin/api/comments?*'); await page.reload();
  await page.locator('#review-status').filter({ hasText: '20 pending' }).waitFor();
  // Expired/revoked identity cannot refresh or publish; reauthentication is offered.
  await context.setExtraHTTPHeaders({ 'Cf-Access-Jwt-Assertion': await token({ exp: Math.floor(Date.now() / 1000) - 60 }) });
  await page.click('#review-refresh'); await page.locator('#review-sign-in').waitFor();
  assert.equal(await page.locator('#review-refresh').isDisabled(), true);
  assert.equal(db.prepare('SELECT status FROM comments WHERE id=?').get(pendingId)!.status, 'pending');
  assert.equal(external.length, 0);
  // The deliberately injected 503/403 above are expected console network errors.
  assert.ok(errors.every(error => /Failed to load resource/.test(error)), errors.join('\n'));
  console.log('Moderation passed: signed owner identity, 4 responsive layouts, filters, pagination, plain-text rendering, publish/public visibility, cancel/delete, failures and expired-session handling. All writes used in-memory local SQLite.');
} finally { await browser.close(); await new Promise<void>(resolve => server.close(() => resolve())); db.close(); }
