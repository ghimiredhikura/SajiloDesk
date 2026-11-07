// DOM event integration tests, not a substitute for a real browser/mobile review.
// External resources/scripts are not fetched. Production HTML + source event handlers run in jsdom.
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCanvas,loadImage } from '@napi-rs/canvas';
const [lang,id]=process.argv.slice(2);
const relative=id==='home'?`${lang}/index.html`:id==='saved'?`${lang}/saved/index.html`:`${lang}/tools/${id}/index.html`;
const prefix=`/${(process.env.PUBLIC_BASE_PATH||'/').replace(/^\/+|\/+$/g,'')}`.replace(/\/$/,'');
const dom=new JSDOM(await readFile(`dist/${relative}`,'utf8'),{url:`https://sajilo.test${prefix}/${relative.replace(/index.html$/,'')}`,runScripts:'outside-only'});
const {window}=dom;const {document}=window;const copied=[];const downloads=[];
Object.assign(globalThis,{window,document,localStorage:window.localStorage,location:window.location,Option:window.Option});
Object.defineProperty(globalThis,'navigator',{value:{clipboard:{writeText:async text=>{copied.push(text);}}},configurable:true});
window.HTMLAnchorElement.prototype.click=function(){if(this.download)downloads.push({href:this.href,name:this.download});};
const get=id=>{const node=document.getElementById(id);assert.ok(node,`missing #${id}`);return node;};
const click=id=>get(id).click();
const change=(id,value)=>{get(id).value=value;get(id).dispatchEvent(new window.Event('change',{bubbles:true}));};
const input=(id,value)=>{get(id).value=value;get(id).dispatchEvent(new window.Event('input',{bubbles:true}));};
const submit=id=>get(id).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
const until=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,10));}throw new Error('Async form handler did not complete.');};
if(id==='home'||id==='saved'){
 if(id==='saved')localStorage.setItem('sajilo-favorites',JSON.stringify(['date-converter','photo-resizer']));
 await import('../src/scripts/shared.ts');
 const visible=()=>[...document.querySelectorAll('[data-tool-card]')].filter(c=>!c.hidden);
 if(id==='home'){
  assert.equal(visible().length,6);input('tool-search','jagga');assert.equal(visible().length,1);assert.equal(visible()[0].dataset.toolId,'land-converter');
  input('tool-search','प्रीति');assert.equal(visible().length,1);assert.equal(visible()[0].dataset.toolId,'preeti-unicode');
  input('tool-search','not-a-tool');assert.equal(visible().length,0);assert.equal(get('no-tools').hidden,false);
  input('tool-search','');document.querySelector('[data-category-filter=files]').click();assert.equal(visible().length,2);
  document.querySelector('[data-favorite=photo-resizer]').click();assert.deepEqual(JSON.parse(localStorage.getItem('sajilo-favorites')),['photo-resizer']);
 }else{assert.equal(visible().length,2);document.querySelector('[data-favorite=photo-resizer]').click();assert.equal(visible().length,1);}
}else if(id==='date-converter'){
 await import('../src/scripts/date-tool.ts');assert.equal(get('date-result').hidden,false);assert.ok(get('date-year').value);assert.ok(get('date-day').value);click('date-example');assert.equal(get('date-result').hidden,false);assert.equal(get('result-iso').textContent,'BS 2082-01-01 = AD 2025-04-14');click('copy-date');assert.ok(copied[0].includes('AD: 2025-04-14'));
 input('date-day','३२');submit('date-form');assert.equal(get('form-error').hidden,false);assert.equal(get('date-result').hidden,true);
 document.querySelector('[data-direction=AD]').click();click('date-example');assert.equal(get('result-iso').textContent,'BS 2082-01-01 = AD 2025-04-14');
}else if(id==='age-calculator'){
 await import('../src/scripts/age-tool.ts');assert.equal(get('age-result').hidden,false);assert.ok(get('birth-year').value);assert.ok(get('cutoff-year').value);click('age-example');assert.equal(get('age-years').textContent,lang==='ne'?'२५':'25');assert.equal(get('age-months').textContent,lang==='ne'?'०':'0');click('copy-age');assert.ok(copied[0].includes('2000-02-29'));assert.ok(copied[0].includes('2025-02-28'));
 input('birth-year','२०३०');submit('age-form');assert.equal(get('form-error').hidden,false);assert.equal(get('age-result').hidden,true);
}else if(id==='preeti-unicode'){
 await import('../src/scripts/preeti-tool.ts');assert.equal(get('preeti-output').value,'नेपाल\nनिर्माण\nEmail: hello@example.com');click('preeti-example');assert.equal(get('preeti-output').value,'नेपाल\nनिर्माण\nEmail: hello@example.com');click('copy-preeti');assert.equal(copied[0],get('preeti-output').value);click('download-preeti');assert.equal(downloads[0].name,'sajilo-unicode.txt');
 input('preeti-input','[[<img src=x onerror=alert(1)>]]');submit('preeti-form');assert.equal(get('preeti-output').value,'<img src=x onerror=alert(1)>');assert.equal(document.querySelector('img[onerror]'),null);
 click('preeti-reset');assert.equal(get('preeti-output').value,'');assert.equal(get('copy-preeti').disabled,true);
}else if(id==='land-converter'){
 await import('../src/scripts/land-tool.ts');assert.equal(get('land-result').hidden,false);submit('land-form');assert.equal(get('land-sqft-result').textContent,lang==='ne'?'५,४७६':'5,476');click('copy-land');assert.ok(copied[0].includes(lang==='ne'?'५,४७६':'5,476'));
 change('land-system','decimal');change('land-unit','sqft');input('land-value','०');submit('land-form');assert.equal(get('land-sqft-result').textContent,lang==='ne'?'०':'0');
 input('land-value','-1');submit('land-form');assert.equal(get('form-error').hidden,false);assert.equal(get('land-result').hidden,true);
}else if(id==='photo-resizer'){
 const makeElement=document.createElement.bind(document);document.createElement=(name,...args)=>name==='canvas'?createCanvas(1,1):makeElement(name,...args);
 globalThis.createImageBitmap=async file=>{const img=await loadImage(Buffer.from(await file.arrayBuffer()));img.close=()=>{};return img;};
 const nativeFetch=globalThis.fetch;
 globalThis.fetch=async(url,...options)=>url===`${prefix}/examples/mountain-sample.jpg`?new Response(await readFile('public/examples/mountain-sample.jpg'),{headers:{'Content-Type':'image/jpeg'}}):nativeFetch(url,...options);
 await import('../src/scripts/photo-tool.ts');
 await until(()=>!get('photo-result').hidden);
 assert.ok(get('output-dimensions').textContent.includes(lang==='ne'?'८००':'800'));
 assert.equal(get('photo-sample-label').hidden,false);
 const source=createCanvas(640,480);const ctx=source.getContext('2d');ctx.fillStyle='#fa9';ctx.fillRect(0,0,640,480);ctx.fillStyle='#325';ctx.fillRect(150,150,150,150);
 const file=new File([source.toBuffer('image/png')],'synthetic.png',{type:'image/png'});
 Object.defineProperty(get('photo-file'),'files',{value:[file],configurable:true});get('photo-file').dispatchEvent(new window.Event('change',{bubbles:true}));await until(()=>!get('photo-controls').disabled);
 input('photo-width','240');assert.equal(get('photo-height').value,'180');change('photo-mode','crop');input('photo-height','240');submit('photo-form');await until(()=>!get('photo-result').hidden);
 assert.ok(get('output-dimensions').textContent.includes(lang==='ne'?'२४०':'240'));click('download-photo');assert.equal(downloads[0].name,'sajilo-photo.jpg');
 const blob=await (await fetch(downloads[0].href)).blob();assert.equal(blob.type,'image/jpeg');const decoded=await loadImage(Buffer.from(await blob.arrayBuffer()));assert.equal(decoded.width,240);assert.equal(decoded.height,240);
 assert.ok(get('output-size').textContent.includes(new Intl.NumberFormat(lang==='ne'?'ne-NP':'en-US').format(blob.size)));
 click('clear-photo');assert.equal(get('photo-result').hidden,true);assert.equal(get('process-photo').disabled,true);
}else throw new Error(`Unknown test ${id}`);
console.log(`PASS ${lang} / ${id} — generated HTML + event handlers`);
dom.window.close();process.exit(0);
