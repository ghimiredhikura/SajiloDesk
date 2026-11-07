import { getDocument,GlobalWorkerOptions,type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { withBase } from './paths';
GlobalWorkerOptions.workerSrc=workerUrl;
export async function renderDocument(bytes:Uint8Array){
  const resource=(path:string)=>new URL(withBase(`vendor/pdfjs/${path}/`),window.location.href).href;
  const loading=getDocument({
    data:Uint8Array.from(bytes),cMapUrl:resource('cmaps'),cMapPacked:true,
    standardFontDataUrl:resource('standard_fonts'),wasmUrl:resource('wasm'),
    iccUrl:resource('iccs'),disableWorkerRendering:true,
    canvasMaxAreaInBytes:48000000,stopAtErrors:true,
  });
  try{return Object.assign(await loading.promise,{destroy:()=>loading.destroy()});}
  catch(error){await loading.destroy();throw error;}
}
export async function pageCanvas(document:PDFDocumentProxy,index:number,dpi:number){
  const page=await document.getPage(index),size=page.getViewport({scale:1});
  const scale=Math.min(dpi/72,Math.sqrt(12000000/(size.width*size.height)),4096/Math.max(size.width,size.height));
  const viewport=page.getViewport({scale}),canvas=window.document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  try{await page.render({canvas,viewport,background:'rgb(255,255,255)'}).promise;}
  catch(error){canvas.width=canvas.height=0;throw error;}
  page.cleanup();return {canvas,width:size.width,height:size.height};
}
export async function canvasBlob(canvas:HTMLCanvasElement,type:string,quality=.85):Promise<Blob>{
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('render')),type,quality));
}
