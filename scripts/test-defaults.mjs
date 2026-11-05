// Ready-to-use examples, laptop layout, calendar boundaries and sample loading.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createCanvas } from '@napi-rs/canvas';
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:8787';
const out='tmp/compact'; await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768},timezoneId:'America/Los_Angeles'});
const page=await context.newPage(), errors=[], measurements=[];
page.on('pageerror',error=>errors.push(String(error)));
await page.clock.install({time:new Date('2026-11-05T06:00:00Z')});
const ids=['date-converter','age-calculator','preeti-unicode','land-converter','photo-resizer'];
const resultIds=['date-result','age-result','preeti-output','land-result','photo-result'];
try {
  for(const lang of ['en','ne']) {
    for(const [index,id] of ids.entries()) {
      await page.goto(`${base}/${lang}/tools/${id}/`);
      await page.locator(`#${resultIds[index]}`).waitFor({state:'visible'});
      await page.evaluate(()=>document.fonts.ready);
      if(id==='date-converter') {
        assert.equal(await page.locator('#date-year').inputValue(),'2083');
        assert.equal(await page.locator('#date-month').inputValue(),'7');
        assert.equal(await page.locator('#date-day').inputValue(),'19');
        assert.match(await page.locator('#result-iso').textContent(),/AD 2026-11-05/);
      }
      if(id==='age-calculator') assert.equal(await page.locator('#age-years').textContent(),lang==='ne'?'२६':'26');
      if(id==='preeti-unicode') assert.match(await page.locator('#preeti-output').inputValue(),/नेपाल/);
      if(id==='land-converter') assert.equal(await page.locator('#land-sqft-result').textContent(),lang==='ne'?'५,४७६':'5,476');
      if(id==='photo-resizer') {
        assert.equal(await page.locator('#photo-width').inputValue(),'800');
        assert.equal(await page.locator('#photo-height').inputValue(),'500');
        assert.equal(await page.locator('.photo-advanced').getAttribute('open'),null);
        assert.equal(await page.locator('#photo-sample-label').isVisible(),true);
      }
      assert.equal(await page.locator('.tool-instructions').getAttribute('open'),null);
      measurements.push({lang,id,...await page.locator('.tool-workspace').evaluate(element=>({bottom:element.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth}))});
      await page.screenshot({path:`${out}/${lang}-${id}-1366.png`,animations:'disabled'});
    }
    await page.goto(`${base}/${lang}/`);
    if(lang==='ne') {
      assert.match(await page.locator('.today-ad').textContent(),/बिहीबार.*५ नोभेम्बर २०२६/);
      assert.match(await page.locator('#nepal-time').textContent(),/११:४५.*नेपाल समय/);
    }
    assert.equal(await page.locator('.today-observances').getAttribute('open'),null);
    assert.equal(await page.locator('#today-world').isVisible(),true);
    assert.match(await page.locator('#today-world').textContent(),lang==='ne'?/सुनामी/:/Tsunami/);
    assert.equal(await page.locator('#today-holiday').isVisible(),false);
    assert.equal(await page.locator('#today-world').evaluate(element=>element.closest('details')),null);
    assert.ok(await page.locator('#today-world').evaluate(element=>parseFloat(getComputedStyle(element).fontSize)>=15));
    const heroBounds=await page.evaluate(()=>{
      const intro=document.querySelector('.hero-copy').getBoundingClientRect(),card=document.querySelector('.today-card').getBoundingClientRect();
      return {intro: intro.height,card:card.height,topDifference:Math.abs(intro.top-card.top)};
    });
    assert.ok(Math.abs(heroBounds.intro-heroBounds.card)<1,JSON.stringify(heroBounds));
    assert.ok(heroBounds.topDifference<1,JSON.stringify(heroBounds));
    assert.ok(heroBounds.card<340,'The ordinary daily card is compact');
    await page.screenshot({path:`${out}/${lang}-today-visible.png`,animations:'disabled'});
    await page.locator('#today-sources').click();
    assert.equal(await page.locator('#today-holiday').isVisible(),false);
    assert.match(await page.locator('#today-world').getAttribute('href'),/un.org/);
    await page.screenshot({path:`${out}/${lang}-today-expanded.png`,animations:'disabled'});
    await page.setViewportSize({width:390,height:844});
    for(const id of ids) {
      await page.goto(`${base}/${lang}/tools/${id}/`);
      if(id==='photo-resizer') await page.locator('#photo-result').waitFor({state:'visible'});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:`${out}/${lang}-${id}-390.png`,animations:'disabled',fullPage:true});
    }
    await page.setViewportSize({width:1366,height:768});
  }
  // Weekly holidays use Nepal's local date, even in a different browser time zone.
  for(const lang of ['en','ne']) {
    for(const [date,status] of [['2026-11-14T06:00:00Z','weekly'],['2026-11-22T06:00:00Z','weekly'],['2026-11-10T06:00:00Z','nationwide'],['2026-11-04T06:00:00Z','none'],['2027-04-15T06:00:00Z','unavailable']]) {
      await page.clock.setFixedTime(new Date(date)); await page.goto(`${base}/${lang}/`);
      assert.equal(await page.locator('.today-observances').getAttribute('open'),null);
      assert.equal(await page.locator('#today-holiday').isVisible(),status!=='none');
      assert.equal(await page.locator('#today-holiday').evaluate(element=>element.closest('details')),null);
      assert.equal(await page.locator('.today-holiday-line').getAttribute('data-status'),status);
      if(status==='nationwide') {
        assert.match(await page.locator('#today-holiday').textContent(),lang==='ne'?/देशव्यापी बिदा.*तिहार/:/Nationwide holiday.*Tihar/);
        assert.equal(await page.locator('#today-world').isVisible(),true);
        assert.match(await page.locator('#today-world').textContent(),lang==='ne'?/विज्ञान/:/Science/);
        assert.doesNotMatch(await page.locator('#today-holiday').textContent(),/Science/);
        for(const width of [320,390,768,1024,1366,1920]) {
          await page.setViewportSize({width,height:width<600?844:768});
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
          if(width>600) {
            assert.ok(await page.evaluate(()=>{
              const intro=document.querySelector('.hero-copy').getBoundingClientRect(),card=document.querySelector('.today-card').getBoundingClientRect();
              return Math.abs(intro.height-card.height)<1 && Math.abs(intro.top-card.top)<1;
            }),`${lang} aligned hero panels at ${width}`);
          }
          await page.screenshot({path:`${out}/${lang}-holiday-and-key-day-${width}.png`,animations:'disabled',fullPage:width<600});
        }
      }
      if(status==='none') {
        assert.equal(await page.locator('.today-highlights').isVisible(),false);
        await page.locator('#today-sources').click();
        assert.equal(await page.locator('#today-holiday-details').isVisible(),false);
      }
      if(status==='unavailable') assert.equal(await page.locator('#today-key-day').isVisible(),false);
    }
  }
  await page.setViewportSize({width:1366,height:768});
  // A missing sample does not prevent the user from selecting their own image.
  await page.route('**/examples/mountain-sample.jpg',route=>route.fulfill({status:503,body:'unavailable'}));
  await page.goto(`${base}/en/tools/photo-resizer/`);
  await page.waitForFunction(()=>document.querySelector('#photo-status').textContent.includes('Example unavailable'));
  assert.equal(await page.locator('#photo-file').isEnabled(),true);
  const canvas=createCanvas(640,480); canvas.getContext('2d').fillRect(0,0,640,480);
  const image={name:'own.png',mimeType:'image/png',buffer:canvas.toBuffer('image/png')};
  await page.locator('#photo-file').setInputFiles(image);
  await page.waitForFunction(()=>!document.querySelector('#photo-controls').disabled);
  await page.locator('#process-photo').click();
  await page.locator('#photo-result').waitFor({state:'visible'});
  await page.unroute('**/examples/mountain-sample.jpg');
  // A late example fetch must never overwrite a user's selected file.
  let finishSample, sampleStarted;
  const started=new Promise(resolve=>{sampleStarted=resolve;});
  const held=new Promise(resolve=>{finishSample=resolve;});
  await page.route('**/examples/mountain-sample.jpg',async route=>{sampleStarted();await held;await route.fulfill({status:200,contentType:'image/jpeg',body:await readFile('public/examples/mountain-sample.jpg')});});
  await page.goto(`${base}/en/tools/photo-resizer/`); await started;
  await page.locator('#photo-file').setInputFiles(image);
  await page.waitForFunction(()=>!document.querySelector('#photo-controls').disabled);
  const sampleResponse=page.waitForResponse('**/examples/mountain-sample.jpg');finishSample();await sampleResponse;
  await page.waitForFunction(()=>!document.querySelector('#photo-example').disabled);
  assert.match(await page.locator('#original-dimensions').textContent(),/640.*480/);
  assert.equal(await page.locator('#photo-sample-label').isVisible(),false);
  assert.equal(await page.locator('#photo-result').isVisible(),false);
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/report.json`,JSON.stringify({measurements,errors},null,2));
  console.log(JSON.stringify(measurements,null,2));
  assert.ok(measurements.every(m=>!m.overflow&&m.bottom<=768), 'Default working areas fit a 1366 × 768 laptop viewport');
  console.log('PASS: bilingual defaults, 10 laptop working areas, mobile overflow, Kathmandu dates, Saturday/Sunday, calendar expiry, sample failure and selection race.');
} finally {await browser.close();}
