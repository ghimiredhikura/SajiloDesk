import {chooseTask} from './korea-browser-helpers.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8791';
if (!['127.0.0.1','localhost'].includes(new URL(base).hostname)) throw new Error('Korea write tests may only use a local test server/database.');
function sql(command) {
  const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js','d1','execute','sajilodesk-community','--local','--json','--command',command], { encoding:'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}
await mkdir('tmp/korea', { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const context = await browser.newContext();
const page = await context.newPage(), errors = [], external = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin) external.push(request.url()); });
const go = async path => { assert.equal((await page.goto(`${base}${path}`)).status(),200); await page.evaluate(() => document.fonts.ready); };
try {
  sql('DELETE FROM comments; DELETE FROM comment_limits;');
  for (const lang of ['en','ne']) {
    for (const width of [320,390,768,1024,1366]) {
      await page.setViewportSize({ width, height:width<600?844:900 });
      for (const route of ['', 'life-abroad/', ...['d2','d4','e9'].map(visa=>`life-abroad/korea/${visa}-extension/`), 'life-abroad/korea/address-change/']) {
        await go(`/${lang}/${route}`);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${route} fits ${width}`);
        if (route.includes('korea/')) {
          await page.locator('#community-load-status').filter({hasText:lang==='ne'?'अहिलेसम्म':'No published'}).waitFor();
          assert.equal(await page.locator('.korea-progress').isVisible(),true);
        }
      }
    }
  }
  await page.setViewportSize({width:1366,height:900});
  for (const [visa,slug] of [['D-2','d2-extension'],['D-4-1','d4-extension'],['E-9','e9-extension']]) {
    await go('/en/life-abroad/');
    assert.equal(await page.locator('#journey-task').isDisabled(),true);
    assert.equal(await page.locator('#journey-open').isDisabled(),true);
    await page.fill('#journey-visa-search',visa);
    await page.locator('#journey-visa-results [role=option]').filter({hasText:new RegExp(`^${visa} ·`)}).click();
    await chooseTask(page,'extension');await page.click('#journey-open');
    await page.waitForURL(`**/${slug}/`);
    await page.locator('[data-journey].compact summary').click();
    await chooseTask(page,'address');await page.click('#journey-open');await page.waitForURL('**/address-change/?visa=*');
    assert.equal(await page.inputValue('#journey-visa'),visa);
    assert.equal(await page.locator('[data-document=identity]').isVisible(),true);
    assert.equal(await page.locator('[data-document=permit]').count(),0);
  }
  await go('/en/life-abroad/korea/d2-extension/');
  assert.equal(await page.locator('[data-document=enrollment]').isVisible(),true);
  await page.locator('.korea-options summary').click();
  await page.selectOption('#korea-stage','thesis');
  assert.equal(await page.locator('[data-document=enrollment]').isVisible(),false);
  assert.equal(await page.locator('[data-document=advisor]').isVisible(),true);
  await page.selectOption('#korea-housing','dorm');
  await page.locator('[data-document=address] summary').click();
  assert.equal(await page.locator('[data-housing=dorm]').isVisible(),true);
  await page.check('#ready-form34'); await page.check('#ready-address');
  await page.click('#korea-save'); await page.reload();
  assert.equal(await page.inputValue('#korea-stage'),'thesis');
  assert.equal(await page.locator('#ready-address').isChecked(),true);
  assert.match(await page.locator('#korea-progress-text').textContent(),/^2 of/);
  // Language switches preserve the same path and share the guide's saved preparation.
  await page.locator('[data-language=ne]').click();
  assert.match(page.url(),/\/ne\/life-abroad\/korea\/d2-extension\//);
  assert.equal(await page.locator('#ready-form34').isChecked(),true);
  const download = page.waitForEvent('download'); await page.click('#korea-download');
  const result = await download, exported = await readFile(await result.path(),'utf8');
  assert.ok(exported.includes('[x]') && exported.includes('지도교수') && exported.includes('기숙사 거주확인서') && exported.includes('https://www.hikorea.go.kr'));
  assert.ok(!exported.includes('] 재학증명서 —'));
  await page.screenshot({path:'tmp/korea/desktop-ne-guide.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'tmp/korea/mobile-ne-guide.png',fullPage:true});
  await page.click('#korea-reset'); await page.reload(); assert.equal(await page.locator('#ready-form34').isChecked(),false);
  await go('/en/life-abroad/korea/e9-extension/');
  assert.equal(await page.locator('[data-document=reemployment]').isVisible(),true);
  await page.locator('.korea-options summary').click();
  await page.selectOption('#korea-employment','renewal'); assert.equal(await page.locator('[data-document=reemployment]').isVisible(),false);
  await page.selectOption('#korea-employment','reemployment'); assert.equal(await page.locator('[data-document=reemployment]').isVisible(),true);
  await go('/en/life-abroad/korea/d2-extension/');
  await page.fill('#community-name','Local QA reader'); await page.fill('#community-message','A synthetic local-only test of the review queue.'); await page.check('#community-consent');
  await page.click('#community-submit'); await page.locator('#community-submit-status').filter({hasText:'Submitted for review'}).waitFor();
  assert.equal((await page.request.get(`${base}/api/comments?thread=korea-d2-extension`).then(r=>r.json())).comments.length,0,'Pending comments never leak publicly');
  assert.equal(sql("SELECT count(*) AS n FROM comments WHERE status='pending'")[0].results[0].n,1);
  const post = body=>page.request.post(`${base}/api/comments`,{headers:{Origin:base},data:body});
  const valid = {thread:'korea-d2-extension',name:'Local QA',category:'correction',message:'A local-only test document suggestion.',consent:true,website:''};
  assert.equal((await post({...valid,consent:false})).status(),400);
  assert.equal((await post({...valid,website:'spam.test'})).status(),400);
  assert.equal((await page.request.post(`${base}/api/comments`,{headers:{Origin:'https://evil.example'},data:valid})).status(),403);
  assert.equal((await post(valid)).status(),201); assert.equal((await post(valid)).status(),201); assert.equal((await post(valid)).status(),429,'Daily rate cap enforced atomically');
  assert.equal(sql('SELECT count(*) AS n FROM comment_limits')[0].results[0].n,1);
  assert.match(sql('SELECT key FROM comment_limits')[0].results[0].key,/^[0-9a-f]{64}$/,'Only a hash, no raw IP');
  sql(`INSERT INTO comments(thread,name,category,message,created_at,status) VALUES ('korea-d2-extension','Local QA','experience','<img src=x onerror="window.__commentXss=true"> A local-only test.','2026-11-06T01:00:00.000Z','published');`);
  await page.reload(); await page.locator('.community-comment').waitFor();
  assert.equal(await page.locator('.community-comment img').count(),0,'Comment HTML rendered as text');
  assert.ok((await page.locator('.community-comment').textContent()).includes('<img'));
  assert.equal(await page.evaluate(()=>window.__commentXss),undefined);
  assert.equal((await page.request.get(`${base}/api/comments?thread=korea-e9-extension`).then(r=>r.json())).comments.length,0,'Guide threads isolated');
  // Published pagination has no overlap and never includes pending comments.
  sql("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<24) INSERT INTO comments(thread,name,category,message,created_at,status) SELECT 'korea-e9-extension','QA','experience','Synthetic pagination '||x,'2026-11-06T01:00:00Z','published' FROM n;");
  const first=await page.request.get(`${base}/api/comments?thread=korea-e9-extension`).then(r=>r.json());
  const next=await page.request.get(`${base}/api/comments?thread=korea-e9-extension&before=${first.nextBefore}`).then(r=>r.json());
  assert.equal(first.comments.length,20); assert.equal(next.comments.length,4); assert.equal(new Set([...first.comments,...next.comments].map(c=>c.id)).size,24);
  // Run the real scheduled handler: expire unapproved content and old limit hashes,
  // while retaining approved experiences. This uses Wrangler's local-only API.
  sql("INSERT INTO comments(thread,name,category,message,created_at,status) VALUES ('korea-d4-extension','Old pending','experience','Old synthetic pending','2000-01-01T00:00:00Z','pending'),('korea-d4-extension','Old published','experience','Old synthetic published','2000-01-01T00:00:00Z','published'); INSERT INTO comment_limits(key,day,count) VALUES ('old-local-test','2000-01-01',1);");
  const twoDaysAgo = new Date(Date.now()-2*86400000).toISOString().slice(0,10);
  sql(`INSERT INTO comment_limits(key,day,count) VALUES ('retention-boundary','${twoDaysAgo}',1);`);
  // Target the running dev proxy directly. The Explorer owner registry can
  // briefly point at the short-lived Wrangler D1 CLI after a fixture write.
  const scheduled = await page.request.get(`${base}/cdn-cgi/local/scheduled?cron=${encodeURIComponent('17 19 * * *')}`);
  assert.equal(scheduled.status(),200,await scheduled.text());
  assert.equal(sql("SELECT count(*) AS n FROM comments WHERE name='Old pending'")[0].results[0].n,0);
  assert.equal(sql("SELECT count(*) AS n FROM comments WHERE name='Old published'")[0].results[0].n,1);
  assert.equal(sql("SELECT count(*) AS n FROM comment_limits WHERE key='old-local-test'")[0].results[0].n,0);
  assert.equal(sql("SELECT count(*) AS n FROM comment_limits WHERE key='retention-boundary'")[0].results[0].n,0,'Daily cleanup meets the 72-hour upper bound');
  const blocked = await browser.newContext();
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});
  const bp=await blocked.newPage();await bp.goto(`${base}/ne/life-abroad/korea/d4-extension/`);await bp.click('#korea-save');
  assert.ok((await bp.locator('#korea-save-status').textContent()).includes('सेभ हुन सकेन'));
  await blocked.close();
  const nojs=await browser.newContext({javaScriptEnabled:false}), np=await nojs.newPage();
  await np.goto(`${base}/en/life-abroad/korea/d2-extension/`);
  assert.equal(await np.locator('[data-document=enrollment]').isVisible(),true); assert.equal(await np.locator('[data-document=advisor]').isVisible(),true);
  assert.equal(await np.locator('#community-submit').isDisabled(),true);
  await nojs.close();
  await go('/en/life-abroad/');await page.setViewportSize({width:1366,height:900});await page.screenshot({path:'tmp/korea/desktop-en-hub.png',fullPage:true});
  await go('/ne/');await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/korea/mobile-ne-home.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS: 60 bilingual responsive layouts; all six visa/task journeys, guide conditions, saved progress, export, storage failure, no-JS reading; real local D1 submission/review isolation, rate limit, validation, safe rendering, pagination and scheduled retention; zero page errors or external requests.');
} finally { await browser.close(); sql('DELETE FROM comments; DELETE FROM comment_limits;'); }
