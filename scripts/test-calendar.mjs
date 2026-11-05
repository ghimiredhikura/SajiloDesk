import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8787',out='tmp/calendar';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1366,height:900},permissions:['clipboard-read','clipboard-write'],timezoneId:'America/Los_Angeles'});
const page=await context.newPage(),errors=[],external=[],layouts=[];
page.on('pageerror',error=>errors.push(String(error)));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==new URL(base).origin)external.push(request.url());});
await page.clock.install({time:new Date('2026-11-05T06:00:00Z')});
const go=async lang=>{await page.goto(`${base}/${lang}/`);await page.locator('#calendar-grid [data-ad]').first().waitFor();await page.evaluate(()=>document.fonts.ready);};
const setMonth=async(year,month)=>{await page.locator('#calendar-year').fill(String(year));await page.locator('#calendar-month').selectOption(String(month));await page.locator('.calendar-go').click();};
const select=async day=>page.locator(`#calendar-grid [data-day="${day}"]`).click();
try{
 for(const lang of ['en','ne']){
  for(const width of [320,390,768,1024,1366,1920]){
    await page.setViewportSize({width,height:900});await go(lang);
    const measure=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,dayButtons:document.querySelectorAll('#calendar-grid [data-ad]').length}));
    layouts.push({lang,...measure});assert.ok(measure.document<=width+1,JSON.stringify(measure));assert.ok(measure.dayButtons>=29);
    if(width===390||width===1366)await page.locator('#calendar').screenshot({path:`${out}/${lang}-calendar-${width}.png`,style:'.mobile-nav{visibility:hidden}'});
  }
  await page.setViewportSize({width:1366,height:900});await go(lang);
  assert.equal(await page.locator('[data-tool-card]').count(),5);
  assert.equal(await page.locator('.today-link').getAttribute('href'),'#calendar');
  assert.equal(await page.locator('#today-nepal-key-day').isVisible(),false);
  assert.equal(await page.locator('#calendar-nepal-day').isVisible(),false);
  assert.equal(await page.locator('#calendar-world-day').isVisible(),true);
  assert.match(await page.locator('#calendar-selected-ad').textContent(),lang==='ne'?/५ नोभेम्बर २०२६/:/5 November 2026/);
  await setMonth('२०८३',3);await select(29);
  assert.match(await page.locator('#calendar-nepal-name').textContent(),lang==='ne'?/भानुभक्त/:/Bhanu Bhakta/);
  assert.equal(await page.locator('#calendar-world-day').isVisible(),false);
  assert.equal(await page.locator('#calendar-holiday').isVisible(),false);
  assert.equal(await page.locator('#calendar-grid [aria-pressed=true]').getAttribute('data-holiday-status'),'none');
  await page.locator('#calendar-copy').click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),'BS: 2083-03-29\nAD: 2026-07-13');
  await page.locator('[data-calendar=AD]').click();assert.equal(await page.locator('#calendar-month').inputValue(),'7');assert.equal(await page.locator('#calendar-year').inputValue(),'2026');
  assert.equal(await page.locator('#calendar-grid [aria-pressed=true]').getAttribute('data-day'),'13');
  await page.locator('#calendar-previous').click();assert.equal(await page.locator('#calendar-month').inputValue(),'6');
  await page.locator('#calendar-next').click();assert.equal(await page.locator('#calendar-month').inputValue(),'7');
  await setMonth(2028,2);assert.equal(await page.locator('#calendar-grid [data-day="29"]').isEnabled(),true);
  await setMonth(2027,2);assert.equal(await page.locator('#calendar-grid [data-day="29"]').count(),0);
  await setMonth(1918,4);assert.equal(await page.locator('#calendar-previous').isDisabled(),true);assert.equal(await page.locator('#calendar-grid [data-day="12"]').isDisabled(),true);
  await select(13);assert.match(await page.locator('#calendar-selected-bs').textContent(),lang==='ne'?/१ वैशाख १९७५/:/1 Baishakh 1975/);
  await setMonth(2043,4);assert.equal(await page.locator('#calendar-next').isDisabled(),true);assert.equal(await page.locator('#calendar-grid [data-day="14"]').isDisabled(),true);
  await page.locator('#calendar-year').fill('9999');await page.locator('.calendar-go').click();assert.equal(await page.locator('#calendar-error').isVisible(),true);
  await page.locator('#calendar-today').click();assert.equal(await page.locator('#calendar-error').isVisible(),false);
  await page.locator('[data-calendar=BS]').click();await setMonth(2083,4);await select(24);
  assert.equal(await page.locator('#calendar-nepal-day').isVisible(),true);assert.equal(await page.locator('#calendar-world-day').isVisible(),true);assert.equal(await page.locator('#calendar-holiday').isVisible(),true);
  assert.match(await page.locator('#calendar-nepal-name').textContent(),lang==='ne'?/भू-संरक्षण/:/Soil Conservation/);
  await page.locator('#calendar').screenshot({path:`${out}/${lang}-both-key-days.png`,style:'.mobile-nav{visibility:hidden}'});
  await setMonth(2083,1);
  const nationalDay=page.locator('#calendar-grid [data-day="18"]');
  assert.equal(await nationalDay.getAttribute('data-holiday-status'),'nationwide');
  assert.equal(await nationalDay.locator('strong').evaluate(element=>getComputedStyle(element).color),'rgb(154, 48, 36)');
  await nationalDay.click();
  assert.equal(await nationalDay.evaluate(element=>getComputedStyle(element).backgroundColor),'rgb(180, 58, 39)');
  await page.locator('#calendar').screenshot({path:`${out}/${lang}-red-holidays.png`,style:'.mobile-nav{visibility:hidden}'});
  await setMonth(2083,5);await select(29);
  assert.equal(await page.locator('#calendar-grid [aria-pressed=true]').getAttribute('data-holiday-status'),'scoped');
  assert.match(await page.locator('#calendar-holiday').textContent(),lang==='ne'?/महिला कर्मचारी/:/women employees/);
  // Same date in the live Today card: Nepal, world and holiday remain separate.
  await page.clock.setFixedTime(new Date('2026-08-09T06:00:00Z'));await go(lang);
  assert.equal(await page.locator('.today-observances').getAttribute('open'),null);
  for(const selector of ['#today-nepal-day','#today-world','#today-holiday']){assert.equal(await page.locator(selector).isVisible(),true);assert.equal(await page.locator(selector).evaluate(element=>element.closest('details')),null);}
  assert.match(await page.locator('#today-nepal-day').textContent(),lang==='ne'?/भू-संरक्षण/:/Soil Conservation/);
  await page.screenshot({path:`${out}/${lang}-today-nepal-world.png`});
  await page.clock.setFixedTime(new Date('2026-07-13T06:00:00Z'));await go(lang);
  assert.equal(await page.locator('#today-nepal-key-day').isVisible(),true);assert.equal(await page.locator('#today-key-day').isVisible(),false);assert.equal(await page.locator('#today-holiday').isVisible(),false);
  await page.locator('#today-sources').click();assert.match(await page.locator('#today-nepal-day-sources').textContent(),lang==='ne'?/भानुभक्त/:/Bhanu Bhakta/);
  await page.clock.setFixedTime(new Date('2026-11-05T06:00:00Z'));
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await writeFile(`${out}/report.json`,JSON.stringify({layouts,errors,external,browser:browser.version()},null,2));
 console.log(`PASS: ${layouts.length} calendar layouts, BS/AD switches, date selection, clipboard, month/year navigation, leap years, range limits, bilingual Nepal/world days and independent holiday notices.`);
}finally{await browser.close();}
