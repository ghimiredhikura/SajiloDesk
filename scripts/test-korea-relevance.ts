import {chooseTask} from './korea-browser-helpers.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { getTaskChoices,getChangeTargets,koreaVisas } from '../src/lib/korea-catalog';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8791';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Use the local QA server.');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
const choose=async(id:string,code:string)=>{
  await page.fill(`#${id}-search`,code);
  await page.locator(`#${id}-results [role=option]`).filter({hasText:new RegExp(`^${code} ·`)}).click();
};
const values=async(id:string)=>page.locator(`#${id} option`).evaluateAll(options=>options.map(o=>(o as HTMLOptionElement).value).filter(Boolean));
await mkdir('tmp/korea-relevance',{recursive:true});
try{
  for(const lang of ['en','ne'])for(const width of [320,390,1366]){
    await page.setViewportSize({width,height:900});await page.goto(`${base}/${lang}/life-abroad/`);
    await choose('journey-visa','E-9');
    assert.deepEqual(await values('journey-task'),getTaskChoices('E-9').map(t=>t.id));
    await chooseTask(page,'change');
    assert.deepEqual(await values('journey-target'),[...getChangeTargets('E-9').map(t=>t.id),'other']);
    await page.locator('#journey-target-search').focus();
    const listBounds=await page.locator('#journey-target-results').boundingBox();
    const navTop=await page.locator('.mobile-nav').evaluate(e=>getComputedStyle(e).display==='none'?innerHeight:e.getBoundingClientRect().top);
    assert.ok(listBounds&&listBounds.y+listBounds.height<=navTop,`${lang} ${width}: target list clears mobile navigation`);
    await page.fill('#journey-target-search','D2');
    assert.equal(await page.locator('#journey-target-results [role=option]').count(),1);
    assert.equal(await page.locator('#journey-target-results [role=option]').filter({hasText:/^D-2/}).count(),0);
    await page.locator('#journey-target-results [role=option]').click();
    await page.click('#journey-open');await page.waitForURL('**/status-change-check/?visa=E-9');
    assert.ok(!(await page.locator('#korea-context-label').textContent())!.includes('ALL'));
    await page.locator('[data-journey].compact summary').click();
    assert.equal(await page.inputValue('#journey-target'),'other');
    await choose('journey-target','E-7-4');
    await choose('journey-visa','D-2');
    assert.equal(await page.inputValue('#journey-target'),'');
    assert.equal(await page.inputValue('#journey-target-search'),'');
    assert.equal(await page.locator('#journey-open').isDisabled(),true);
    assert.equal(await page.locator('#journey-selection-note').isVisible(),true);
    await choose('journey-target','D-10');
    await choose('journey-visa','F-5');
    assert.equal(await page.inputValue('#journey-task'),'');
    assert.equal(await page.locator('#journey-target-field').isVisible(),false);
    assert.equal(await page.locator('#journey-target-search').isDisabled(),true);
    assert.deepEqual(await values('journey-task'),getTaskChoices('F-5').map(t=>t.id));
    await chooseTask(page,'card');await page.click('#journey-open');await page.waitForURL('**/residence-card/?visa=F-5');
    await page.locator('[data-journey].compact summary').click();
    await choose('journey-visa','C-3');
    assert.equal(await page.inputValue('#journey-task'),'');
    assert.deepEqual(await values('journey-task'),getTaskChoices('C-3').map(t=>t.id));
    assert.ok((await page.locator('#journey-entry-link').getAttribute('href'))!.includes('entry-visa/?visa=C-3'));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`tmp/korea-relevance/${lang}-${width}.png`,fullPage:false});
  }
  // The real DOM and the searchable list must agree with the rules for every
  // current status, not just the most common examples.
  await page.goto(`${base}/en/life-abroad/`);
  for(const visa of koreaVisas){
    await choose('journey-visa',visa);
    assert.deepEqual(await values('journey-task'),getTaskChoices(visa).map(t=>t.id));
    if(getTaskChoices(visa).some(t=>t.id==='change')){
      await chooseTask(page,'change');
      assert.deepEqual(await values('journey-target'),[...getChangeTargets(visa).map(t=>t.id),'other']);
      await page.locator('#journey-target-search').focus();
      const labels=await page.locator('#journey-target-results [role=option]').allTextContents();
      for(const forbidden of koreaVisas.filter(code=>!getChangeTargets(visa).some(t=>t.id===code)))assert.ok(!labels.some(label=>label.startsWith(`${forbidden} ·`)),`${visa}: leaked ${forbidden}`);
      await page.locator('#journey-target-search').press('Escape');
    }
  }
  // A stale target URL remains readable but cannot submit a filtered-out pair.
  await page.goto(`${base}/en/life-abroad/korea/change-to-d-2/?visa=E-9`);
  await page.locator('[data-journey].compact summary').click();
  assert.equal(await page.inputValue('#journey-target'),'');assert.equal(await page.locator('#journey-open').isDisabled(),true);
  // Hidden values injected into a native select still fail the route guard.
  await page.evaluate(()=>{const select=document.querySelector<HTMLSelectElement>('#journey-target')!;select.append(new Option('D-2','D-2'));select.value='D-2';});
  await page.locator('#korea-journey-form').dispatchEvent('submit');
  assert.ok(page.url().endsWith('/change-to-d-2/?visa=E-9'));
  assert.deepEqual(errors,[]);
  console.log('PASS: status-specific task/target menus for all catalogue choices; both searchable and native controls; 6 bilingual responsive flows; invalid choice clearing, special-case escape route, old links and guarded submission.');
}finally{await browser.close();}
