import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8791';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname)&&process.env.LIVE_READ_ONLY!=='true')throw new Error('Use a local preview, or explicitly enable read-only live checks.');
await mkdir('tmp/korea-mobile',{recursive:true});
const {defaultBrowserType,...phone}=devices['iPhone 14'];
let flows=0;
for(const engine of ['webkit','chromium']){
 const browser=await (engine==='webkit'?webkit.launch():chromium.launch({channel:'chrome'}));
 try{
  for(const lang of ['en','ne']){
   const context=await browser.newContext(phone),page=await context.newPage(),errors=[];
   page.setDefaultTimeout(10000);
   page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>assert.ok(['GET','HEAD'].includes(r.method()),'Read-only browser checks'));
   const go=async()=>{assert.ok([200,304].includes((await page.goto(`${base}/${lang}/life-abroad/`)).status()));await page.evaluate(()=>document.fonts.ready);};
   const option=(id,code)=>page.locator(`#${id}-results [role=option]`).filter({hasText:new RegExp(`^${code} ·`)});
   const search=async(id,query)=>{await page.locator(`#${id}-search`).tap();await page.fill(`#${id}-search`,query);};
   const select=async(id,code)=>{await search(id,code);const before=page.url();await option(id,code).tap();assert.equal(page.url(),before,'Selecting an option must not submit the form');assert.equal(await page.inputValue(`#${id}`),code);};
   const assertFrame=async()=>{
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await page.evaluate(()=>visualViewport.scale),1);
    assert.ok(!/maximum-scale|user-scalable\s*=\s*no/.test(await page.locator('meta[name=viewport]').getAttribute('content')),'Pinch zoom remains available');
   };
   await go();assert.equal(await page.locator('#journey-task').isDisabled(),true);
   for(const id of ['journey-visa-search','journey-task'])assert.ok(await page.locator(`#${id}`).evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16),`${engine} ${lang}: 16px focused control`);
   await select('journey-visa','E-9');assert.equal(await page.locator('#journey-task').isDisabled(),false);await assertFrame();
   await page.selectOption('#journey-task','change');await select('journey-target','E-7-4');assert.equal(await page.locator('#journey-open').isDisabled(),false);
   await page.locator('#journey-open').tap();await page.waitForURL('**/change-to-e-7-4/?visa=E-9');
   await page.locator('[data-journey].compact summary').tap();assert.equal(await page.inputValue('#journey-target'),'E-7-4');
   await select('journey-visa','D-2');assert.equal(await page.inputValue('#journey-target'),'');assert.equal(await page.locator('#journey-open').isDisabled(),true);
   await select('journey-target','D-10');assert.equal(await page.locator('#journey-open').isDisabled(),false);
   // Model the iOS ordering that width-only Chrome tests missed: focus leaves
   // the input after pointerdown, before pointerup/click completes on the option.
   await go();await search('journey-visa','D2');
   await page.locator('#journey-visa-results').evaluate(list=>list.addEventListener('pointerdown',()=>document.querySelector('#journey-visa-search').blur(),{once:true}));
   await option('journey-visa','D-2-3').tap();assert.equal(await page.inputValue('#journey-visa'),'D-2-3','Blur during a real tap must commit the visa');
   assert.equal(await page.locator('#journey-task').isDisabled(),false);assert.equal(await page.locator('#journey-visa-results').isVisible(),false);
   await page.selectOption('#journey-task','change');await search('journey-target','D10');
   await page.locator('#journey-target-results').evaluate(list=>list.addEventListener('pointerdown',()=>document.querySelector('#journey-target-search').blur(),{once:true}));
   await option('journey-target','D-10').tap();assert.equal(await page.inputValue('#journey-target'),'D-10');assert.equal(await page.locator('#journey-open').isDisabled(),false);
   // Scrolling/dragging must not accidentally select the first touched row.
   await go();await page.locator('#journey-visa-search').tap();
   const list=page.locator('#journey-visa-results'),first=list.locator('[role=option]').first();
   await first.dispatchEvent('pointerdown',{pointerId:41,pointerType:'touch',isPrimary:true,button:0,clientX:80,clientY:400});
   await page.locator('#journey-visa-search').evaluate(e=>e.blur());
   await first.dispatchEvent('pointermove',{pointerId:41,pointerType:'touch',clientX:80,clientY:350});
   await first.dispatchEvent('pointerup',{pointerId:41,pointerType:'touch',clientX:80,clientY:350});
   assert.equal(await page.inputValue('#journey-visa'),'');assert.equal(await list.isVisible(),true);
   await first.dispatchEvent('pointerdown',{pointerId:42,pointerType:'touch',isPrimary:true,button:0,clientX:80,clientY:400});
   await first.dispatchEvent('pointercancel',{pointerId:42,pointerType:'touch'});assert.equal(await page.inputValue('#journey-visa'),'');
   await list.evaluate(e=>{e.scrollTop=600;});await page.waitForTimeout(50);assert.equal(await page.inputValue('#journey-visa'),'');
   await select('journey-visa','F-5');assert.equal(await page.locator('#journey-task').isDisabled(),false);
   const choices=await page.locator('#journey-task option').evaluateAll(options=>options.map(o=>o.value));assert.ok(!choices.includes('extension')&&choices.includes('card'));
   await page.locator('#journey-visa-search').tap();await page.locator('.site-header').tap({position:{x:200,y:10}});assert.equal(await list.isVisible(),false);assert.ok((await page.inputValue('#journey-visa-search')).startsWith('F-5'));
   await page.locator('[data-visa-search] button').first().tap();assert.equal(await list.isVisible(),true);
   await page.locator('[data-visa-search] button').first().tap();assert.equal(await list.isVisible(),false);
   await search('journey-visa','E9');await page.locator('#journey-visa-search').press('Enter');assert.equal(await page.inputValue('#journey-visa'),'E-9');assert.equal(await list.isVisible(),false);
   await search('journey-visa','D2');await page.locator('#journey-visa-search').press('ArrowDown');await page.locator('#journey-visa-search').press('Enter');assert.equal(await page.inputValue('#journey-visa'),'D-2');assert.equal(await list.isVisible(),false);
   // A short visual viewport models keyboard/landscape space, not a physical
   // iOS keyboard. The list must stay within the available screen and scroll.
   await go();await page.setViewportSize({width:390,height:460});await search('journey-visa','E9');
   const bounds=await list.boundingBox(),viewport=await page.evaluate(()=>({top:visualViewport.offsetTop,bottom:visualViewport.offsetTop+visualViewport.height}));
   assert.ok(bounds&&bounds.y>=viewport.top-1&&bounds.y+bounds.height<=viewport.bottom+1,`${engine} ${lang}: reduced viewport list ${JSON.stringify(bounds)}`);
   await page.screenshot({path:`tmp/korea-mobile/${engine}-${lang}-short.png`,fullPage:false});
   await option('journey-visa','E-9').tap();assert.equal(await page.locator('#journey-task').isDisabled(),false);await assertFrame();
   await page.setViewportSize({width:844,height:390});await go();await select('journey-visa','D-2');await page.selectOption('#journey-task','change');await select('journey-target','D-10');await assertFrame();
   assert.ok(await page.locator('#journey-visa-search').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16),'Landscape keeps the zoom guard');
   await page.setViewportSize(phone.viewport);await go();await select('journey-visa','D-4-1');await page.selectOption('#journey-task','extension');await assertFrame();
   await page.screenshot({path:`tmp/korea-mobile/${engine}-${lang}-iphone14.png`,fullPage:true});
   assert.deepEqual(errors,[]);flows++;console.log(`PASS ${engine} ${lang}: iPhone 14 portrait/landscape, touch and blur sequence`);await context.close();
  }
 }finally{await browser.close();}
}
console.log(`PASS: ${flows} iPhone 14 touch flows across WebKit/Chromium and EN/NE; current/target taps, blur-before-pointerup, list scroll/cancel, smart resets, compact guide selector, dropdown toggle, short viewport and 16px zoom guard. Physical iOS keyboard/OS zoom are separate checks.`);
