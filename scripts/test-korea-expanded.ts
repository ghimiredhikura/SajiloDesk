import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile,mkdir } from 'node:fs/promises';
import { koreaGuides } from '../src/lib/korea';
import { koreaTasks,koreaVisas } from '../src/lib/korea-catalog';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8791';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('Use the local QA server.');
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext();const page=await context.newPage();
const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
const go=async(path:string)=>{assert.equal((await page.goto(base+path))!.status(),200);};
const choose=async(id:string,query:string,code:string)=>{
  await page.locator(`#${id}-search`).fill(query);
  await page.locator(`#${id}-results [role=option]`).filter({hasText:new RegExp(`^${code.replaceAll('-','\\-')} ·`)}).click();
  assert.equal(await page.locator(`#${id}`).inputValue(),code);
};
await mkdir('tmp/korea-expanded',{recursive:true});
try{
  for(const lang of ['en','ne'])for(const width of [320,390,1366]){
    await page.setViewportSize({width,height:900});await go(`/${lang}/life-abroad/`);
    assert.equal(await page.locator('#journey-target-field').isVisible(),false);
    await page.locator('#journey-visa-search').fill('D2');
    assert.equal(await page.locator('#journey-visa-results [role=option]').count(),9);
    assert.equal(await page.locator('#journey-visa-search').getAttribute('aria-expanded'),'true');
    await choose('journey-visa','D2','D-2-3');await page.selectOption('#journey-task','extension');
    assert.equal(await page.locator('#journey-target-field').isVisible(),false);
    await page.click('#journey-open');await page.waitForURL('**/d2-extension/?visa=D-2-3');
    assert.ok(await page.locator('.korea-review-line').textContent());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('[data-journey].compact summary').click();
    await page.selectOption('#journey-task','change');assert.equal(await page.locator('#journey-target-field').isVisible(),true);
    await choose('journey-target','D10','D-10');await page.click('#journey-open');
    await page.waitForURL('**/change-to-d-10/?visa=D-2-3');
    assert.match((await page.locator('#korea-context-label').textContent())!,/D-2-3 → D-10/);
    assert.equal(await page.locator('[data-document=eligibility]').isVisible(),true);
    await page.screenshot({path:`tmp/korea-expanded/${lang}-${width}-change.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await go('/en/life-abroad/');
  const search=page.locator('#journey-visa-search');
  await search.fill('D2');await search.press('ArrowDown');await search.press('Enter');
  assert.equal(await page.locator('#journey-visa').inputValue(),'D-2');
  assert.equal(await search.getAttribute('aria-expanded'),'false');
  await search.fill('invalid-visa');assert.equal(await page.locator('[data-search-empty]').first().isVisible(),true);
  assert.equal(await page.locator('#journey-open').isDisabled(),true);
  await search.press('Escape');
  await choose('journey-visa','E9','E-9');await page.selectOption('#journey-task','change');
  await page.fill('#journey-target-search','D2');
  assert.equal(await page.locator('#journey-target-results [role=option]').filter({hasText:/^D-2/}).count(),0);
  // Previously shared direct guides remain readable, even if the route is no
  // longer offered as an ordinary conversion in the smarter picker.
  await go('/en/life-abroad/korea/change-to-d-2/?visa=E-9');
  assert.match((await page.locator('#korea-context-caution').textContent())!,/restricts this in-country change/);
  await page.check('#ready-passport');await page.click('#korea-save');
  await go('/en/life-abroad/korea/change-to-d-2/?visa=D-4-1');assert.equal(await page.locator('#ready-passport').isChecked(),false);
  await go('/en/life-abroad/korea/change-to-d-2/?visa=E-9');assert.equal(await page.locator('#ready-passport').isChecked(),true);
  await page.locator('[data-language=ne]').click();assert.ok(page.url().includes('?visa=E-9'));
  assert.equal(await page.locator('#ready-passport').isChecked(),true);
  const download=page.waitForEvent('download');await page.click('#korea-download');
  const downloadPath=await (await download).path();assert.ok(downloadPath);
  const exported=await readFile(downloadPath,'utf8');
  assert.match(exported,/2026-11-07/);assert.match(exported,/E-9/);assert.match(exported,/https:\/\/www.law.go.kr/);
  await go('/en/life-abroad/korea/address-change/?visa=F-4');await page.waitForURL('**/f4-address-change/?visa=F-4');
  assert.match((await page.locator('.korea-deadline').textContent())!,/14 days/);
  assert.match((await page.locator('.korea-deadline').textContent())!,/₩2,000,000/);
  await go('/en/life-abroad/korea/workplace-change/?visa=E-9');
  assert.equal(await page.locator('[data-document=permit]').isVisible(),true);
  await go('/en/life-abroad/korea/workplace-change/?visa=E-3');
  assert.equal(await page.locator('[data-document=permit]').isVisible(),false);
  // Every generated guide and every new comment thread must be reachable.
  for(const lang of ['en','ne'])for(const guide of koreaGuides){
    const response=await page.request.get(`${base}/${lang}/life-abroad/korea/${guide.slug}/`);assert.equal(response.status(),200);
    const html=await response.text();assert.ok(html.includes('2026-11-07'),guide.slug);
    const comments=await page.request.get(`${base}/api/comments?thread=korea-${guide.slug}`);assert.equal(comments.status(),200,guide.slug);
  }
  // Render representative special routes in both languages and smallest layout.
  for(const lang of ['en','ne'])for(const slug of ['f4-registration','residence-card','student-work','employment-report','extend-b-1','change-to-e-7-4','first-registration','child-status','application-help']){
    await go(`/${lang}/life-abroad/korea/${slug}/`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${slug}`);
  }
  const nojs=await browser.newContext({javaScriptEnabled:false}),np=await nojs.newPage();await np.goto(`${base}/en/life-abroad/`);
  assert.equal(await np.locator('#journey-visa').isVisible(),true);
  assert.equal(await np.locator('noscript a').count(),koreaGuides.length);await nojs.close();
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${koreaVisas.length} visa choices, ${koreaTasks.length} tasks; ${koreaGuides.length} bilingual guide routes and comment threads; D2 search, keyboard selection, conditional third field, status-change restrictions, context-isolated saving, language context, F-4 redirect and small-screen layouts.`);
}finally{await browser.close();}
