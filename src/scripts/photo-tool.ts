import { integer } from '../lib/dates';
import { decimal } from '../lib/land';
import { readImage,processImage,type ImageFormat } from '../lib/images';
import { t,el,val,setText,number } from './form-utils';
import { downloadBlob } from './shared';
import { withBase } from '../lib/paths';
let bitmap:ImageBitmap|undefined,file:File|undefined,output:Blob|undefined,originalUrl='',outputUrl='',revision=0,busy=false;
let sampleRevision=0;
const fileInput=el<HTMLInputElement>('photo-file');
const errorMessages:Record<string,[string,string]>={
 'file-limit':['Choose a photo under 20 MiB.','२० MiB भन्दा सानो फोटो छान्नुहोस्।'],
 'file-type':['Choose a JPEG, PNG or still WebP image. HEIC, GIF, SVG and PDF are not supported.','JPEG, PNG वा स्थिर WebP छान्नुहोस्। HEIC, GIF, SVG र PDF चल्दैनन्।'],
 'pixel-limit':['That image is too large. Input limit: 24 MP; output limit: 16 MP; each side at most 12,000 px.','चित्र धेरै ठूलो छ। इनपुट २४ MP, नतिजा १६ MP र प्रत्येक किनारा १२,००० px सम्म राख्नुहोस्।'],
 'invalid-dimensions':['Enter positive whole-number dimensions in pixels.','पिक्सेलमा धनात्मक पूर्ण संख्या राख्नुहोस्।'],
 'invalid-number':['Enter valid dimensions or target size using Nepali or Latin digits.','नेपाली वा अंग्रेजी अंकमा मान्य पिक्सेल वा आकार राख्नुहोस्।'],
 'invalid-image':['This file is damaged or is not a supported image. Choose another photo.','यो फाइल बिग्रिएको वा समर्थन नभएको चित्र हो। अर्को फोटो छान्नुहोस्।'],
 'animated-image':['Use a still WebP image. Animated WebP is not supported.','स्थिर WebP राख्नुहोस्। चल्ने WebP समर्थित छैन।'],
 'decode-failed':['Your browser could not open this photo. Try a JPEG or a smaller file.','ब्राउजरले यो फोटो खोल्न सकेन। JPEG वा सानो फाइल प्रयास गर्नुहोस्।'],
 'target-range':['Choose a target between 1 KB and 20,000 KB, or leave it blank.','१ KB देखि २०,००० KB भित्र राख्नुहोस् वा खाली छोड्नुहोस्।'],
 'format-unavailable':['Your browser cannot encode that format. Please choose JPEG or PNG.','यो ब्राउजरले यो प्रकार बनाउन सकेन। JPEG वा PNG छान्नुहोस्।'],
 'encode-failed':['The image could not be saved. Try smaller dimensions.','फोटो बनाउन सकिएन। सानो पिक्सेल प्रयास गर्नुहोस्।'],
};
function showError(error:unknown){const code=error instanceof Error?error.message:'';if(code==='cancelled')return;const message=errorMessages[code]||['Could not process this photo. Try a smaller image.','फोटो प्रशोधन भएन। सानो फोटो प्रयास गर्नुहोस्।'];setText('photo-error',t(message[0],message[1]));el('photo-error').hidden=false;el('photo-error').focus();}
function invalidate(){revision++;output=undefined;if(outputUrl)URL.revokeObjectURL(outputUrl);outputUrl='';el<HTMLImageElement>('output-preview').removeAttribute('src');el('photo-result').hidden=true;el('result-empty').hidden=false;el('photo-error').hidden=true;}
function setBusy(value:boolean){busy=value;el<HTMLButtonElement>('process-photo').disabled=value||!bitmap;el<HTMLFieldSetElement>('photo-controls').disabled=value||!bitmap;el<HTMLButtonElement>('clear-photo').disabled=value;el<HTMLButtonElement>('photo-example').disabled=value;fileInput.disabled=value;el('cancel-photo').hidden=!value;setText('photo-status',value?t('Processing on your device…','तपाईंको यन्त्रमा प्रशोधन हुँदैछ…'):'');}
function release(){sampleRevision++;invalidate();bitmap?.close();bitmap=undefined;file=undefined;if(originalUrl)URL.revokeObjectURL(originalUrl);originalUrl='';el<HTMLImageElement>('original-preview').removeAttribute('src');el('original-block').hidden=true;el('clear-photo').hidden=true;el('photo-sample-label').hidden=true;fileInput.value='';setBusy(false);}
async function choose(selected:File,isSample=false){
 if(busy)return;release();const version=++revision;setText('photo-status',t('Opening your photo locally…','फोटो यहीँ खोलिँदैछ…'));
 el('photo-sample-label').hidden=!isSample;
 try{const opened=await readImage(selected);if(version!==revision){opened.close();return;}bitmap=opened;file=selected;
   originalUrl=URL.createObjectURL(selected);el<HTMLImageElement>('original-preview').src=originalUrl;
   setText('original-dimensions',`${number(bitmap.width,0)} × ${number(bitmap.height,0)} px`);setText('original-size',`${number(selected.size/1000,2)} KB (${number(selected.size,0)} ${t('bytes','बाइट')})`);
   el('original-block').hidden=false;el('clear-photo').hidden=false;
   const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));el<HTMLInputElement>('photo-width').value=String(Math.round(bitmap.width*scale));el<HTMLInputElement>('photo-height').value=String(Math.round(bitmap.height*scale));
   setBusy(false);setText('photo-status',t('Photo ready. Set your size, then preview.','फोटो तयार छ। आकार मिलाएर झलक हेर्नुहोस्।'));
 }catch(error){if(version===revision){setBusy(false);showError(error);}}
}
fileInput.addEventListener('change',()=>{const selected=fileInput.files?.[0];if(selected)void choose(selected);});
const drop=el('drop-zone');
for(const name of ['dragenter','dragover'])drop.addEventListener(name,e=>{e.preventDefault();drop.classList.add('dragover');});
for(const name of ['dragleave','drop'])drop.addEventListener(name,e=>{e.preventDefault();drop.classList.remove('dragover');});
drop.addEventListener('drop',e=>{const files=(e as DragEvent).dataTransfer?.files;if(files?.length&&!busy)void choose(files[0]);});
el('photo-controls').addEventListener('input',()=>{if(!busy)invalidate();});
for(const axis of ['width','height'])el(`photo-${axis}`).addEventListener('input',()=>{
  if(!bitmap||!el<HTMLInputElement>('lock-ratio').checked)return;
  try{const value=integer(val(`photo-${axis}`));const other=axis==='width'?'height':'width';el<HTMLInputElement>(`photo-${other}`).value=String(Math.max(1,Math.round(value*bitmap[other]/bitmap[axis as 'width'|'height'])));}catch{/* allow editing a temporarily empty field */}
});
el('photo-quality').addEventListener('input',()=>setText('quality-label',`${val('photo-quality')}%`));
el('photo-format').addEventListener('change',()=>{el('quality-control').hidden=val('photo-format')==='image/png';invalidate();});
el('photo-mode').addEventListener('change',()=>{if(val('photo-mode')==='crop')el<HTMLInputElement>('lock-ratio').checked=false;invalidate();});
el('lock-ratio').addEventListener('change',()=>{if(bitmap&&el<HTMLInputElement>('lock-ratio').checked){try{el<HTMLInputElement>('photo-height').value=String(Math.round(integer(val('photo-width'))*bitmap.height/bitmap.width));}catch{/* validation on submit */}}});
document.querySelectorAll<HTMLButtonElement>('[data-target]').forEach(b=>b.addEventListener('click',()=>{el<HTMLInputElement>('photo-target').value=b.dataset.target!;invalidate();}));
async function generate(){
 if(!bitmap||!file||busy)return;
 invalidate();const version=revision;
 try{
   const width=integer(val('photo-width')),height=integer(val('photo-height'));const target=val('photo-target').trim()?decimal(val('photo-target'))*1000:undefined;
   setBusy(true);
   const result=await processImage(bitmap,{width,height,mode:val('photo-mode') as 'fit'|'crop',format:val('photo-format') as ImageFormat,quality:Number(val('photo-quality'))/100,targetBytes:target},()=>revision!==version);
   if(revision!==version)return;
   output=result.blob;outputUrl=URL.createObjectURL(output);el<HTMLImageElement>('output-preview').src=outputUrl;
   setText('output-dimensions',`${number(result.width,0)} × ${number(result.height,0)} px`);setText('output-size',`${number(output.size/1000,2)} KB (${number(output.size,0)} ${t('bytes','बाइट')})`);
   const reduction=(1-output.size/file.size)*100;
   setText('photo-summary',`${reduction>=0?`${number(reduction,1)}% ${t('smaller','सानो')}`:`${number(-reduction,1)}% ${t('larger','ठूलो')}`} · ${output.type.replace('image/','').toUpperCase()}${output.type==='image/png'?'':` · ${t('Quality','गुणस्तर')} ${number(result.quality*100,0)}%`}`);
   el('target-notice').hidden=result.metTarget;el('reduce-dimensions').hidden=result.metTarget;
   setText('target-notice',t(`This output is ${number(output.size/1000,2)} KB, above your ${number((target||0)/1000)} KB target. Try smaller dimensions or another format.`,`यो नतिजा ${number(output.size/1000,2)} KB छ, चाहिएको ${number((target||0)/1000)} KB भन्दा ठूलो। पिक्सेल घटाउनुहोस् वा प्रकार बदल्नुहोस्।`));
   el('photo-result').hidden=false;el('result-empty').hidden=true;
 }catch(error){if(revision===version)showError(error);}
 finally{setBusy(false);}
}
el('photo-form').addEventListener('submit',e=>{e.preventDefault();void generate();});
el('cancel-photo').addEventListener('click',()=>{revision++;setText('photo-status',t('Cancelling after the current encoding step…','हालको चरणपछि रद्द हुँदैछ…'));});
el('clear-photo').addEventListener('click',()=>{if(busy){revision++;return;}release();});
el('reduce-dimensions').addEventListener('click',()=>{try{el<HTMLInputElement>('photo-width').value=String(Math.max(1,Math.floor(integer(val('photo-width'))*.75)));el<HTMLInputElement>('photo-height').value=String(Math.max(1,Math.floor(integer(val('photo-height'))*.75)));void generate();}catch(error){showError(error);}});
el('download-photo').addEventListener('click',()=>{if(output)downloadBlob(output,`sajilo-photo.${output.type==='image/jpeg'?'jpg':output.type==='image/png'?'png':'webp'}`);});
window.addEventListener('pagehide',()=>{sampleRevision++;revision++;bitmap?.close();if(originalUrl)URL.revokeObjectURL(originalUrl);if(outputUrl)URL.revokeObjectURL(outputUrl);});

