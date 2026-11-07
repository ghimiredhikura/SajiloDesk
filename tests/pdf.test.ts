import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument,degrees,PDFName,PDFNumber,PDFRawStream } from 'pdf-lib';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {jpegCandidate} from '../src/lib/pdf-compress';
import {imageDpi} from '../src/lib/image-dpi';
import { pageSelection,openPdf,copyPdfPages,examplePdfs,pdfLimits } from '../src/lib/pdf';
test('PDF page ranges accept Nepali digits, preserve requested order and reject invalid pages',()=>{
  assert.deepEqual(pageSelection('३, १–२, ३',4),[2,0,1]);
  assert.deepEqual(pageSelection('1, 3-5',5),[0,2,3,4]);
  for(const value of ['',',','0','1,','-1','2-1','1.5','6','1-99999999999','1 OR 2'])assert.throws(()=>pageSelection(value,5),/pages/);
});
test('PDF extraction and merging copy the right pages, order, dimensions and rotation',async()=>{
  const [first,second]=await Promise.all((await examplePdfs()).map(openPdf));
  first.document.getPage(2).setSize(320,480);first.document.getPage(2).setRotation(degrees(90));
  const bytes=await copyPdfPages([{source:first,indices:[2,0]},{source:second,indices:[1]}]);
  const result=await PDFDocument.load(bytes);
  assert.equal(result.getPageCount(),3);assert.equal(result.getPage(0).getWidth(),320);
  assert.equal(result.getPage(0).getRotation().angle,90);assert.equal(result.getPage(1).getWidth(),420);
  await assert.rejects(copyPdfPages([{source:first,indices:[0]}],()=>{throw new Error('cancelled');}),/cancelled/);
});
test('PDF opening rejects invalid, oversized and excessive-page input; form copying is explicit',async()=>{
  await assert.rejects(openPdf(new File(['not a PDF'],'bad.pdf',{type:'application/pdf'})),/invalid-pdf/);
  await assert.rejects(openPdf(new File([new Uint8Array(pdfLimits.fileBytes+1)],'large.pdf')),/file-limit/);
  const form=await PDFDocument.create();form.addPage();form.getForm().createTextField('name').setText('Example');
  const source=await openPdf(new File([Uint8Array.from(await form.save()).buffer],'form.pdf'));
  await assert.rejects(copyPdfPages([{source,indices:[0]}]),/form-pdf/);
  const large=await PDFDocument.create();for(let n=0;n<=pdfLimits.pages;n++)large.addPage([10,10]);
  await assert.rejects(openPdf(new File([Uint8Array.from(await large.save()).buffer],'pages.pdf')),/page-limit/);
});
test('JPEG optimisation accepts ordinary sRGB images but preserves masks, CMYK and oversized images',async()=>{
  const canvas=createCanvas(300,300),ctx=canvas.getContext('2d'),pixels=ctx.createImageData(300,300);let seed=29;
  for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;pixels.data[i]=seed&255;pixels.data[i+1]=seed>>>8&255;pixels.data[i+2]=seed>>>16&255;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);
  const doc=await PDFDocument.create(),image=await doc.embedJpg(canvas.toBuffer('image/jpeg',98));doc.addPage().drawImage(image);
  const loaded=await PDFDocument.load(await doc.save()),stream=loaded.context.enumerateIndirectObjects().map(([,object])=>object).find(object=>object instanceof PDFRawStream&&object.dict.get(PDFName.of('Filter'))===PDFName.of('DCTDecode')) as PDFRawStream;
  assert.deepEqual(jpegCandidate(stream),{width:300,height:300});
  const mask=stream.clone();mask.dict.set(PDFName.of('SMask'),loaded.context.obj({}));assert.equal(jpegCandidate(mask),undefined);
  const cmyk=stream.clone();cmyk.dict.set(PDFName.of('ColorSpace'),PDFName.of('DeviceCMYK'));assert.equal(jpegCandidate(cmyk),undefined);
  const large=stream.clone();large.dict.set(PDFName.of('Width'),PDFNumber.of(100000));assert.equal(jpegCandidate(large),undefined);
});
test('Export density metadata matches 300 DPI without changing PNG/JPEG pixels',async()=>{
 const canvas=createCanvas(120,80),ctx=canvas.getContext('2d');ctx.fillStyle='#f45231';ctx.fillRect(0,0,120,80);ctx.fillStyle='#192038';ctx.fillRect(15,15,60,40);
 for(const [format,mime] of [['png','image/png'],['jpeg','image/jpeg']] as const){
  const original=format==='png'?canvas.toBuffer('image/png'):canvas.toBuffer('image/jpeg'),output=Buffer.from(await(await imageDpi(new Blob([Uint8Array.from(original).buffer],{type:mime}),300)).arrayBuffer());
  const image=await loadImage(output);assert.deepEqual([image.width,image.height],[120,80]);
  const before=createCanvas(120,80),after=createCanvas(120,80);before.getContext('2d').drawImage(await loadImage(original),0,0);after.getContext('2d').drawImage(image,0,0);assert.deepEqual(after.getContext('2d').getImageData(0,0,120,80).data,before.getContext('2d').getImageData(0,0,120,80).data);
  if(format==='png'){const at=output.indexOf(Buffer.from('pHYs'));assert.ok(at>0);assert.equal(output.readUInt32BE(at+4),11811);assert.equal(output[at+12],1);}
  else{const at=output.indexOf(Buffer.from('JFIF\0'));assert.ok(at>0);assert.equal(output[at+7],1);assert.equal(output.readUInt16BE(at+8),300);assert.equal(output.readUInt16BE(at+10),300);}
 }
});
