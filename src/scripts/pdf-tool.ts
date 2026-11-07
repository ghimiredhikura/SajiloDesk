import {el,t,setText,number} from './form-utils';
import type {PdfSource} from '../lib/pdf';
type Task='extract'|'merge'|'compress'|'image';
type Renderer=typeof import('../lib/pdf-render');
type Preview=ReturnType<typeof import('./pdf-preview')['createPdfPreview']>;
type Result={blob:Blob;bytes?:Uint8Array;pages:number;extension:string};
let task:Task='extract',sources:PdfSource[]=[],sample=true,busy=false,revision=0,resultUrl='';
let result:Result|undefined,previewIndex=0,previewMode:'original'|'result'='original',previewTicket=0;
const core=import('../lib/pdf');
let renderer:Promise<Renderer>|undefined,previewPromise:Promise<Preview>|undefined;
const render=()=>renderer||=import('../lib/pdf-render');
const preview=()=>previewPromise||=import('./pdf-preview').then(module=>module.createPdfPreview(el('pdf-preview'),el('pdf-preview-counter'),el('pdf-preview-status')));
const fileInput=el<HTMLInputElement>('pdf-file'),filePicker=el<HTMLSelectElement>('pdf-preview-file');
const active=()=>task==='merge'?sources:sources.slice(0,1);
const bytes=(size:number)=>size<1000000?`${number(size/1000,1)} KB`:`${number(size/1000000,2)} MB`;
const pdfBlob=(data:Uint8Array)=>new Blob([Uint8Array.from(data).buffer],{type:'application/pdf'});
const messages:Record<string,[string,string]>={
 'file-limit':['Each PDF must be 20 MiB or smaller.','हरेक PDF २० MiB भित्र हुनुपर्छ।'],
 'total-limit':['Choose up to 10 PDFs, totalling 50 MiB or less.','जम्मा ५० MiB भित्रका १० वटासम्म PDF छान्नुहोस्।'],
 'page-limit':['Use PDFs with up to 500 pages; merged output must also stay within 500 pages.','हरेक PDF र जोडेर बन्ने फाइल ५०० पानाभित्र हुनुपर्छ।'],
 'compress-limit':['Scanned-page rebuilding supports up to 50 pages. Use a text-preserving mode for longer PDFs.','स्क्यानका पाना पुनः बनाउन ५० पानासम्म मिल्छ। लामो PDF मा अक्षर कायम राख्ने विकल्प चलाउनुहोस्।'],
 pages:['Enter valid pages, such as 1, 3-5. Use only pages present in this PDF.','मिल्ने पाना राख्नुहोस्, जस्तै 1, 3-5। यस PDF मा भएकै पाना छान्नुहोस्।'],
 'image-page':['Choose one page number from this PDF.','यस PDF मा भएको एउटा पाना नम्बर राख्नुहोस्।'],
 'invalid-pdf':['This file could not be opened as a PDF. Try another PDF.','यो फाइल PDF का रूपमा खोल्न सकिएन। अर्को PDF छान्नुहोस्।'],
 encrypted:['Password-protected PDFs are not supported. Use an unlocked copy you are allowed to edit.','पासवर्ड भएको PDF चल्दैन। आफूले परिवर्तन गर्न मिल्ने, पासवर्ड नभएको प्रति प्रयोग गर्नुहोस्।'],
 signed:['Digitally signed PDFs are not supported. Use an unsigned copy; changing pages would invalidate its signature.','डिजिटल हस्ताक्षर भएको PDF चल्दैन। पाना बदल्दा हस्ताक्षर मान्य रहँदैन, त्यसैले हस्ताक्षर नभएको प्रति प्रयोग गर्नुहोस्।'],
 'form-pdf':['This operation does not support interactive forms. Use a non-interactive copy, or save a page as an image.','यो काममा भर्न मिल्ने फाराम चल्दैन। साधारण प्रति प्रयोग गर्नुहोस् वा पानालाई फोटो बनाउनुहोस्।'],
 'merge-count':['Add at least two PDFs to merge.','जोड्नका लागि कम्तीमा दुईवटा PDF राख्नुहोस्।'],
 empty:['Choose a PDF or use the example first.','पहिले PDF छान्नुहोस् वा नमुना चलाउनुहोस्।'],
};
function error(error:unknown){
 const code=error instanceof Error?error.message:'';if(code==='cancelled')return;
 setText('pdf-error',t(...(messages[code]||['Could not process this PDF. Try a smaller file or another browser.','यो PDF तयार हुन सकेन। सानो फाइल वा अर्को ब्राउजरमा प्रयास गर्नुहोस्।'])));
 el('pdf-error').hidden=false;el('pdf-error').focus();
}
async function showPreview(mode:'original'|'result'){
 const ticket=++previewTicket;previewMode=mode==='result'&&result?'result':'original';
 const source=active()[previewIndex]||active()[0],output=result;
 el('pdf-mode-original').setAttribute('aria-pressed',String(previewMode==='original'));
 el('pdf-mode-result').setAttribute('aria-pressed',String(previewMode==='result'));
 el<HTMLButtonElement>('pdf-mode-original').disabled=!sources.length;
 el<HTMLButtonElement>('pdf-mode-result').disabled=!output;
 const available=previewMode==='result'?!!output:!!source;
 el('pdf-result-empty').hidden=available;el('pdf-preview-wrapper').hidden=!available;
 filePicker.hidden=previewMode!=='original'||active().length<2;
 if(!available){if(previewPromise){const viewer=await previewPromise;if(ticket===previewTicket)viewer.clear();}return;}
 try{
  const viewer=await preview();if(ticket!==previewTicket)return;
  if(previewMode==='result'&&output){if(output.bytes)await viewer.pdf(output.bytes,output.pages);else viewer.image(output.blob);}
  else if(source)await viewer.pdf(source.bytes,source.pages);
 }catch(e){if(ticket===previewTicket)setText('pdf-preview-status',t('Preview unavailable. Your download is still available.','झलक खोल्न सकिएन। तयार भएको फाइल डाउनलोड गर्न मिल्छ।'));}
}
function invalidate(){
 revision++;result=undefined;if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl='';
 el('pdf-result').hidden=true;el('pdf-download').removeAttribute('href');el('pdf-error').hidden=true;
 el<HTMLButtonElement>('pdf-mode-result').disabled=true;void showPreview('original');
}
function setBusy(value:boolean){
 busy=value;el('pdf-form').setAttribute('aria-busy',String(value));
 el<HTMLFieldSetElement>('pdf-settings').disabled=value||!sources.length;el<HTMLButtonElement>('pdf-process').disabled=value||!sources.length;
 fileInput.disabled=value;el<HTMLButtonElement>('pdf-example').disabled=value;el<HTMLButtonElement>('pdf-clear').disabled=value;
 document.querySelectorAll<HTMLButtonElement>('[data-pdf-task],#pdf-files button').forEach(button=>button.disabled=value||button.dataset.boundary==='true');
 el('pdf-cancel').hidden=!value;
}
function fileList(){
 previewIndex=Math.min(previewIndex,Math.max(0,active().length-1));
 filePicker.replaceChildren(...active().map((source,index)=>new Option(source.name,String(index))));filePicker.value=String(previewIndex);
 el('pdf-files').replaceChildren(...active().map((source,index)=>{
  const row=document.createElement('li'),name=document.createElement('span'),meta=document.createElement('small');name.className='pdf-file-name';name.textContent=source.name;
  meta.textContent=`${number(source.pages,0)} ${t(source.pages===1?'page':'pages','पाना')} · ${bytes(source.bytes.length)}`;name.append(meta);row.append(name);
  const button=(text:string,title:string,action:()=>void,disabled=false)=>{
   const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',`${title}: ${source.name}`);b.disabled=disabled;b.dataset.boundary=String(disabled);b.addEventListener('click',action);row.append(b);
  };
  if(task==='merge')for(const direction of [-1,1])button(direction<0?'↑':'↓',direction<0?t('Move up','माथि सार्नुहोस्'):t('Move down','तल सार्नुहोस्'),()=>{
   const next=index+direction;[sources[index],sources[next]]=[sources[next],sources[index]];
   if(previewIndex===index)previewIndex=next;else if(previewIndex===next)previewIndex=index;
   invalidate();fileList();void showPreview('original');setText('pdf-status',t('File order updated.','फाइलको क्रम मिल्यो।'));
   (el('pdf-files').children[next]?.querySelector('button') as HTMLButtonElement)?.focus();
  },index+direction<0||index+direction>=sources.length);
  button('×',t('Remove','हटाउनुहोस्'),()=>{sources.splice(index,1);invalidate();fileList();void showPreview('original');setBusy(false);});return row;
 }));
 el('pdf-sample-label').hidden=!sample;
}
function modeNote(){
 const mode=el<HTMLSelectElement>('pdf-compression').value;
 setText('pdf-compression-note',mode==='scanned'
  ?t('Rebuilds pages as 250 DPI images. Selectable text, links and forms are lost. Up to 50 pages.','पाना २५० DPI का फोटो बन्छन्। अक्षर छान्न, लिङ्क खोल्न वा फाराम भर्न मिल्दैन। ५० पानासम्म।')
  :mode==='preserve'?t('Keeps text and image quality unchanged. Size reduction is not guaranteed.','अक्षर र फोटोको गुणस्तर जस्ताको तस्तै रहन्छ। साइज घट्छ नै भन्ने हुँदैन।')
  :t('Keeps text, vectors and image resolution. Optimises suitable JPEGs; some image detail may change.','अक्षर, रेखाचित्र र फोटोको मूल आकार कायम रहन्छ। मिल्ने JPEG को साइज घटाउँदा फोटोको सूक्ष्म विवरण केही बदलिन सक्छ।'));
}
function controls(){
 for(const key of ['extract','merge','compress','image'])el(`pdf-${key}-settings`).hidden=task!==key;
 document.querySelectorAll<HTMLElement>('[data-pdf-task]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pdfTask===task)));
 fileInput.multiple=task==='merge';
 setText('pdf-upload-label',task==='merge'?t('Add PDFs or drop them here','PDF थप्नुहोस् वा यहाँ राख्नुहोस्'):t('Choose a PDF or drop it here','PDF छान्नुहोस् वा यहाँ राख्नुहोस्'));
 const labels:Record<Task,[string,string]>={extract:['Extract pages','पाना छुट्याउनुहोस्'],merge:['Merge PDFs','PDF जोड्नुहोस्'],compress:['Compress PDF','साइज घटाउनुहोस्'],image:['Convert page','फोटो बनाउनुहोस्']};
 el('pdf-process').childNodes[0].textContent=t(...labels[task]);modeNote();fileList();setBusy(false);
}
async function choose(files:File[],asSample=false){
 if(busy||!files.length)return false;invalidate();setBusy(true);setText('pdf-status',t('Opening PDFs on your device…','PDF यही ब्राउजरमा खोलिँदैछ…'));const version=revision;
 try{
  const {pdfLimits,openPdf}=await core,keep=task==='merge'&&!sample&&!asSample?sources:[],selected=task==='merge'?files:files.slice(0,1);
  if(keep.length+selected.length>pdfLimits.files||keep.reduce((sum,s)=>sum+s.bytes.length,0)+selected.reduce((sum,f)=>sum+f.size,0)>pdfLimits.totalBytes)throw new Error('total-limit');
  const opened:PdfSource[]=[];for(const file of selected){if(version!==revision)throw new Error('cancelled');opened.push(await openPdf(file));}
  if(version!==revision)return false;sources=[...keep,...opened];sample=asSample;previewIndex=0;
  el<HTMLInputElement>('pdf-pages').value=asSample?'1, 3':'1';el<HTMLInputElement>('pdf-image-page').value='1';fileList();await showPreview('original');
  if(version!==revision)return false;
  setText('pdf-status',asSample?t('Example ready. Try any task.','नमुना तयार छ। चाहेको काम चलाएर हेर्नुहोस्।'):t('Ready. Scroll through the original, then create your file.','फाइल खुल्यो। मूल पाना हेरेर नतिजा तयार पार्नुहोस्।'));return true;
 }catch(e){if(version===revision){error(e);setText('pdf-status',t('Previous selection kept.','अघिल्लो फाइलको छनोट कायम छ।'));}return false;}
 finally{if(version===revision){setBusy(false);fileInput.value='';}}
}
async function useExample(auto=false){
 if(busy)return;const version=revision;setBusy(true);
 try{const {examplePdfs}=await core,files=await examplePdfs();if(version!==revision)return;setBusy(false);const opened=await choose(files,true);if(auto&&opened)await process(true);}
 catch(e){if(version===revision){setBusy(false);error(e);}}
}
async function process(initial=false){
 if(busy)return;invalidate();const version=revision,check=()=>{if(version!==revision)throw new Error('cancelled');};
 setBusy(true);setText('pdf-status',t('Working on your device…','फाइल यही ब्राउजरमा तयार हुँदैछ…'));
 let document:Awaited<ReturnType<Renderer['renderDocument']>>|undefined;
 try{
  const {pageSelection,copyPdfPages,pdfLimits,assertStaticPages}=await core;check();const source=active()[0];if(!source)throw new Error('empty');
  const originalSize=active().reduce((sum,s)=>sum+s.bytes.length,0),compression=el<HTMLSelectElement>('pdf-compression').value;
  let blob:Blob,count=source.pages,extension='pdf',unchanged=false,imageDimensions='',optimised=0;
  if(task==='extract'){
   const indices=pageSelection(el<HTMLInputElement>('pdf-pages').value,source.pages);count=indices.length;blob=pdfBlob(await copyPdfPages([{source,indices}],check));
  }else if(task==='merge'){
   if(sources.length<2)throw new Error('merge-count');count=sources.reduce((sum,s)=>sum+s.pages,0);if(count>pdfLimits.pages)throw new Error('page-limit');
   blob=pdfBlob(await copyPdfPages(sources.map(source=>({source,indices:source.document.getPageIndices()})),check));
  }else if(task==='compress'&&compression!=='scanned'){
   assertStaticPages([source]);
   if(compression==='preserve'){
    const {PDFDocument}=await import('pdf-lib'),copy=await PDFDocument.load(source.bytes,{updateMetadata:false});check();blob=pdfBlob(await copy.save({useObjectStreams:true}));
   }else{
    const {optimisePdfImages}=await import('../lib/pdf-compress');
    const output=await optimisePdfImages(source,compression==='smart'?.92:.85,check,(done,total)=>setText('pdf-status',`${t('Optimising image','फोटोको साइज घटाउँदै')} ${number(done,0)} / ${number(total,0)}`));
    optimised=output.changed;blob=pdfBlob(output.bytes);
   }
  }else{
   const rendering=await render();check();
   if(task==='image'){
    const value=el<HTMLInputElement>('pdf-image-page').value.replace(/[०-९]/g,c=>String(c.charCodeAt(0)-0x0966)).trim();
    if(!/^\d+$/.test(value)||Number(value)<1||Number(value)>source.pages)throw new Error('image-page');
    document=await rendering.renderDocument(source.bytes);check();
    const dpi=Number(el<HTMLSelectElement>('pdf-dpi').value),type=el<HTMLSelectElement>('pdf-image-format').value;
    const {canvas,dpi:effective}=await rendering.pageCanvas(document,Number(value),dpi);check();imageDimensions=`${number(canvas.width,0)} × ${number(canvas.height,0)} px · ${number(effective,0)} DPI`;
    try{const {imageDpi}=await import('../lib/image-dpi');blob=await imageDpi(await rendering.canvasBlob(canvas,type,.95),effective);}finally{canvas.width=canvas.height=0;}
    count=1;extension=type==='image/png'?'png':'jpg';
   }else{
    if(source.pages>pdfLimits.compressPages)throw new Error('compress-limit');document=await rendering.renderDocument(source.bytes);check();
    const {PDFDocument}=await import('pdf-lib'),output=await PDFDocument.create();let imageBytes=0;
    for(let page=1;page<=source.pages;page++){
     check();setText('pdf-status',`${t('Compressing page','साइज घटाउँदै: पाना')} ${number(page,0)} / ${number(source.pages,0)}`);
     const {canvas,width,height}=await rendering.pageCanvas(document,page,250);
     try{
      const jpeg=await rendering.canvasBlob(canvas,'image/jpeg',.9);check();imageBytes+=jpeg.size;
      if(imageBytes>=source.bytes.length){unchanged=true;break;}
      const image=await output.embedJpg(await jpeg.arrayBuffer());output.addPage([width,height]).drawImage(image,{x:0,y:0,width,height});
     }finally{canvas.width=canvas.height=0;}
     await new Promise(resolve=>setTimeout(resolve,0));
    }
    blob=unchanged?pdfBlob(source.bytes):pdfBlob(await output.save());
   }
  }
  check();await document?.destroy();document=undefined;
  if(task==='compress'&&blob.size>=source.bytes.length){blob=pdfBlob(source.bytes);unchanged=true;}
  const resultBytes=extension==='pdf'?(unchanged?source.bytes:new Uint8Array(await blob.arrayBuffer())):undefined;check();
  result={blob,bytes:resultBytes,pages:count,extension};resultUrl=URL.createObjectURL(blob);
  setText('pdf-output-size',bytes(blob.size));setText('pdf-output-pages',task==='image'?imageDimensions:`${t('Result','नतिजा')} · ${number(count,0)} ${t(count===1?'page':'pages','पाना')}`);
  let summary=t('Scroll to check every result page.','स्क्रोल गरेर नतिजाका सबै पाना जाँच्नुहोस्।');
  if(task==='compress')summary=unchanged?t('No smaller file at this quality. Original kept.','यो गुणस्तरमा साइज घटेन। मूल फाइल नै राखिएको छ।')
   :`${number((1-blob.size/originalSize)*100,1)}% ${t('smaller','सानो')} · ${bytes(originalSize)} → ${bytes(blob.size)}${compression!=='scanned'?` · ${t('Text kept','अक्षर कायम')}${optimised?` · ${number(optimised,0)} ${t(optimised===1?'image optimised':'images optimised','फोटोको साइज घटाइयो')}`:''}`:''}`;
  setText('pdf-summary',summary);const link=el<HTMLAnchorElement>('pdf-download');link.href=resultUrl;
  const base=source.name.replace(/\.pdf$/i,'').replace(/[^\p{L}\p{N}._-]+/gu,'-').slice(0,70)||'document';link.download=`${task==='merge'?'sajilo-merged':base}-${task}${unchanged?'-original':''}.${extension}`;
  el('pdf-result').hidden=false;await showPreview('result');check();
  setText('pdf-status',t('Ready to download. Your original is unchanged.','डाउनलोड गर्न तयार छ। मूल फाइलमा कुनै फेरबदल भएको छैन।'));
  if(!initial&&matchMedia('(max-width:600px)').matches)el('pdf-result').closest('section')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }catch(e){if(version===revision){error(e);setText('pdf-status',t('Check the settings and try again.','सेटिङ जाँचेर फेरि प्रयास गर्नुहोस्।'));}}
 finally{await document?.destroy();if(version===revision)setBusy(false);}
}
function clear(){sources=[];previewIndex=0;sample=false;invalidate();fileInput.value='';fileList();setBusy(false);setText('pdf-status',t('Choose a PDF or try the example.','PDF छान्नुहोस् वा नमुना चलाउनुहोस्।'));}
document.querySelectorAll<HTMLElement>('[data-pdf-task]').forEach(button=>button.addEventListener('click',async()=>{
 if(busy)return;task=button.dataset.pdfTask as Task;previewIndex=0;invalidate();controls();await showPreview('original');
 if(sample&&task==='merge'&&sources.length<2)await useExample();setText('pdf-status',t('Choose settings, then create your file.','सेटिङ मिलाएर फाइल तयार पार्नुहोस्।'));
}));
fileInput.addEventListener('change',()=>void choose([...fileInput.files||[]]));
const drop=el('pdf-drop');
for(const event of ['dragenter','dragover'])drop.addEventListener(event,e=>{e.preventDefault();if(!busy)drop.classList.add('dragover');});
for(const event of ['dragleave','drop'])drop.addEventListener(event,e=>{e.preventDefault();drop.classList.remove('dragover');});
drop.addEventListener('drop',e=>{if(!busy)void choose([...(e as DragEvent).dataTransfer?.files||[]]);});
el('pdf-settings').addEventListener('input',()=>{invalidate();modeNote();setText('pdf-status',t('Settings changed. Create your file again.','सेटिङ बदलियो। फाइल फेरि तयार पार्नुहोस्।'));});
el('pdf-form').addEventListener('submit',e=>{e.preventDefault();void process();});
el('pdf-example').addEventListener('click',()=>void useExample());
el('pdf-cancel').addEventListener('click',()=>{invalidate();setBusy(false);setText('pdf-status',t('Cancelled. No file was changed.','रद्द गरियो। कुनै फाइलमा फेरबदल भएको छैन।'));});
el('pdf-clear').addEventListener('click',()=>{if(!busy)clear();});
el('pdf-mode-original').addEventListener('click',()=>void showPreview('original'));
el('pdf-mode-result').addEventListener('click',()=>void showPreview('result'));
filePicker.addEventListener('change',()=>{previewIndex=Number(filePicker.value);void showPreview('original');});
el('pdf-preview-zoom').addEventListener('change',async()=>{(await preview()).setZoom(Number(el<HTMLSelectElement>('pdf-preview-zoom').value));});
window.addEventListener('pagehide',clear);
controls();void useExample(true);
