import assert from 'node:assert/strict';
import { mkdir,readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { PDFDocument,StandardFonts,degrees,PDFName } from 'pdf-lib';
import { createCanvas,loadImage } from '@napi-rs/canvas';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8791';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Use local QA only.');
const output='tmp/pdf-qa';await mkdir(output,{recursive:true});
async function fixture(sizes){
  const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
  for(const [index,size] of sizes.entries()){
    const page=doc.addPage(size);page.drawText(`Page ${index+1}`,{x:20,y:40,size:20,font});
    if(index===0)page.setRotation(degrees(90));
  }return Buffer.from(await doc.save());
}
const first=await fixture([[200,300],[320,480]]),second=await fixture([[222,333]]);
const canvas=createCanvas(1100,1550),ctx=canvas.getContext('2d'),pixels=ctx.createImageData(1100,1550);
let seed=17;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;pixels.data[i]=seed&255;pixels.data[i+1]=(seed>>>8)&255;pixels.data[i+2]=(seed>>>16)&255;pixels.data[i+3]=255;}
ctx.putImageData(pixels,0,0);ctx.fillStyle='white';ctx.fillRect(30,30,1000,110);ctx.fillStyle='black';ctx.font='46px sans-serif';ctx.fillText('SajiloDesk scanned example',50,100);
const scanned=await PDFDocument.create(),jpg=await scanned.embedJpg(canvas.toBuffer('image/jpeg',98));
for(let n=0;n<2;n++)scanned.addPage([550,775]).drawImage(jpg,{x:0,y:0,width:550,height:775});
const scan=Buffer.from(await scanned.save());
const form=await PDFDocument.create();form.addPage();form.getForm().createTextField('name').setText('Example');const formBytes=Buffer.from(await form.save());
const signed=await PDFDocument.create();signed.addPage();
const field=signed.context.obj({FT:'Sig',T:signed.context.obj('Signature')});
signed.catalog.set(PDFName.of('AcroForm'),signed.context.obj({Fields:[signed.context.register(field)]}));
const signedBytes=Buffer.from(await signed.save());
const encrypted=await PDFDocument.load(first);encrypted.context.trailerInfo.Encrypt=encrypted.context.register(encrypted.context.obj({Filter:'Standard',V:1,R:2,Length:40}));const encryptedBytes=Buffer.from(await encrypted.save());
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext(),page=await context.newPage();const errors=[],external=[],uploads=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());if(r.method()!=='GET')uploads.push(`${r.method()} ${r.url()}`);});
const choose=async(files)=>page.locator('#pdf-file').setInputFiles(files.map(([name,buffer])=>({name,mimeType:'application/pdf',buffer})));
const idle=async()=>page.waitForFunction(()=>document.querySelector('#pdf-form').getAttribute('aria-busy')==='false');
const runTask=async()=>{await page.click('#pdf-process');await idle();assert.equal(await page.locator('#pdf-error').isVisible(),false,await page.locator('#pdf-error').textContent());assert.equal(await page.locator('#pdf-result').isVisible(),true);};
const result=async()=>{const waiting=page.waitForEvent('download');await page.click('#pdf-download');const download=await waiting;return readFile(await download.path());};
try{
  for(const lang of ['en','ne'])for(const width of [320,390,768,1366]){
    await page.setViewportSize({width,height:width<600?844:900});
    assert.equal((await page.goto(`${base}/${lang}/tools/pdf-tools/`)).status(),200);
    await page.locator('#pdf-result').waitFor({state:'visible'});await idle();await page.evaluate(()=>document.fonts.ready);
    assert.equal((await PDFDocument.load(await result())).getPageCount(),2);
    assert.ok(await page.locator('#pdf-preview').evaluate(e=>e.naturalWidth>0));
    for(const task of ['merge','compress','image','extract']){
      await page.click(`[data-pdf-task=${task}]`);await idle();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} ${task}: overflow`);
    }
    await runTask();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${output}/${lang}-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/en/tools/pdf-tools/`);await page.locator('#pdf-result').waitFor({state:'visible'});await idle();
  await choose([['first.pdf',first]]);await idle();await page.fill('#pdf-pages','२, १');await runTask();
  let doc=await PDFDocument.load(await result());assert.deepEqual(doc.getPages().map(p=>p.getWidth()),[320,200]);assert.equal(doc.getPage(1).getRotation().angle,90);
  const downloadPromise=page.waitForEvent('download');await page.click('#pdf-download');const download=await downloadPromise;assert.ok(download.suggestedFilename().endsWith('.pdf'));assert.equal((await PDFDocument.load(await readFile(await download.path()))).getPageCount(),2);
  await page.fill('#pdf-pages','99');assert.equal(await page.locator('#pdf-result').isVisible(),false);await page.click('#pdf-process');await idle();assert.equal(await page.locator('#pdf-error').isVisible(),true);
  await page.click('[data-pdf-task=merge]');await choose([['second.pdf',second]]);await idle();
  assert.equal(await page.locator('#pdf-files li').count(),2);await page.locator('#pdf-files li').first().getByRole('button',{name:'Move down: first.pdf',exact:true}).click();await runTask();
  doc=await PDFDocument.load(await result());assert.deepEqual(doc.getPages().map(p=>p.getWidth()),[222,200,320]);
  await page.click('[data-pdf-task=image]');await choose([['first.pdf',first]]);await idle();
  await page.fill('#pdf-image-page','2');await page.selectOption('#pdf-dpi','72');await page.selectOption('#pdf-image-format','image/png');await runTask();
  let image=await loadImage(await result());assert.deepEqual([image.width,image.height],[320,480]);
  await page.fill('#pdf-image-page','1');await page.selectOption('#pdf-image-format','image/jpeg');await runTask();image=await loadImage(await result());assert.deepEqual([image.width,image.height],[300,200]);
  await page.fill('#pdf-image-page','1,2');await page.click('#pdf-process');await idle();assert.equal(await page.locator('#pdf-error').isVisible(),true);
  await page.click('[data-pdf-task=compress]');await choose([['scan.pdf',scan]]);await idle();await runTask();
  let compressed=await result();assert.ok(compressed.length<scan.length);doc=await PDFDocument.load(compressed);assert.equal(doc.getPageCount(),2);assert.deepEqual(doc.getPage(0).getSize(),{width:550,height:775});
  await page.selectOption('#pdf-compression','preserve');await runTask();assert.ok((await result()).length<=scan.length);
  await page.click('#pdf-example');await idle();await runTask();assert.match(await page.locator('#pdf-summary').textContent(),/Original kept/);
  await page.click('[data-pdf-task=extract]');
  await choose([['bad.pdf',Buffer.from('not a PDF')]]);await idle();assert.match(await page.locator('#pdf-error').textContent(),/could not be opened/);
  await choose([['encrypted.pdf',encryptedBytes]]);await idle();assert.match(await page.locator('#pdf-error').textContent(),/Password-protected/);
  await choose([['signed.pdf',signedBytes]]);await idle();assert.match(await page.locator('#pdf-error').textContent(),/signed/);
  await choose([['form.pdf',formBytes]]);await idle();await page.click('#pdf-process');await idle();assert.match(await page.locator('#pdf-error').textContent(),/interactive forms/);
  await page.click('[data-pdf-task=compress]');await page.selectOption('#pdf-compression','balanced');await choose([['scan.pdf',scan]]);await idle();
  await page.click('#pdf-process');await page.click('#pdf-cancel');await page.waitForTimeout(800);assert.equal(await page.locator('#pdf-result').isVisible(),false);assert.match(await page.locator('#pdf-status').textContent(),/Cancelled/);
  await page.click('#pdf-clear');assert.equal(await page.locator('#pdf-files li').count(),0);assert.equal(await page.locator('#pdf-process').isDisabled(),true);
  // PDF entry participates in existing discovery and saved-tools flows.
  await page.goto(`${base}/en/`);await page.fill('#tool-search','pdf');assert.equal(await page.locator('[data-tool-card]:visible').count(),1);await page.locator('[data-favorite=pdf-tools]').click();
  await page.goto(`${base}/en/saved/`);assert.equal(await page.locator('[data-tool-id=pdf-tools]').isVisible(),true);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(uploads,[]);
  console.log('PASS PDF: four tasks, actual downloads/page order/rotation, JPG+PNG pixels, compression+fallback, forms/encryption/signatures/errors/cancel, 8 bilingual responsive layouts, discovery/favourites and no external requests/uploads.');
}finally{await browser.close();}
