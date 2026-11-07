import assert from 'node:assert/strict';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { chromium,webkit,devices } from 'playwright';
import { PDFDocument,StandardFonts,degrees,PDFName,PDFRawStream,PDFArray } from 'pdf-lib';
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
for(let n=0;n<2;n++){const page=scanned.addPage([550,775]);page.drawImage(jpg,{x:0,y:0,width:550,height:775});page.drawText('Keep this tiny vector text selectable',{x:30,y:725,size:7});page.drawLine({start:{x:30,y:710},end:{x:500,y:710},thickness:.3});}
const scan=Buffer.from(await scanned.save());
const quality=await PDFDocument.create(),qualityPage=quality.addPage([595,842]);
qualityPage.drawText('Fine text and vector detail',{x:35,y:790,size:24});
for(let line=0;line<28;line++)qualityPage.drawText(`Line ${line+1}: 0123456789 AaBbCcDd - small clear document text`,{x:35,y:740-line*16,size:line<10?6:line<20?8:10});
for(let line=0;line<20;line++)qualityPage.drawLine({start:{x:35+line*25,y:70},end:{x:35+line*25,y:200},thickness:.25});
const qualityBytes=Buffer.from(await quality.save());
const long=await PDFDocument.create();for(let n=0;n<30;n++){const page=long.addPage([400,600]);page.drawText(`Lazy page ${n+1}`,{x:30,y:500,size:25});}const longBytes=Buffer.from(await long.save());
const contentStreams=doc=>doc.getPages().map(page=>{const value=page.node.get(PDFName.of('Contents'));const entries=value instanceof PDFArray?value.asArray():[value];return entries.map(ref=>Buffer.from(doc.context.lookup(ref).getContents()).toString('hex'));});
const jpegStreams=doc=>doc.context.enumerateIndirectObjects().filter(([,value])=>value instanceof PDFRawStream&&value.dict.get(PDFName.of('Filter'))===PDFName.of('DCTDecode')).map(([,stream])=>stream);
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
const painted=async(number=1)=>page.locator(`#pdf-preview [data-pdf-page="${number}"][data-rendered=true] canvas`).waitFor();
const scrollPage=async(number)=>{await page.locator('#pdf-preview').evaluate((root,n)=>{const page=root.querySelector(`[data-pdf-page="${n}"]`);root.scrollTop+=page.getBoundingClientRect().top-root.getBoundingClientRect().top;},number);await painted(number);};
try{
  for(const lang of ['en','ne'])for(const width of [320,390,768,1366]){
    await page.setViewportSize({width,height:width<600?844:900});
    assert.equal((await page.goto(`${base}/${lang}/tools/pdf-tools/`)).status(),200);
    await page.locator('#pdf-result').waitFor({state:'visible'});await idle();await page.evaluate(()=>document.fonts.ready);
    assert.equal((await PDFDocument.load(await result())).getPageCount(),2);
    await painted();assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),2);
    await scrollPage(2);assert.ok(await page.locator('#pdf-preview').evaluate(e=>e.scrollTop>0));
    for(const task of ['merge','compress','image','extract']){
      await page.click(`[data-pdf-task=${task}]`);await idle();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} ${task}: overflow`);
    }
    await runTask();await painted();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${output}/${lang}-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/en/tools/pdf-tools/`);await page.locator('#pdf-result').waitFor({state:'visible'});await idle();
  await choose([['first.pdf',first]]);await idle();assert.equal(await page.locator('#pdf-mode-original').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#pdf-mode-result').isDisabled(),true);assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),2);await scrollPage(2);
  await page.fill('#pdf-pages','२, १');await runTask();assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),2);await scrollPage(2);
  let doc=await PDFDocument.load(await result());assert.deepEqual(doc.getPages().map(p=>p.getWidth()),[320,200]);assert.equal(doc.getPage(1).getRotation().angle,90);
  const downloadPromise=page.waitForEvent('download');await page.click('#pdf-download');const download=await downloadPromise;assert.ok(download.suggestedFilename().endsWith('.pdf'));assert.equal((await PDFDocument.load(await readFile(await download.path()))).getPageCount(),2);
  await page.fill('#pdf-pages','99');assert.equal(await page.locator('#pdf-result').isVisible(),false);await page.click('#pdf-process');await idle();assert.equal(await page.locator('#pdf-error').isVisible(),true);
  await page.click('[data-pdf-task=merge]');await choose([['second.pdf',second]]);await idle();
  assert.equal(await page.locator('#pdf-files li').count(),2);await page.locator('#pdf-files li').first().getByRole('button',{name:'Move down: first.pdf',exact:true}).click();await runTask();
  doc=await PDFDocument.load(await result());assert.deepEqual(doc.getPages().map(p=>p.getWidth()),[222,200,320]);
  assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),3);await scrollPage(3);await page.click('#pdf-mode-original');await page.selectOption('#pdf-preview-file','1');await painted();assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),2);await page.click('#pdf-mode-result');await painted();assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),3);
  await page.click('[data-pdf-task=image]');await choose([['first.pdf',first]]);await idle();
  await page.fill('#pdf-image-page','2');await page.selectOption('#pdf-dpi','72');await page.selectOption('#pdf-image-format','image/png');await runTask();
  let image=await loadImage(await result());assert.deepEqual([image.width,image.height],[320,480]);
  await page.fill('#pdf-image-page','1');await page.selectOption('#pdf-image-format','image/jpeg');await runTask();image=await loadImage(await result());assert.deepEqual([image.width,image.height],[300,200]);
  await page.fill('#pdf-image-page','1,2');await page.click('#pdf-process');await idle();assert.equal(await page.locator('#pdf-error').isVisible(),true);
  await choose([['fine-text.pdf',qualityBytes]]);await idle();await page.fill('#pdf-image-page','1');await page.selectOption('#pdf-dpi','300');await page.selectOption('#pdf-image-format','image/png');await runTask();
  const clearPng=await result();image=await loadImage(clearPng);assert.deepEqual([image.width,image.height],[Math.ceil(595*300/72),Math.ceil(842*300/72)]);await writeFile(`${output}/fine-text-300dpi.png`,clearPng);assert.match(await page.locator('#pdf-output-pages').textContent(),/300 DPI/);
  await page.click('[data-pdf-task=compress]');await choose([['scan.pdf',scan]]);await idle();await runTask();
  let compressed=await result();assert.ok(compressed.length<scan.length);doc=await PDFDocument.load(compressed);assert.equal(doc.getPageCount(),2);assert.deepEqual(doc.getPage(0).getSize(),{width:550,height:775});
  const sourceDoc=await PDFDocument.load(scan);assert.deepEqual(contentStreams(doc),contentStreams(sourceDoc),'Text/vector operators must remain byte-for-byte intact');
  assert.ok(jpegStreams(doc)[0].getContentsSize()<jpegStreams(sourceDoc)[0].getContentsSize());assert.equal(jpegStreams(doc)[0].dict.get(PDFName.of('Width')).asNumber(),1100);assert.match(await page.locator('#pdf-summary').textContent(),/Text kept/);
  await page.selectOption('#pdf-compression','preserve');await runTask();assert.ok((await result()).length<=scan.length);
  doc=await PDFDocument.load(await result());assert.deepEqual(Buffer.from(jpegStreams(doc)[0].getContents()),Buffer.from(jpegStreams(sourceDoc)[0].getContents()),'Lossless mode keeps JPEG bytes unchanged');
  await page.click('#pdf-example');await idle();await runTask();assert.match(await page.locator('#pdf-summary').textContent(),/Original kept/);
  await page.click('[data-pdf-task=extract]');
  await choose([['bad.pdf',Buffer.from('not a PDF')]]);await idle();assert.match(await page.locator('#pdf-error').textContent(),/could not be opened/);
  await choose([['encrypted.pdf',encryptedBytes]]);await idle();assert.match(await page.locator('#pdf-error').textContent(),/Password-protected/);
  await choose([['signed.pdf',signedBytes]]);await idle();assert.match(await page.locator('#pdf-error').textContent(),/signed/);
  await choose([['form.pdf',formBytes]]);await idle();await page.click('#pdf-process');await idle();assert.match(await page.locator('#pdf-error').textContent(),/interactive forms/);
  await choose([['thirty-pages.pdf',longBytes]]);await idle();assert.equal(await page.locator('#pdf-preview [data-pdf-page]').count(),30);await scrollPage(30);assert.ok(await page.locator('#pdf-preview canvas').count()<=5,'Canvas memory is bounded');assert.match(await page.locator('#pdf-preview-counter').textContent(),/30/);await page.selectOption('#pdf-preview-zoom','1.5');await painted(30);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.click('[data-pdf-task=compress]');await page.selectOption('#pdf-compression','scanned');await choose([['scan.pdf',scan]]);await idle();
  await page.click('#pdf-process');await page.click('#pdf-cancel');await page.waitForTimeout(800);assert.equal(await page.locator('#pdf-result').isVisible(),false);assert.match(await page.locator('#pdf-status').textContent(),/Cancelled/);
  await page.click('#pdf-clear');assert.equal(await page.locator('#pdf-files li').count(),0);assert.equal(await page.locator('#pdf-process').isDisabled(),true);
  // PDF entry participates in existing discovery and saved-tools flows.
  await page.goto(`${base}/en/`);await page.fill('#tool-search','pdf');assert.equal(await page.locator('[data-tool-card]:visible').count(),1);await page.locator('[data-favorite=pdf-tools]').click();
  await page.goto(`${base}/en/saved/`);assert.equal(await page.locator('[data-tool-id=pdf-tools]').isVisible(),true);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(uploads,[]);
  console.log('PASS PDF: all-page original/result scrolling, merge file previews, bounded lazy canvases/zoom, 300 DPI PNG, JPEG compression preserves exact text/vector streams, lossless image bytes, downloads/page order/rotation/errors/cancel, 8 bilingual layouts and no external requests/uploads.');
}finally{await browser.close();}

