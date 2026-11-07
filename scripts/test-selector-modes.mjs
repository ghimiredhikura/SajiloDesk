import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8791';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname)&&process.env.LIVE_READ_ONLY!=='true')throw new Error('Use local QA or explicitly enable read-only live checks.');
await mkdir('tmp/selector-modes',{recursive:true});
for(const engine of ['webkit','chromium']){
 const browser=await(engine==='webkit'?webkit.launch():chromium.launch({channel:'chrome'}));
 try{for(const lang of ['en','ne'])for(const touch of [true,false]){
  const {defaultBrowserType,...phone}=devices['iPhone 14'];
  const context=await browser.newContext(touch?phone:{viewport:{width:1366,height:900}}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>assert.ok(['GET','HEAD'].includes(r.method())));
  const action=touch?'tap':'click';
  const half=async(id,right)=>{const control=page.locator('.visa-search-input').filter({has:page.locator(`#${id}-search`)}),bounds=await control.boundingBox();await control[action]({position:{x:bounds.width*(right?.75:.25),y:bounds.height/2}});};
  const editing=async id=>assert.equal(await page.locator(`#${id}-search`).evaluate(e=>e===document.activeElement),true,`${engine} ${lang}: left side focuses typing`);
  const browsing=async id=>{assert.equal(await page.locator(`#${id}-results`).isVisible(),true);assert.equal(await page.locator(`#${id}-search`).evaluate(e=>e===document.activeElement),false);assert.equal(await page.locator(`#${id}-results`).evaluate(e=>e===document.activeElement),true,'Right side focuses the non-editable list');};
  const pick=async(id,value)=>{const before=page.url();await page.locator(`#${id}-results [data-value="${value}"]`)[action]();assert.equal(page.url(),before,'Choosing must not submit');assert.equal(await page.inputValue(`#${id}`),value);};
  await page.goto(`${base}/${lang}/life-abroad/`);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#journey-task-search').isDisabled(),true);
  await half('journey-visa',false);await editing('journey-visa');await page.fill('#journey-visa-search','D2');assert.equal(await page.locator('#journey-visa-results [role=option]').count(),9);
  await half('journey-visa',true);await browsing('journey-visa');await pick('journey-visa','E-9');assert.equal(await page.locator('#journey-task-search').isDisabled(),false);
  await half('journey-task',false);await editing('journey-task');await page.fill('#journey-task-search','extension');assert.equal(await page.locator('#journey-task-results [data-value=extension]').count(),1);
  await half('journey-task',true);await browsing('journey-task');
  const appearance=await page.locator('#journey-task-results').evaluate(e=>{const s=getComputedStyle(e);return[s.backgroundColor,s.borderRadius,s.fontSize];});
  await pick('journey-task','change');await half('journey-target',false);await editing('journey-target');await page.fill('#journey-target-search','E74');
  await half('journey-target',true);await browsing('journey-target');assert.deepEqual(await page.locator('#journey-target-results').evaluate(e=>{const s=getComputedStyle(e);return[s.backgroundColor,s.borderRadius,s.fontSize];}),appearance);
  await pick('journey-target','E-7-4');assert.equal(await page.locator('#journey-open').isDisabled(),false);
  await half('journey-target',true);await browsing('journey-target');await page.locator('#journey-target-results').press('Escape');assert.equal(await page.locator('#journey-target-results').isVisible(),false);assert.equal(await page.locator('#journey-target-search').evaluate(e=>e===document.activeElement),false);
  // Both target and task menus retain their relevance/selection-clearing rules.
  await half('journey-visa',true);await browsing('journey-visa');await pick('journey-visa','F-5');assert.equal(await page.inputValue('#journey-task'),'');assert.equal(await page.inputValue('#journey-task-search'),'');assert.equal(await page.locator('#journey-target-field').isVisible(),false);
  await half('journey-task',true);await browsing('journey-task');assert.equal(await page.locator('#journey-task-results [data-value=extension]').count(),0);await pick('journey-task','card');
  await half('journey-task',true);await page.screenshot({path:`tmp/selector-modes/${engine}-${lang}-${touch?'phone':'desktop'}-korea.png`,fullPage:false});
  await page.locator('#journey-task-results').press('Escape');await page.locator('.visa-search-input').filter({has:page.locator('#journey-task-search')}).locator('button').press('ArrowDown');await page.locator('#journey-task-results').press('Enter');assert.ok(await page.inputValue('#journey-task'));
  await page.locator('#journey-open')[action]();await page.waitForURL('**/residence-card/?visa=F-5');await page.locator('[data-journey].compact summary')[action]();await half('journey-task',true);await browsing('journey-task');
  for(const width of touch?[320,390,430,844]:[1366]){
   await page.setViewportSize({width,height:touch?844:900});await page.goto(`${base}/${lang}/`);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('[data-tool-card]').first().getAttribute('data-tool-id'),'pdf-tools');assert.equal(await page.locator('[data-category-filter]').count(),6);
   const layout=await page.locator('.category-filters').evaluate(root=>({scroll:root.scrollWidth,width:root.clientWidth,rows:new Set([...root.children].map(child=>Math.round(child.getBoundingClientRect().top))).size,visible:[...root.children].every(child=>{const box=child.getBoundingClientRect();return box.left>=0&&box.right<=innerWidth+1;})}));
   assert.ok(layout.scroll<=layout.width+1&&layout.visible,`${lang} ${width}: every filter visible`);if(width<=600)assert.ok(layout.rows>=2,'Mobile filters wrap');
   await page.locator('[data-category-filter=pdf]')[action]();assert.equal(await page.locator('[data-tool-card]:visible').count(),1);assert.equal(await page.locator('[data-tool-card]:visible').getAttribute('data-tool-id'),'pdf-tools');
   await page.locator('[data-category-filter=files]')[action]();assert.equal(await page.locator('[data-tool-card]:visible').count(),2);await page.locator('[data-category-filter=all]')[action]();assert.equal(await page.locator('[data-tool-card]:visible').count(),6);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===390||width===1366)await page.screenshot({path:`tmp/selector-modes/${engine}-${lang}-${width}-home.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${engine} ${lang} ${touch?'touch':'desktop'}: three matching selectors, left typing/right list focus, smart filtering, compact guide, PDF-first cards/filter and wrapping categories.`);await context.close();
 }}finally{await browser.close();}
}