async function loadSample(){
 if(busy)return;
 const version=++sampleRevision;
 el<HTMLButtonElement>('photo-example').disabled=true;
 setText('photo-status',t('Loading the example image…','उदाहरण चित्र खोलिँदैछ…'));
 try{
   const response=await fetch(withBase('examples/mountain-sample.jpg'));
   if(!response.ok)throw new Error('sample-unavailable');
   const blob=await response.blob();
   if(version!==sampleRevision)return;
   const sampleFile=new File([blob],'sajilo-example.jpg',{type:'image/jpeg'});
   await choose(sampleFile,true);
   if(!bitmap||file!==sampleFile)return;
   el<HTMLInputElement>('photo-width').value='800';el<HTMLInputElement>('photo-height').value='500';
   el<HTMLSelectElement>('photo-format').value='image/jpeg';el<HTMLSelectElement>('photo-mode').value='fit';
   el<HTMLInputElement>('lock-ratio').checked=true;el<HTMLInputElement>('photo-quality').value='85';setText('quality-label','85%');
   el('quality-control').hidden=false;el<HTMLInputElement>('photo-target').value='200';
   await generate();
 }catch{
   if(version===sampleRevision)setText('photo-status',t('Example unavailable. Choose your own photo to continue.','उदाहरण खुलेन। आफ्नो फोटो छानेर अगाडि बढ्नुहोस्।'));
 }finally{el<HTMLButtonElement>('photo-example').disabled=busy;}
}
el('photo-example').addEventListener('click',()=>{void loadSample();});
void loadSample();