const safari=await webkit.launch();
try{for(const lang of ['en','ne']){
 const {defaultBrowserType,...phone}=devices['iPhone 14'],context=await safari.newContext(phone),mobile=await context.newPage(),failures=[];mobile.on('pageerror',e=>failures.push(String(e)));
 await mobile.goto(`${base}/${lang}/tools/pdf-tools/`);await mobile.locator('#pdf-result').waitFor({state:'visible'});await mobile.waitForFunction(()=>document.querySelector('#pdf-form').getAttribute('aria-busy')==='false');
 await mobile.locator('#pdf-mode-original').tap();await mobile.locator('#pdf-preview [data-pdf-page="3"]').waitFor();
 await mobile.locator('#pdf-preview').evaluate(root=>root.scrollTop=root.scrollHeight);await mobile.locator('#pdf-preview [data-pdf-page="3"][data-rendered=true] canvas').waitFor();
 await mobile.locator('#pdf-mode-result').tap();await mobile.locator('#pdf-preview [data-pdf-page="2"]').waitFor();assert.equal(await mobile.locator('#pdf-preview [data-pdf-page]').count(),2);
 assert.ok(await mobile.locator('#pdf-preview [data-pdf-page="1"] canvas').evaluate(e=>e.width>=e.clientWidth*2),'HiDPI preview');
 assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.screenshot({path:`${output}/webkit-${lang}-iphone14.png`,fullPage:true});
 await mobile.setViewportSize({width:844,height:390});assert.ok(await mobile.locator('#pdf-preview-zoom').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16));assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(failures,[]);await context.close();
}console.log('PASS PDF WebKit: iPhone 14 touch, both languages, source/result scrolling and HiDPI canvases.');}finally{await safari.close();}
